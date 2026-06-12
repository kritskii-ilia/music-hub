import { describe, expect, it } from "vitest";

import { discriminateTelegramMessageMedia, isSupportedMusicDocument } from "@/server/tracks/media";

describe("media discrimination", () => {
  it("rejects voice and video notes", () => {
    expect(discriminateTelegramMessageMedia({ voice: {} }).kind).toBe("voice");
    expect(discriminateTelegramMessageMedia({ video_note: {} }).kind).toBe("video_note");
  });

  it("accepts supported documents", () => {
    expect(isSupportedMusicDocument("audio/flac", "song.flac")).toBe(true);
    expect(discriminateTelegramMessageMedia({ document: { mime_type: "audio/flac", file_name: "song.flac" } }).kind).toBe("document");
  });

  it("rejects unsupported documents", () => {
    expect(isSupportedMusicDocument("application/pdf", "manual.pdf")).toBe(false);
    expect(discriminateTelegramMessageMedia({ document: { mime_type: "application/pdf", file_name: "manual.pdf" } }).kind).toBe("unsupported");
  });
});
