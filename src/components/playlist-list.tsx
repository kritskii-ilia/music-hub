"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { apiGet } from "@/lib/api-client";
import { apiPath } from "@/lib/paths";
import { SectionCard } from "@/components/section-card";
import type { Playlist } from "@/types/app";

type PlaylistsResponse = {
  items: Playlist[];
};

export function PlaylistList() {
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();
  const query = useQuery({
    queryKey: ["playlists"],
    queryFn: () => apiGet<PlaylistsResponse>("/api/playlists"),
  });

  return (
    <SectionCard title="Playlists" subtitle="Create playlists for moods, genres, and quick access.">
      <form
        className="mb-4 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim()) return;

          startTransition(async () => {
            const response = await fetch(apiPath("/api/playlists"), {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({ name }),
            });

            if (!response.ok) {
              toast.error("Could not create playlist.");
              return;
            }

            toast.success("Playlist created.");
            setName("");
            await query.refetch();
          });
        }}
      >
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="New playlist name"
          className="flex-1 rounded-2xl border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/10"
        />
        <button type="submit" disabled={isPending} className="rounded-2xl bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black">
          Add
        </button>
      </form>
      {query.isLoading ? (
        <div className="space-y-2">
          <div className="h-16 animate-pulse rounded-2xl bg-black/5 dark:bg-white/5" />
          <div className="h-16 animate-pulse rounded-2xl bg-black/5 dark:bg-white/5" />
        </div>
      ) : null}
      {query.isError ? <p className="text-sm text-rose-500">Could not load playlists.</p> : null}
      <div className="space-y-2">
        {query.data?.items.map((playlist) => (
          <Link
            key={playlist.id}
            href={`/playlists/${playlist.id}`}
            className="flex items-center justify-between rounded-2xl bg-black/5 px-4 py-3 dark:bg-white/5"
          >
            <div>
              <p className="font-medium">{playlist.name}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {playlist._count?.items ?? 0} tracks
              </p>
            </div>
            <span className="text-sm opacity-50">Open</span>
          </Link>
        ))}
      </div>
      {query.data && query.data.items.length === 0 ? (
        <div className="rounded-2xl bg-black/5 px-4 py-4 text-sm text-neutral-500 dark:bg-white/5">
          No playlists yet. Create one above, then open it to add and reorder tracks.
        </div>
      ) : null}
    </SectionCard>
  );
}
