import { describe, expect, it } from "vitest";

import { assertPlaylistReorderIds } from "@/server/playlists/service";

describe("playlist reorder", () => {
  it("accepts exact reorder list", () => {
    expect(() => assertPlaylistReorderIds(["a", "b", "c"], ["c", "a", "b"])).not.toThrow();
  });

  it("rejects missing items", () => {
    expect(() => assertPlaylistReorderIds(["a", "b", "c"], ["a", "b"])).toThrowError(/exactly/);
  });
});
