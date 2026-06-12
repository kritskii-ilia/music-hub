import { describe, expect, it } from "vitest";

import { listTracksQuerySchema } from "@/server/tracks/schemas";
import { buildTrackOrderBy, buildTrackWhereInput } from "@/server/tracks/service";

describe("track filters", () => {
  it("builds search and favorite filters", () => {
    const where = buildTrackWhereInput("user_1", {
      q: "daft",
      favorites: true,
      cover: "with",
      recent: true,
    });

    expect(where.ownerUserId).toBe("user_1");
    expect(where.isFavorite).toBe(true);
    expect(where.OR).toHaveLength(3);
    expect(where.coverImageUrl).toEqual({ not: null });
  });

  it("maps sort aliases to prisma orderBy", () => {
    expect(buildTrackOrderBy("newest")).toEqual({ createdAt: "desc" });
    expect(buildTrackOrderBy("title")).toEqual([{ title: "asc" }, { createdAt: "desc" }]);
  });

  it("parses false booleans correctly from query strings", () => {
    const parsed = listTracksQuerySchema.parse({
      favorites: "false",
      recent: "true",
    });

    expect(parsed.favorites).toBe(false);
    expect(parsed.recent).toBe(true);
  });
});
