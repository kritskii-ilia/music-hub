import { env } from "@/lib/env";
import { bot } from "@/server/telegram/bot";

async function main() {
  if (env.TELEGRAM_BOT_MODE === "polling") {
    await bot.api.deleteWebhook({
      drop_pending_updates: false,
    });
  }

  await bot.start({
    onStart() {
      console.log("MyMusic bot polling started");
    },
  });
}

void main();
