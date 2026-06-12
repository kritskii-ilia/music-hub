import { env } from "@/lib/env";
import { createTelegramWebhookHandler } from "@/server/telegram/bot";

export async function POST(request: Request) {
  if (request.headers.get("x-telegram-bot-api-secret-token") !== env.TELEGRAM_WEBHOOK_SECRET) {
    return Response.json(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "Invalid webhook secret.",
        },
      },
      { status: 401 },
    );
  }

  return createTelegramWebhookHandler()(request);
}
