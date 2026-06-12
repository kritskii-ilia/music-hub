import { prisma } from "@/server/db/prisma";
import { requireSession } from "@/server/auth/session";
import { jsonError, jsonOk } from "@/server/api/response";
import { getPlaylistById } from "@/server/playlists/service";

type Params = Promise<{ id: string; trackId: string }>;

export async function DELETE(_: Request, { params }: { params: Params }) {
  try {
    const session = await requireSession();
    const { id, trackId } = await params;
    await getPlaylistById(session.sub, id);
    await prisma.playlistItem.delete({
      where: {
        playlistId_trackId: {
          playlistId: id,
          trackId,
        },
      },
    });

    const remaining = await prisma.playlistItem.findMany({
      where: {
        playlistId: id,
      },
      orderBy: {
        position: "asc",
      },
    });

    await prisma.$transaction(
      remaining.map((item, index) =>
        prisma.playlistItem.update({
          where: {
            playlistId_trackId: {
              playlistId: id,
              trackId: item.trackId,
            },
          },
          data: {
            position: index,
          },
        }),
      ),
    );

    return jsonOk({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
