import { prisma } from "@/server/db/prisma";
import { requireSession } from "@/server/auth/session";
import { jsonError, jsonOk } from "@/server/api/response";
import { createPlaylistSchema } from "@/server/playlists/schemas";
import { sanitizeText } from "@/lib/utils";

export async function GET() {
  try {
    const session = await requireSession();
    const playlists = await prisma.playlist.findMany({
      where: {
        ownerUserId: session.sub,
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });

    return jsonOk({ items: playlists });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const body = createPlaylistSchema.parse(await request.json());
    const playlist = await prisma.playlist.create({
      data: {
        ownerUserId: session.sub,
        name: sanitizeText(body.name),
        description: sanitizeText(body.description ?? null) || null,
      },
    });

    return jsonOk(playlist, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
