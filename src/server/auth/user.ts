import { prisma } from "@/server/db/prisma";

import type { TelegramMiniAppUser } from "./telegram";

export async function upsertTelegramUser(user: TelegramMiniAppUser) {
  return prisma.user.upsert({
    where: {
      telegramUserId: String(user.id),
    },
    update: {
      username: user.username ?? null,
      firstName: user.first_name ?? null,
      lastName: user.last_name ?? null,
      languageCode: user.language_code ?? null,
      isPremium: Boolean(user.is_premium),
      photoUrl: user.photo_url ?? null,
    },
    create: {
      telegramUserId: String(user.id),
      username: user.username ?? null,
      firstName: user.first_name ?? null,
      lastName: user.last_name ?? null,
      languageCode: user.language_code ?? null,
      isPremium: Boolean(user.is_premium),
      photoUrl: user.photo_url ?? null,
    },
  });
}
