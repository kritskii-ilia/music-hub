"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { apiGet } from "@/lib/api-client";
import { useTelegram } from "@/hooks/use-telegram";
import { SectionCard } from "@/components/section-card";
import type { MeResponse } from "@/types/app";

export function DashboardOverview() {
  const { launchContext } = useTelegram();
  const query = useQuery({
    queryKey: ["me"],
    queryFn: () => apiGet<MeResponse>("/api/me"),
  });

  return (
    <SectionCard title="MyMusic" subtitle="Your intentional music section inside Telegram, without the global audio clutter.">
      {launchContext === "attachment_menu" ? (
        <div className="mb-4 rounded-2xl bg-black/5 px-4 py-3 text-sm text-neutral-600 dark:bg-white/5 dark:text-neutral-300">
          Opened from the attachment menu. This is the fastest way to launch MyMusic directly from supported chats.
        </div>
      ) : null}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-black px-4 py-3 text-white dark:bg-white dark:text-black">
          <p className="text-[11px] uppercase tracking-[0.18em] opacity-70">Tracks</p>
          <p className="mt-2 text-2xl font-semibold">{query.data?.counters.trackCount ?? "-"}</p>
        </div>
        <div className="rounded-2xl bg-white/70 px-4 py-3 dark:bg-white/10">
          <p className="text-[11px] uppercase tracking-[0.18em] opacity-60">Playlists</p>
          <p className="mt-2 text-2xl font-semibold">{query.data?.counters.playlistCount ?? "-"}</p>
        </div>
        <div className="rounded-2xl bg-white/70 px-4 py-3 dark:bg-white/10">
          <p className="text-[11px] uppercase tracking-[0.18em] opacity-60">Favorites</p>
          <p className="mt-2 text-2xl font-semibold">{query.data?.counters.favoritesCount ?? "-"}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Link href="/import" className="rounded-2xl bg-black px-4 py-4 text-sm font-medium text-white dark:bg-white dark:text-black">
          Upload track
        </Link>
        <Link href="/playlists" className="rounded-2xl bg-white/70 px-4 py-4 text-sm font-medium dark:bg-white/10">
          Open playlists
        </Link>
        <Link href="/music?favorites=true" className="rounded-2xl bg-white/70 px-4 py-4 text-sm font-medium dark:bg-white/10">
          Favorites
        </Link>
        <Link href="/settings" className="rounded-2xl bg-white/70 px-4 py-4 text-sm font-medium dark:bg-white/10">
          Import help
        </Link>
      </div>
    </SectionCard>
  );
}
