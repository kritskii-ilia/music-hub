import { prisma } from "@/server/db/prisma";
import { requireSession } from "@/server/auth/session";
import { jsonError, jsonOk } from "@/server/api/response";

export async function GET() {
  try {
    const session = await requireSession();
    const [user, trackCount, playlistCount, favoritesCount] = await Promise.all([
      prisma.user.findUniqueOrThrow({
        where: {
          id: session.sub,
        },
      }),
      prisma.track.count({ where: { ownerUserId: session.sub } }),
      prisma.playlist.count({ where: { ownerUserId: session.sub } }),
      prisma.track.count({ where: { ownerUserId: session.sub, isFavorite: true } }),
    ]);

    return jsonOk({
      user,
      counters: {
        trackCount,
        playlistCount,
        favoritesCount,
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}
