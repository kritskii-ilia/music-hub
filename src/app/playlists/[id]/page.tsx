"use client";

import { use, useMemo, useState, useTransition } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { apiGet } from "@/lib/api-client";
import { apiPath, withBasePath } from "@/lib/paths";
import { SectionCard } from "@/components/section-card";
import { TrackRow } from "@/components/track-row";
import type { PlaylistDetail, Track } from "@/types/app";

type TracksResponse = {
  items: Track[];
};

export default function PlaylistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [draftName, setDraftName] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
  const [isPending, startTransition] = useTransition();
  const playlistQuery = useQuery({
    queryKey: ["playlist-detail", id],
    queryFn: () => apiGet<PlaylistDetail>(`/api/playlists/${id}`),
  });
  const tracksQuery = useQuery({
    queryKey: ["tracks-for-playlist", id],
    queryFn: () => apiGet<TracksResponse>("/api/tracks?pageSize=50"),
  });

  const playlist = playlistQuery.data;
  const playlistTracks = useMemo(() => playlist?.items.map((item) => item.track) ?? [], [playlist]);
  const addableTracks = useMemo(
    () => (tracksQuery.data?.items ?? []).filter((track) => !playlistTracks.some((existing) => existing.id === track.id)),
    [playlistTracks, tracksQuery.data?.items],
  );

  async function refetchEverything() {
    await Promise.all([playlistQuery.refetch(), tracksQuery.refetch()]);
  }

  async function reorder(nextTrackIds: string[]) {
    const response = await fetch(apiPath(`/api/playlists/${id}/tracks/reorder`), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ trackIds: nextTrackIds }),
    });

    if (!response.ok) {
      toast.error("Could not reorder playlist.");
      return;
    }

    await playlistQuery.refetch();
  }

  return (
    <div className="space-y-4">
      <SectionCard title={playlist?.name ?? "Playlist"} subtitle={playlist?.description ?? "Rename, reorder, add, and remove tracks here."}>
        {playlistQuery.isLoading ? <PlaylistSkeleton /> : null}
        {playlistQuery.isError ? <p className="text-sm text-rose-500">Could not load playlist.</p> : null}
        {playlist ? (
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              startTransition(async () => {
                const response = await fetch(apiPath(`/api/playlists/${id}`), {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  credentials: "include",
                  body: JSON.stringify({
                    name: draftName || playlist.name,
                    description: draftDescription || playlist.description,
                  }),
                });

                if (!response.ok) {
                  toast.error("Could not save playlist.");
                  return;
                }

                toast.success("Playlist updated.");
                await playlistQuery.refetch();
              });
            }}
          >
            <input
              value={draftName || playlist.name}
              onChange={(event) => setDraftName(event.target.value)}
              className="w-full rounded-2xl border border-black/10 bg-transparent px-3 py-2 dark:border-white/10"
              placeholder="Playlist name"
            />
            <textarea
              value={draftDescription || playlist.description || ""}
              onChange={(event) => setDraftDescription(event.target.value)}
              className="min-h-24 w-full rounded-2xl border border-black/10 bg-transparent px-3 py-2 dark:border-white/10"
              placeholder="Description"
            />
            <div className="flex gap-2">
              <button type="submit" disabled={isPending} className="rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white dark:bg-white dark:text-black">
                Save
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  startTransition(async () => {
                    const response = await fetch(apiPath(`/api/playlists/${id}`), {
                      method: "DELETE",
                      credentials: "include",
                    });

                    if (!response.ok) {
                      toast.error("Could not delete playlist.");
                      return;
                    }

                    toast.success("Playlist deleted.");
                    window.location.href = withBasePath("/playlists");
                  });
                }}
                className="rounded-2xl border border-rose-500/30 px-4 py-3 text-sm font-medium text-rose-500"
              >
                Delete
              </button>
            </div>
          </form>
        ) : null}
      </SectionCard>

      <SectionCard title="Tracks" subtitle="Playback queue follows this order.">
        {playlistQuery.isLoading ? <PlaylistSkeleton /> : null}
        {playlist && playlist.items.length === 0 ? (
          <p className="text-sm text-neutral-500">This playlist is empty. Add tracks from your library below.</p>
        ) : null}
        <div className="space-y-2">
          {playlist?.items.map((item, index) => (
            <div key={item.trackId} className="space-y-2 rounded-3xl border border-black/10 p-2 dark:border-white/10">
              <TrackRow track={item.track} queue={playlistTracks} />
              <div className="flex gap-2 px-1 pb-1">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => {
                    const next = [...playlist.items.map((entry) => entry.trackId)];
                    [next[index - 1], next[index]] = [next[index], next[index - 1]];
                    void reorder(next);
                  }}
                  className="rounded-xl bg-black/5 p-2 dark:bg-white/5"
                >
                  <ArrowUp className="size-4" />
                </button>
                <button
                  type="button"
                  disabled={index === playlist.items.length - 1}
                  onClick={() => {
                    const next = [...playlist.items.map((entry) => entry.trackId)];
                    [next[index + 1], next[index]] = [next[index], next[index + 1]];
                    void reorder(next);
                  }}
                  className="rounded-xl bg-black/5 p-2 dark:bg-white/5"
                >
                  <ArrowDown className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    startTransition(async () => {
                      const response = await fetch(apiPath(`/api/playlists/${id}/tracks/${item.trackId}`), {
                        method: "DELETE",
                        credentials: "include",
                      });

                      if (!response.ok) {
                        toast.error("Could not remove track.");
                        return;
                      }

                      toast.success("Track removed from playlist.");
                      await refetchEverything();
                    });
                  }}
                  className="ml-auto rounded-xl border border-rose-500/30 p-2 text-rose-500"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Add Tracks" subtitle="Pick tracks from your library and add them into this playlist.">
        {tracksQuery.isLoading ? <PlaylistSkeleton /> : null}
        {tracksQuery.isError ? <p className="text-sm text-rose-500">Could not load available tracks.</p> : null}
        {addableTracks.length === 0 ? (
          <p className="text-sm text-neutral-500">No more tracks available to add. Import more music or remove duplicates from this playlist.</p>
        ) : (
          <div className="space-y-2">
            {addableTracks.map((track) => (
              <div key={track.id} className="flex items-center gap-3 rounded-2xl bg-black/5 px-3 py-3 dark:bg-white/5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{track.title}</p>
                  <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">{track.artist}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    startTransition(async () => {
                      const response = await fetch(apiPath(`/api/playlists/${id}/tracks`), {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        credentials: "include",
                        body: JSON.stringify({ trackId: track.id }),
                      });

                      if (!response.ok) {
                        toast.error("Could not add track.");
                        return;
                      }

                      toast.success("Track added to playlist.");
                      await refetchEverything();
                    });
                  }}
                  className="rounded-xl bg-black px-3 py-2 text-sm text-white dark:bg-white dark:text-black"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

function PlaylistSkeleton() {
  return (
    <div className="space-y-2">
      <div className="h-12 animate-pulse rounded-2xl bg-black/5 dark:bg-white/5" />
      <div className="h-20 animate-pulse rounded-2xl bg-black/5 dark:bg-white/5" />
      <div className="h-14 animate-pulse rounded-2xl bg-black/5 dark:bg-white/5" />
    </div>
  );
}
