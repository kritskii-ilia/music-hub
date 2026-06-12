"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useTelegram } from "@/hooks/use-telegram";
import { apiPath } from "@/lib/paths";

export function AuthBootstrap() {
  const { initData, isTelegram, launchContext } = useTelegram();
  const [status, setStatus] = useState<"idle" | "ready" | "failed">("idle");

  useEffect(() => {
    if (!isTelegram || !initData) {
      return;
    }

    void fetch(apiPath("/api/auth/telegram/init"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ initData }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const payload = (await response.json()) as { error?: { message?: string } };
          throw new Error(payload.error?.message ?? "Telegram auth failed.");
        }
        setStatus("ready");
      })
      .catch((error: unknown) => {
        console.error(error);
        setStatus("failed");
        toast.error(error instanceof Error ? error.message : "Telegram auth failed.");
      });
  }, [initData, isTelegram]);

  if (!isTelegram) {
    return (
      <div className="mb-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
        Browser preview mode. Telegram auth is skipped here, so API calls requiring a session will fail until you open the Mini App from Telegram.
      </div>
    );
  }

  if (status === "ready" && launchContext === "attachment_menu") {
    return (
      <div className="mb-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
        MyMusic was opened from the attachment menu. Your library, playlists, imports, and player work here the same way as from the bot chat.
      </div>
    );
  }

  if (isTelegram && initData && status !== "ready" && status !== "failed") {
    return (
      <div className="mb-4 rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-neutral-500 dark:bg-white/5 dark:text-neutral-300">
        Connecting to Telegram session...
      </div>
    );
  }

  return null;
}
