"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { apiGet } from "@/lib/api-client";
import { SectionCard } from "@/components/section-card";
import { TrackRow } from "@/components/track-row";
import type { Track } from "@/types/app";

type TracksResponse = {
  items: Track[];
  pagination: {
    total: number;
  };
};

export function LibraryView({ endpoint, title, subtitle }: { endpoint: string; title: string; subtitle: string }) {
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState(endpoint.includes("favorites=true"));
  const [sort, setSort] = useState("newest");
  const fullEndpoint = endpoint.includes("?")
    ? `${endpoint}&q=${encodeURIComponent(search)}&favorites=${favorites}&sort=${sort}`
    : `${endpoint}?q=${encodeURIComponent(search)}&favorites=${favorites}&sort=${sort}`;
  const tracksQuery = useQuery({
    queryKey: ["tracks", fullEndpoint],
    queryFn: () => apiGet<TracksResponse>(fullEndpoint),
  });

  return (
    <SectionCard title={title} subtitle={subtitle}>
      <div className="mb-4 grid grid-cols-2 gap-2">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search title or artist"
          className="col-span-2 rounded-2xl border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/10"
        />
        <button
          type="button"
          onClick={() => setFavorites((value) => !value)}
          className="rounded-2xl bg-black px-3 py-2 text-sm text-white dark:bg-white dark:text-black"
        >
          {favorites ? "Favorites on" : "Favorites off"}
        </button>
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          className="rounded-2xl border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/10"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="title">Title A-Z</option>
          <option value="artist">Artist A-Z</option>
        </select>
      </div>
      {tracksQuery.isLoading ? (
        <div className="space-y-2">
          <div className="h-16 animate-pulse rounded-2xl bg-black/5 dark:bg-white/5" />
          <div className="h-16 animate-pulse rounded-2xl bg-black/5 dark:bg-white/5" />
          <div className="h-16 animate-pulse rounded-2xl bg-black/5 dark:bg-white/5" />
        </div>
      ) : null}
      {tracksQuery.isError ? <p className="text-sm text-rose-500">Could not load tracks.</p> : null}
      {tracksQuery.data?.items.length ? (
        <div className="space-y-2">
          {tracksQuery.data.items.map((track) => (
            <TrackRow key={track.id} track={track} queue={tracksQuery.data?.items ?? []} />
          ))}
        </div>
      ) : null}
      {tracksQuery.data && tracksQuery.data.items.length === 0 ? <p className="text-sm text-neutral-500">No tracks yet. Import a file to populate your library.</p> : null}
    </SectionCard>
  );
}
