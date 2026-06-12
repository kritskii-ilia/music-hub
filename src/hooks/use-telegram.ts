"use client";

import { useEffect, useMemo } from "react";

import {
  detectTelegramLaunchContext,
  parseInitDataUnsafe,
  type TelegramInitDataUnsafe,
} from "@/lib/telegram-launch";

type ThemeParams = Record<string, string>;

type TelegramWebApp = {
  ready: () => void;
  expand: () => void;
  initData: string;
  initDataUnsafe?: TelegramInitDataUnsafe;
  themeParams?: ThemeParams;
  colorScheme?: "light" | "dark";
  viewportHeight?: number;
  viewportStableHeight?: number;
  platform?: string;
};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export function useTelegram() {
  const webApp = typeof window !== "undefined" ? window.Telegram?.WebApp ?? null : null;
  const initData = webApp?.initData ?? "";
  const initDataUnsafe = webApp?.initDataUnsafe ?? parseInitDataUnsafe(initData);

  useEffect(() => {
    if (webApp) {
      webApp.ready();
      webApp.expand();
    }
  }, [webApp]);

  return useMemo(
    () => ({
      webApp,
      initData,
      initDataUnsafe,
      isTelegram: Boolean(webApp),
      themeParams: webApp?.themeParams ?? {},
      colorScheme: webApp?.colorScheme ?? "dark",
      viewportHeight: webApp?.viewportHeight ?? null,
      viewportStableHeight: webApp?.viewportStableHeight ?? null,
      platform: webApp?.platform ?? "unknown",
      launchContext: detectTelegramLaunchContext({
        isTelegram: Boolean(webApp),
        initDataUnsafe,
      }),
    }),
    [initData, initDataUnsafe, webApp],
  );
}
