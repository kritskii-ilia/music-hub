import { prisma } from "@/server/db/prisma";
import { requireSession } from "@/server/auth/session";
import { jsonError, jsonOk } from "@/server/api/response";
import { getPlaylistById } from "@/server/playlists/service";
import { updatePlaylistSchema } from "@/server/playlists/schemas";
import { sanitizeText } from "@/lib/utils";

type Params = Promise<{ id: string }>;

export async function GET(_: Request, { params }: { params: Params }) {
  try {
    const session = await requireSession();
    const { id } = await params;

    return jsonOk(await getPlaylistById(session.sub, id));
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Params }) {
  try {
    const session = await requireSession();
    const { id } = await params;
    await getPlaylistById(session.sub, id);
    const body = updatePlaylistSchema.parse(await request.json());

    const playlist = await prisma.playlist.update({
      where: { id },
      data: {
        name: body.name ? sanitizeText(body.name) : undefined,
        description: body.description === undefined ? undefined : sanitizeText(body.description ?? null) || null,
      },
    });

    return jsonOk(playlist);
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_: Request, { params }: { params: Params }) {
  try {
    const session = await requireSession();
    const { id } = await params;
    await getPlaylistById(session.sub, id);
    await prisma.playlist.delete({ where: { id } });

    return jsonOk({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
