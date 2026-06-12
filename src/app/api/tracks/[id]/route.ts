import { prisma } from "@/server/db/prisma";
import { requireSession } from "@/server/auth/session";
import { jsonError, jsonOk } from "@/server/api/response";
import { getTrackById } from "@/server/tracks/service";
import { updateTrackSchema } from "@/server/tracks/schemas";
import { sanitizeText } from "@/lib/utils";
import { deleteObject } from "@/server/storage/s3";

type Params = Promise<{ id: string }>;

export async function GET(_: Request, { params }: { params: Params }) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const track = await getTrackById(session.sub, id);

    return jsonOk(track);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Params }) {
  try {
    const session = await requireSession();
    const { id } = await params;
    await getTrackById(session.sub, id);
    const body = updateTrackSchema.parse(await request.json());

    const track = await prisma.track.update({
      where: { id },
      data: {
        title: body.title ? sanitizeText(body.title, "Unknown Title") : undefined,
        artist: body.artist ? sanitizeText(body.artist, "Unknown Artist") : undefined,
        album: body.album === undefined ? undefined : sanitizeText(body.album ?? null) || null,
        lyrics: body.lyrics === undefined ? undefined : sanitizeText(body.lyrics ?? null) || null,
        isFavorite: body.isFavorite,
      },
    });

    return jsonOk(track);
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_: Request, { params }: { params: Params }) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const track = await getTrackById(session.sub, id);

    await prisma.track.delete({
      where: { id },
    });
    await deleteObject(track.fileStorageKey).catch((error) => {
      console.error("Failed to delete track object from storage", error);
    });

    return jsonOk({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
