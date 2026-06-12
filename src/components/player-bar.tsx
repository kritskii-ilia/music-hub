"use client";

import { Pause, Play, SkipBack, SkipForward } from "lucide-react";

import { formatDuration } from "@/lib/utils";
import { usePlayer } from "@/providers/player-provider";

export function PlayerBar() {
  const { currentTrack, isPlaying, progress, duration, togglePlayback, seek, playNext, playPrevious } = usePlayer();

  if (!currentTrack) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-1/2 z-30 w-[calc(100%-1rem)] max-w-[calc(28rem-1rem)] -translate-x-1/2 rounded-3xl border border-white/10 bg-neutral-950/95 p-3 shadow-2xl backdrop-blur">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{currentTrack.title}</p>
          <p className="truncate text-xs text-white/60">{currentTrack.artist}</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={playPrevious} className="rounded-full bg-white/10 p-2 text-white">
            <SkipBack className="size-4" />
          </button>
          <button type="button" onClick={togglePlayback} className="rounded-full bg-white p-2 text-black">
            {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
          </button>
          <button type="button" onClick={playNext} className="rounded-full bg-white/10 p-2 text-white">
            <SkipForward className="size-4" />
          </button>
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={duration || 0}
        value={progress}
        onChange={(event) => seek(Number(event.target.value))}
        className="w-full"
      />
      <div className="mt-1 flex justify-between text-[11px] text-white/50">
        <span>{formatDuration(Math.round(progress))}</span>
        <span>{formatDuration(Math.round(duration))}</span>
      </div>
    </div>
  );
}
