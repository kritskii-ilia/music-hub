import { env } from "@/lib/env";
import { ApiError } from "@/server/api/errors";
import { signSession, setSessionCookie } from "@/server/auth/session";
import { upsertTelegramUser } from "@/server/auth/user";
import { verifyTelegramInitData } from "@/server/auth/telegram";
import { jsonError, jsonOk } from "@/server/api/response";
import { assertRateLimit } from "@/server/api/ratelimit";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { initData?: string };

    if (!body.initData) {
      throw new ApiError(400, "INVALID_INIT_DATA", "initData is required.");
    }

    assertRateLimit(`auth:${request.headers.get("x-forwarded-for") ?? "local"}`, 20, 60_000);

    const parsed = verifyTelegramInitData(body.initData, env.TELEGRAM_BOT_TOKEN);
    const user = await upsertTelegramUser(parsed.user);
    const token = await signSession({
      sub: user.id,
      telegramUserId: user.telegramUserId,
    });

    await setSessionCookie(token);

    return jsonOk({
      user,
    });
  } catch (error) {
    return jsonError(error);
  }
}
