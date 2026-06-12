import { prisma } from "@/server/db/prisma";
import { requireSession } from "@/server/auth/session";
import { jsonError, jsonOk } from "@/server/api/response";
import { getPlaylistById } from "@/server/playlists/service";
import { addPlaylistTrackSchema } from "@/server/playlists/schemas";
import { getTrackById } from "@/server/tracks/service";

type Params = Promise<{ id: string }>;

export async function POST(request: Request, { params }: { params: Params }) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const body = addPlaylistTrackSchema.parse(await request.json());
    const playlist = await getPlaylistById(session.sub, id);
    await getTrackById(session.sub, body.trackId);

    const alreadyExists = playlist.items.some((item) => item.trackId === body.trackId);
    if (alreadyExists) {
      return jsonOk(playlist);
    }

    await prisma.playlistItem.create({
      data: {
        playlistId: id,
        trackId: body.trackId,
        position: playlist.items.length,
      },
    });

    return jsonOk(await getPlaylistById(session.sub, id), { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
