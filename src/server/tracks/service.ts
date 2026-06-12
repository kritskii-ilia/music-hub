import type { Prisma } from "@prisma/client";
import { ImportStatus, ImportSourceType, TrackSourceType } from "@prisma/client";

import { sanitizeText, slugifyFilename } from "@/lib/utils";
import { ApiError } from "@/server/api/errors";
import { prisma } from "@/server/db/prisma";
import type { NormalizedMedia } from "@/server/tracks/media";
import { uploadObject } from "@/server/storage/s3";

type ImportTrackInput = {
  ownerUserId: string;
  sourceType: TrackSourceType;
  telegramFileId?: string | null;
  telegramUniqueFileId?: string | null;
  normalizedMedia: NormalizedMedia;
  buffer: Buffer;
};

export function buildTrackWhereInput(ownerUserId: string, query: {
  q?: string;
  favorites?: boolean;
  cover?: "with" | "without";
  recent?: boolean;
}) {
  const where: Prisma.TrackWhereInput = {
    ownerUserId,
  };

  if (query.q) {
    where.OR = [
      { title: { contains: query.q, mode: "insensitive" } },
      { artist: { contains: query.q, mode: "insensitive" } },
      { album: { contains: query.q, mode: "insensitive" } },
    ];
  }

  if (query.favorites) {
    where.isFavorite = true;
  }

  if (query.cover === "with") {
    where.coverImageUrl = { not: null };
  } else if (query.cover === "without") {
    where.coverImageUrl = null;
  }

  if (query.recent) {
    where.createdAt = {
      gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
    };
  }

  return where;
}

export function buildTrackOrderBy(sort: "newest" | "oldest" | "title" | "artist") {
  switch (sort) {
    case "oldest":
      return { createdAt: "asc" as const };
    case "title":
      return [{ title: "asc" as const }, { createdAt: "desc" as const }];
    case "artist":
      return [{ artist: "asc" as const }, { createdAt: "desc" as const }];
    case "newest":
    default:
      return { createdAt: "desc" as const };
  }
}

export function applyRequestedOrder(
  orderBy: ReturnType<typeof buildTrackOrderBy>,
  order: "asc" | "desc" | undefined,
) {
  if (!order) {
    return orderBy;
  }

  if (Array.isArray(orderBy)) {
    return orderBy.map((entry, index) => {
      const original = entry as unknown as Record<string, "asc" | "desc">;
      const [key] = Object.keys(original);
      return {
        [key]: index === 0 ? order : original[key],
      };
    });
  }

  const original = orderBy as Record<string, "asc" | "desc">;
  const [key] = Object.keys(original);
  return {
    [key]: order,
  };
}

export async function importTrack(input: ImportTrackInput) {
  const duplicate = await prisma.track.findFirst({
    where: {
      ownerUserId: input.ownerUserId,
      OR: [
        input.telegramUniqueFileId ? { telegramUniqueFileId: input.telegramUniqueFileId } : undefined,
        input.normalizedMedia.checksumSha256 ? { checksumSha256: input.normalizedMedia.checksumSha256 } : undefined,
      ].filter(Boolean) as Prisma.TrackWhereInput[],
    },
  });

  if (duplicate) {
    await prisma.importLog.create({
      data: {
        ownerUserId: input.ownerUserId,
        trackId: duplicate.id,
        sourceType:
          input.sourceType === TrackSourceType.upload ? ImportSourceType.upload : ImportSourceType.telegram_audio,
        status: ImportStatus.duplicate,
        telegramFileId: input.telegramFileId ?? null,
        telegramUniqueFileId: input.telegramUniqueFileId ?? null,
        checksumSha256: input.normalizedMedia.checksumSha256,
      },
    });

    return { track: duplicate, deduplicated: true };
  }

  const safeName = slugifyFilename(
    `${input.ownerUserId}-${Date.now()}-${input.normalizedMedia.title}${input.normalizedMedia.extension}`,
  );
  const storageKey = `tracks/${input.ownerUserId}/${safeName}`;
  const fileUrl = await uploadObject({
    key: storageKey,
    body: input.buffer,
    contentType: input.normalizedMedia.mimeType,
  });

  const track = await prisma.track.create({
    data: {
      ownerUserId: input.ownerUserId,
      sourceType: input.sourceType,
      telegramFileId: input.telegramFileId ?? null,
      telegramUniqueFileId: input.telegramUniqueFileId ?? null,
      checksumSha256: input.normalizedMedia.checksumSha256,
      fileStorageKey: storageKey,
      fileUrl,
      title: sanitizeText(input.normalizedMedia.title, "Unknown Title"),
      artist: sanitizeText(input.normalizedMedia.artist, "Unknown Artist"),
      album: sanitizeText(input.normalizedMedia.album ?? null) || null,
      durationSec: input.normalizedMedia.durationSec,
      mimeType: input.normalizedMedia.mimeType,
      fileSize: input.normalizedMedia.size,
      coverImageUrl: null,
      lyrics: null,
    },
  });

  await prisma.importLog.create({
    data: {
      ownerUserId: input.ownerUserId,
      trackId: track.id,
      sourceType:
        input.sourceType === TrackSourceType.upload ? ImportSourceType.upload : ImportSourceType.telegram_audio,
      status: ImportStatus.success,
      telegramFileId: input.telegramFileId ?? null,
      telegramUniqueFileId: input.telegramUniqueFileId ?? null,
      checksumSha256: input.normalizedMedia.checksumSha256,
    },
  });

  return { track, deduplicated: false };
}

export async function getTrackById(ownerUserId: string, trackId: string) {
  const track = await prisma.track.findFirst({
    where: {
      id: trackId,
      ownerUserId,
    },
  });

  if (!track) {
    throw new ApiError(404, "NOT_FOUND", "Track not found.");
  }

  return track;
}
