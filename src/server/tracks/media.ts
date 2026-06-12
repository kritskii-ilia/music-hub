import crypto from "node:crypto";
import path from "node:path";

import { parseBuffer } from "music-metadata";

import { env } from "@/lib/env";
import { sanitizeText } from "@/lib/utils";
import { ApiError } from "@/server/api/errors";

const supportedMimeTypes = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/x-m4a",
  "audio/aac",
  "audio/ogg",
  "audio/flac",
  "audio/x-flac",
  "application/ogg",
]);

const supportedExtensions = new Set([".mp3", ".m4a", ".aac", ".ogg", ".flac"]);

export type NormalizedMedia = {
  mimeType: string;
  extension: string;
  size: number;
  checksumSha256: string;
  title: string;
  artist: string;
  album: string | null;
  durationSec: number | null;
  originalFileName: string;
};

export function isSupportedMusicDocument(mimeType: string | null | undefined, fileName: string | null | undefined) {
  const normalizedMime = mimeType?.toLowerCase() ?? "";
  const extension = fileName ? path.extname(fileName).toLowerCase() : "";

  return supportedMimeTypes.has(normalizedMime) || supportedExtensions.has(extension);
}

export function assertUploadWithinLimit(size: number) {
  if (size > env.MAX_UPLOAD_BYTES) {
    throw new ApiError(413, "FILE_TOO_LARGE", "Uploaded file exceeds the configured size limit.");
  }
}

export async function normalizeAudioBuffer(input: {
  buffer: Buffer;
  mimeType: string;
  originalFileName: string;
  title?: string | null;
  artist?: string | null;
}) {
  assertUploadWithinLimit(input.buffer.byteLength);

  if (!isSupportedMusicDocument(input.mimeType, input.originalFileName)) {
    throw new ApiError(415, "UNSUPPORTED_MEDIA", "Only music audio files are supported.");
  }

  const metadata = await parseBuffer(input.buffer, input.mimeType, { duration: true }).catch(() => null);
  const checksumSha256 = crypto.createHash("sha256").update(input.buffer).digest("hex");
  const extension = path.extname(input.originalFileName).toLowerCase() || mimeToDefaultExtension(input.mimeType);

  return {
    mimeType: input.mimeType,
    extension,
    size: input.buffer.byteLength,
    checksumSha256,
    title: sanitizeText(input.title ?? metadata?.common.title ?? path.basename(input.originalFileName, extension), "Unknown Title"),
    artist: sanitizeText(input.artist ?? metadata?.common.artist ?? "Unknown Artist", "Unknown Artist"),
    album: sanitizeText(metadata?.common.album ?? null) || null,
    durationSec: metadata?.format.duration ? Math.round(metadata.format.duration) : null,
    originalFileName: input.originalFileName,
  } satisfies NormalizedMedia;
}

function mimeToDefaultExtension(mimeType: string) {
  switch (mimeType) {
    case "audio/mp4":
    case "audio/x-m4a":
      return ".m4a";
    case "audio/aac":
      return ".aac";
    case "audio/ogg":
    case "application/ogg":
      return ".ogg";
    case "audio/flac":
    case "audio/x-flac":
      return ".flac";
    default:
      return ".mp3";
  }
}

export function discriminateTelegramMessageMedia(message: {
  audio?: unknown;
  document?: { mime_type?: string; file_name?: string } | null;
  voice?: unknown;
  video_note?: unknown;
}) {
  if (message.voice) {
    return { kind: "voice" as const };
  }

  if (message.video_note) {
    return { kind: "video_note" as const };
  }

  if (message.audio) {
    return { kind: "audio" as const };
  }

  if (
    message.document &&
    isSupportedMusicDocument(message.document.mime_type ?? null, message.document.file_name ?? null)
  ) {
    return { kind: "document" as const };
  }

  return { kind: "unsupported" as const };
}
