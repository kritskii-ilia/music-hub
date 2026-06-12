import { env } from "@/lib/env";

export function getMiniAppDirectLink() {
  return `https://t.me/${env.TELEGRAM_BOT_USERNAME}/${env.TELEGRAM_MINI_APP_SHORT_NAME}`;
}

export function getAttachmentMenuInstallLink() {
  const params = new URLSearchParams({
    startattach: env.ATTACHMENT_MENU_START_PARAM,
    choose: "users+groups+channels+bots",
  });

  return `https://t.me/${env.TELEGRAM_BOT_USERNAME}?${params.toString()}`;
}
