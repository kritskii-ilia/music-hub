import { TrackSourceType } from "@prisma/client";

import { env } from "@/lib/env";
import { jsonError, jsonOk } from "@/server/api/response";
import { prisma } from "@/server/db/prisma";
import { normalizeAudioBuffer } from "@/server/tracks/media";
import { importTrack } from "@/server/tracks/service";
import { telegramTrackImportSchema } from "@/server/tracks/schemas";
import { fetchTelegramFileBuffer } from "@/server/telegram/bot";

export async function POST(request: Request) {
  try {
    if (request.headers.get("x-telegram-bot-token") !== env.TELEGRAM_BOT_TOKEN) {
      return Response.json(
        {
          error: {
            code: "UNAUTHORIZED",
            message: "Invalid bot token.",
          },
        },
        { status: 401 },
      );
    }

    const body = telegramTrackImportSchema.parse(await request.json());
    const user = await prisma.user.findUnique({
      where: {
        telegramUserId: body.telegramUserId,
      },
    });

    if (!user) {
      return Response.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "User not initialized in MyMusic.",
          },
        },
        { status: 404 },
      );
    }

    const buffer = await fetchTelegramFileBuffer(body.fileId);
    const normalizedMedia = await normalizeAudioBuffer({
      buffer,
      mimeType: body.mimeType,
      originalFileName: body.originalFileName,
      title: body.title,
      artist: body.artist,
    });

    const result = await importTrack({
      ownerUserId: user.id,
      sourceType: TrackSourceType.forwarded_from_bot_chat,
      telegramFileId: body.fileId,
      telegramUniqueFileId: body.uniqueFileId,
      normalizedMedia,
      buffer,
    });

    return jsonOk(result, { status: result.deduplicated ? 200 : 201 });
  } catch (error) {
    return jsonError(error);
  }
}
