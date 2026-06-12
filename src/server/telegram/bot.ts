import { Bot, InlineKeyboard, webhookCallback } from "grammy";
import { TrackSourceType } from "@prisma/client";

import { env } from "@/lib/env";
import { ApiError } from "@/server/api/errors";
import { prisma } from "@/server/db/prisma";
import {
  getAttachmentMenuInstallLink,
  getMiniAppDirectLink,
} from "@/server/telegram/links";
import { normalizeAudioBuffer, discriminateTelegramMessageMedia } from "@/server/tracks/media";
import { importTrack } from "@/server/tracks/service";

export const bot = new Bot(env.TELEGRAM_BOT_TOKEN);

const openMyMusicKeyboard = new InlineKeyboard()
  .webApp("Open MyMusic", env.APP_URL)
  .row()
  .url("Install in 📎", getAttachmentMenuInstallLink())
  .url("Direct Link", getMiniAppDirectLink());

export async function fetchTelegramFileBuffer(fileId: string) {
  const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`);
  const payload = (await response.json()) as {
    ok: boolean;
    result?: { file_path?: string };
  };

  if (!payload.ok || !payload.result?.file_path) {
    throw new ApiError(502, "TELEGRAM_FILE_FETCH_FAILED", "Failed to resolve Telegram file path.");
  }

  const fileResponse = await fetch(
    `https://api.telegram.org/file/bot${env.TELEGRAM_BOT_TOKEN}/${payload.result.file_path}`,
  );

  if (!fileResponse.ok) {
    throw new ApiError(502, "TELEGRAM_FILE_FETCH_FAILED", "Failed to download Telegram file.");
  }

  return Buffer.from(await fileResponse.arrayBuffer());
}

bot.command("start", async (ctx) => {
  await ctx.reply(
    [
      "MyMusic keeps only the music you intentionally add, without mixing in Telegram audio clutter.",
      "",
      "How to use it:",
      "1. Tap Open MyMusic to launch the Mini App now.",
      "2. Tap Install in 📎 to add MyMusic to the Telegram attachment menu.",
      "3. After installation, open a supported chat, press 📎, and choose MyMusic.",
      "4. You can still forward an audio track here to import it into your library.",
    ].join("\n"),
    {
      reply_markup: openMyMusicKeyboard,
    },
  );
});

bot.on("message", async (ctx) => {
  const message = ctx.message;
  const mediaKind = discriminateTelegramMessageMedia({
    audio: message.audio,
    document: message.document,
    voice: message.voice,
    video_note: message.video_note,
  });

  if (mediaKind.kind === "voice") {
    await ctx.reply("Voice messages are not supported. Send a music file such as MP3, M4A, AAC, OGG, or FLAC.");
    return;
  }

  if (mediaKind.kind === "video_note") {
    await ctx.reply("Video notes are not part of the music library. Please send a normal music file.");
    return;
  }

  if (mediaKind.kind === "unsupported") {
    await ctx.reply(
      "Unsupported file. Send a Telegram audio track or a music document in MP3, M4A, AAC, OGG, or FLAC format.",
    );
    return;
  }

  const telegramUserId = String(ctx.from.id);
  const owner = await prisma.user.findUnique({
    where: {
      telegramUserId,
    },
  });

  if (!owner) {
    await ctx.reply("Open MyMusic once before importing so the account can be created.", {
      reply_markup: openMyMusicKeyboard,
    });
    return;
  }

  const audio = message.audio;
  const document = message.document;
  const source = audio
    ? {
        fileId: audio.file_id,
        uniqueFileId: audio.file_unique_id,
        mimeType: audio.mime_type ?? "audio/mpeg",
        fileName: audio.file_name ?? `${audio.title ?? "track"}.mp3`,
        title: audio.title ?? undefined,
        artist: audio.performer ?? undefined,
      }
    : {
        fileId: document!.file_id,
        uniqueFileId: document!.file_unique_id,
        mimeType: document!.mime_type ?? "audio/mpeg",
        fileName: document!.file_name ?? "track",
        title: undefined,
        artist: undefined,
      };

  try {
    const buffer = await fetchTelegramFileBuffer(source.fileId);
    const normalized = await normalizeAudioBuffer({
      buffer,
      mimeType: source.mimeType,
      originalFileName: source.fileName,
      title: source.title,
      artist: source.artist,
    });
    const result = await importTrack({
      ownerUserId: owner.id,
      sourceType: TrackSourceType.forwarded_from_bot_chat,
      telegramFileId: source.fileId,
      telegramUniqueFileId: source.uniqueFileId,
      normalizedMedia: normalized,
      buffer,
    });

    await ctx.reply(
      result.deduplicated
        ? `Track already exists in your library: ${result.track.artist} - ${result.track.title}`
        : `Track added: ${result.track.artist} - ${result.track.title}`,
      { reply_markup: openMyMusicKeyboard },
    );
  } catch (error) {
    console.error("Telegram import failed", error);
    await ctx.reply("Could not import this file. Ensure it is a supported music format and try again.", {
      reply_markup: openMyMusicKeyboard,
    });
  }
});

export function createTelegramWebhookHandler() {
  return webhookCallback(bot, "std/http");
}
