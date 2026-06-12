import { requireSession } from "@/server/auth/session";
import { jsonError, jsonOk } from "@/server/api/response";
import { reorderPlaylistSchema } from "@/server/playlists/schemas";
import { reorderPlaylistTracks } from "@/server/playlists/service";

type Params = Promise<{ id: string }>;

export async function PATCH(request: Request, { params }: { params: Params }) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const body = reorderPlaylistSchema.parse(await request.json());
    const playlist = await reorderPlaylistTracks(session.sub, id, body.trackIds);

    return jsonOk(playlist);
  } catch (error) {
    return jsonError(error);
  }
}
