import crypto from "node:crypto";

import { ApiError } from "@/server/api/errors";

export type TelegramMiniAppUser = {
  id: number;
  is_bot?: boolean;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
};

export type ParsedInitData = {
  authDate: number;
  hash: string;
  queryId?: string;
  user: TelegramMiniAppUser;
};

export function parseInitData(initData: string): ParsedInitData {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  const authDateValue = params.get("auth_date");
  const userValue = params.get("user");

  if (!hash || !authDateValue || !userValue) {
    throw new ApiError(400, "INVALID_INIT_DATA", "Telegram init data is incomplete.");
  }

  const user = JSON.parse(userValue) as TelegramMiniAppUser;
  const authDate = Number.parseInt(authDateValue, 10);

  if (!Number.isFinite(authDate) || !user?.id) {
    throw new ApiError(400, "INVALID_INIT_DATA", "Telegram init data is malformed.");
  }

  return {
    authDate,
    hash,
    queryId: params.get("query_id") ?? undefined,
    user,
  };
}

export function buildDataCheckString(initData: string) {
  const params = new URLSearchParams(initData);
  const entries = [...params.entries()]
    .filter(([key]) => key !== "hash")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`);

  return entries.join("\n");
}

export function verifyTelegramInitData(initData: string, botToken: string, maxAgeSeconds = 60 * 60) {
  const parsed = parseInitData(initData);
  const dataCheckString = buildDataCheckString(initData);
  const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
  const computedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

  if (computedHash !== parsed.hash) {
    throw new ApiError(401, "TELEGRAM_AUTH_FAILED", "Telegram signature verification failed.");
  }

  const ageSeconds = Math.floor(Date.now() / 1000) - parsed.authDate;
  if (ageSeconds > maxAgeSeconds) {
    throw new ApiError(401, "TELEGRAM_AUTH_FAILED", "Telegram init data is expired.");
  }

  return parsed;
}
