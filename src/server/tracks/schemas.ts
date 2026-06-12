import { z } from "zod";

export const trackSortSchema = z.enum(["newest", "oldest", "title", "artist"]);
const booleanStringSchema = z
  .union([z.boolean(), z.string()])
  .optional()
  .transform((value) => {
    if (typeof value === "boolean") {
      return value;
    }

    if (value === undefined || value === "") {
      return undefined;
    }

    return value === "true";
  });

export const listTracksQuerySchema = z.object({
  q: z.string().trim().optional(),
  favorites: booleanStringSchema,
  sort: trackSortSchema.default("newest"),
  order: z.enum(["asc", "desc"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  cover: z.enum(["with", "without"]).optional(),
  recent: booleanStringSchema,
});

export const updateTrackSchema = z.object({
  title: z.string().trim().min(1).max(160).optional(),
  artist: z.string().trim().min(1).max(160).optional(),
  album: z.string().trim().max(160).nullable().optional(),
  lyrics: z.string().trim().max(5000).nullable().optional(),
  isFavorite: z.boolean().optional(),
});

export const telegramTrackImportSchema = z.object({
  telegramUserId: z.string().min(1),
  fileId: z.string().min(1),
  uniqueFileId: z.string().min(1),
  mimeType: z.string().min(1),
  originalFileName: z.string().min(1),
  sourceType: z.enum(["forwarded_from_bot_chat", "manual"]),
  title: z.string().trim().optional(),
  artist: z.string().trim().optional(),
});
