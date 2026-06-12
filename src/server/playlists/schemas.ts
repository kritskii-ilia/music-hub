import { z } from "zod";

export const createPlaylistSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).nullable().optional(),
});

export const updatePlaylistSchema = createPlaylistSchema.partial();

export const addPlaylistTrackSchema = z.object({
  trackId: z.string().min(1),
});

export const reorderPlaylistSchema = z.object({
  trackIds: z.array(z.string().min(1)).min(1),
});
