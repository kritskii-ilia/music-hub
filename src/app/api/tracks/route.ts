import { prisma } from "@/server/db/prisma";
import { requireSession } from "@/server/auth/session";
import { jsonError, jsonOk } from "@/server/api/response";
import { applyRequestedOrder, buildTrackOrderBy, buildTrackWhereInput } from "@/server/tracks/service";
import { listTracksQuerySchema } from "@/server/tracks/schemas";

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    const query = listTracksQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams.entries()));
    const where = buildTrackWhereInput(session.sub, query);
    const skip = (query.page - 1) * query.pageSize;
    const orderBy = applyRequestedOrder(buildTrackOrderBy(query.sort), query.order);

    const [items, total] = await Promise.all([
      prisma.track.findMany({
        where,
        orderBy,
        skip,
        take: query.pageSize,
      }),
      prisma.track.count({ where }),
    ]);

    return jsonOk({
      items,
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}
