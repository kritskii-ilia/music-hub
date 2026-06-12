import { ApiError } from "@/server/api/errors";
import { TrackSourceType } from "@prisma/client";

import { assertRateLimit } from "@/server/api/ratelimit";
import { jsonError, jsonOk } from "@/server/api/response";
import { requireSession } from "@/server/auth/session";
import { normalizeAudioBuffer } from "@/server/tracks/media";
import { importTrack } from "@/server/tracks/service";

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    assertRateLimit(`upload:${session.sub}`, 20, 60_000);

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      throw new ApiError(400, "VALIDATION_ERROR", "file is required.");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const normalizedMedia = await normalizeAudioBuffer({
      buffer,
      mimeType: file.type || "audio/mpeg",
      originalFileName: file.name,
    });
    const result = await importTrack({
      ownerUserId: session.sub,
      sourceType: TrackSourceType.upload,
      normalizedMedia,
      buffer,
    });

    return jsonOk(result, { status: result.deduplicated ? 200 : 201 });
  } catch (error) {
    return jsonError(error);
  }
}
