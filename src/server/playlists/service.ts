import { prisma } from "@/server/db/prisma";
import { ApiError } from "@/server/api/errors";

export async function getPlaylistById(ownerUserId: string, playlistId: string) {
  const playlist = await prisma.playlist.findFirst({
    where: {
      id: playlistId,
      ownerUserId,
    },
    include: {
      items: {
        orderBy: {
          position: "asc",
        },
        include: {
          track: true,
        },
      },
    },
  });

  if (!playlist) {
    throw new ApiError(404, "NOT_FOUND", "Playlist not found.");
  }

  return playlist;
}

export async function reorderPlaylistTracks(ownerUserId: string, playlistId: string, trackIds: string[]) {
  const playlist = await getPlaylistById(ownerUserId, playlistId);
  assertPlaylistReorderIds(
    playlist.items.map((item) => item.trackId),
    trackIds,
  );

  await prisma.$transaction(
    trackIds.map((trackId, index) =>
      prisma.playlistItem.update({
        where: {
          playlistId_trackId: {
            playlistId,
            trackId,
          },
        },
        data: {
          position: index,
        },
      }),
    ),
  );

  return getPlaylistById(ownerUserId, playlistId);
}

export function assertPlaylistReorderIds(existingTrackIds: string[], nextTrackIds: string[]) {
  if (
    existingTrackIds.length !== nextTrackIds.length ||
    existingTrackIds.some((trackId) => !nextTrackIds.includes(trackId))
  ) {
    throw new ApiError(400, "VALIDATION_ERROR", "Reorder payload must contain exactly the playlist track IDs.");
  }
}
