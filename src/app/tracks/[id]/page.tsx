"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { apiGet } from "@/lib/api-client";
import { apiPath, withBasePath } from "@/lib/paths";
import { SectionCard } from "@/components/section-card";
import type { Track } from "@/types/app";

export default function TrackDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [isPending, startTransition] = useTransition();
  const query = useQuery({
    queryKey: ["track-detail", id],
    queryFn: () => apiGet<Track>(`/api/tracks/${id}`),
  });

  return (
    <SectionCard title={query.data?.title ?? "Track"} subtitle="Edit metadata, favorite state, and remove the track if it should leave your library.">
      {query.isLoading ? <TrackFormSkeleton /> : null}
      {query.isError ? <p className="text-sm text-rose-500">Could not load track.</p> : null}
      {query.data ? (
        <TrackEditForm
          track={query.data}
          isPending={isPending}
          onDelete={() => {
            startTransition(async () => {
              const response = await fetch(apiPath(`/api/tracks/${id}`), {
                method: "DELETE",
                credentials: "include",
              });

              if (!response.ok) {
                toast.error("Could not delete track.");
                return;
              }

              toast.success("Track deleted.");
              window.location.href = withBasePath("/music");
            });
          }}
          onSave={(payload) => {
            startTransition(async () => {
              const response = await fetch(apiPath(`/api/tracks/${id}`), {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(payload),
              });

              if (!response.ok) {
                toast.error("Could not save track.");
                return;
              }

              toast.success("Track updated.");
              await query.refetch();
            });
          }}
        />
      ) : null}
    </SectionCard>
  );
}

function TrackEditForm({
  track,
  isPending,
  onDelete,
  onSave,
}: {
  track: Track;
  isPending: boolean;
  onDelete: () => void;
  onSave: (payload: { title: string; artist: string; album: string | null; lyrics: string | null; isFavorite: boolean }) => void;
}) {
  const [title, setTitle] = useState(track.title);
  const [artist, setArtist] = useState(track.artist);
  const [album, setAlbum] = useState(track.album ?? "");
  const [lyrics, setLyrics] = useState(track.lyrics ?? "");
  const [isFavorite, setIsFavorite] = useState(track.isFavorite);

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        onSave({
          title,
          artist,
          album: album || null,
          lyrics: lyrics || null,
          isFavorite,
        });
      }}
    >
      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-[0.18em] opacity-60">Title</span>
        <input value={title} onChange={(event) => setTitle(event.target.value)} className="w-full rounded-2xl border border-black/10 bg-transparent px-3 py-2 dark:border-white/10" />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-[0.18em] opacity-60">Artist</span>
        <input value={artist} onChange={(event) => setArtist(event.target.value)} className="w-full rounded-2xl border border-black/10 bg-transparent px-3 py-2 dark:border-white/10" />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-[0.18em] opacity-60">Album</span>
        <input value={album} onChange={(event) => setAlbum(event.target.value)} className="w-full rounded-2xl border border-black/10 bg-transparent px-3 py-2 dark:border-white/10" />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-[0.18em] opacity-60">Lyrics</span>
        <textarea value={lyrics} onChange={(event) => setLyrics(event.target.value)} className="min-h-28 w-full rounded-2xl border border-black/10 bg-transparent px-3 py-2 dark:border-white/10" />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isFavorite} onChange={(event) => setIsFavorite(event.target.checked)} />
        Favorite
      </label>
      <div className="flex gap-2">
        <button type="submit" disabled={isPending} className="rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white dark:bg-white dark:text-black">
          Save metadata
        </button>
        <button type="button" disabled={isPending} onClick={onDelete} className="rounded-2xl border border-rose-500/30 px-4 py-3 text-sm font-medium text-rose-500">
          Delete track
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-black/5 p-3 text-xs text-neutral-500 dark:bg-white/5 dark:text-neutral-400">
        <div>
          <p className="uppercase tracking-[0.18em]">MIME</p>
          <p className="mt-1 break-all">{track.mimeType}</p>
        </div>
        <div>
          <p className="uppercase tracking-[0.18em]">File Size</p>
          <p className="mt-1">{track.fileSize} bytes</p>
        </div>
      </div>
    </form>
  );
}

function TrackFormSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-12 animate-pulse rounded-2xl bg-black/5 dark:bg-white/5" />
      <div className="h-12 animate-pulse rounded-2xl bg-black/5 dark:bg-white/5" />
      <div className="h-12 animate-pulse rounded-2xl bg-black/5 dark:bg-white/5" />
      <div className="h-24 animate-pulse rounded-2xl bg-black/5 dark:bg-white/5" />
    </div>
  );
}
