"use client";

import Link from "next/link";
import { Heart, Play } from "lucide-react";

import { cn, formatDuration } from "@/lib/utils";
import { usePlayer } from "@/providers/player-provider";
import type { Track } from "@/types/app";

export function TrackRow({
  track,
  queue,
  className,
}: {
  track: Track;
  queue: Track[];
  className?: string;
}) {
  const { currentTrack, playTrack } = usePlayer();
  const active = currentTrack?.id === track.id;

  return (
    <div className={cn("flex items-center gap-3 rounded-2xl px-3 py-3", active ? "bg-black text-white dark:bg-white dark:text-black" : "bg-black/5 dark:bg-white/5", className)}>
      <button
        type="button"
        onClick={() => playTrack(track, queue)}
        className={cn("rounded-full p-2", active ? "bg-white/20 dark:bg-black/20" : "bg-black text-white dark:bg-white dark:text-black")}
      >
        <Play className="size-4" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{track.title}</p>
        <p className="truncate text-xs opacity-70">{track.artist}{track.album ? ` • ${track.album}` : ""}</p>
      </div>
      {track.isFavorite ? <Heart className="size-4 fill-current text-rose-500" /> : null}
      <p className="text-xs opacity-60">{formatDuration(track.durationSec)}</p>
      <Link href={`/tracks/${track.id}`} className="text-xs font-medium opacity-70">
        Edit
      </Link>
    </div>
  );
}
