# Progress Log

## Done

- Created fresh `music-hub` project scaffold with Next.js + TypeScript + Tailwind.
- Created required documentation files and initial architecture plan.
- Chosen delivery architecture: single Next.js codebase, Prisma/Postgres, MinIO/S3, Telegram bot service.
- Added Prisma schema for `User`, `Track`, `Playlist`, `PlaylistItem`, and `ImportLog`.
- Implemented server foundation modules: env parsing, Prisma client, API error helpers, in-memory rate limiting, session signing, Telegram init data verification.
- Implemented storage and media pipeline: S3 upload helper, MIME/size validation, metadata normalization, checksum-based deduplication path.
- Implemented Telegram bot service with `/start`, Mini App button, audio/document import, and rejection of voice/video note media.
- Implemented API endpoints for auth, profile, tracks, uploads, Telegram imports, playlists, playlist item add/remove/reorder, and webhook entrypoint.
- Implemented Mini App frontend shell with Home, My Music, Playlists, Playlist detail, Import, Settings, Track detail/edit, and sticky audio player.
- Added unit tests for Telegram auth verification, media discrimination, track filter mapping, and playlist reorder validation.
- Added `Dockerfile` and `docker-compose.yml` for Postgres + MinIO local setup.
- Removed conflicting install artifacts and normalized the project back to npm with a generated `package-lock.json`.
- Downgraded Prisma from 7.x to 6.x to avoid the new datasource configuration model blocking `prisma generate`.
- Verified the main toolchain successfully:
  - `npm install`
  - `npx prisma generate`
  - `npm test`
  - `npm run lint`
  - `npm run build`
- Completed missing playlist UX:
  - rename
  - delete
  - add tracks from library
  - remove tracks
  - reorder tracks
- Improved track edit UX with lyrics field, richer metadata panel, and delete action.
- Improved import UX with clearer supported-format guidance, duplicate expectations, and inline error messaging.
- Added player state persistence to local storage so current queue/track/progress survive navigation and refresh.
- Added `order` handling to track listing API and storage cleanup on track deletion.
- Added attachment-menu stage:
  - bot `/start` now explains attachment menu installation
  - bot buttons now expose `Open MyMusic`, `Install in 📎`, and `Direct Link`
  - launch context detection now distinguishes bot menu, direct link, and attachment menu opens
  - Mini App now surfaces a contextual banner when opened from attachment menu
- Added attachment-menu setup guide in [`docs/ATTACHMENT_MENU_INTEGRATION.md`](/home/user/music-hub/docs/ATTACHMENT_MENU_INTEGRATION.md).
- Re-verified after attachment-menu changes:
  - `npm test`
  - `npm run lint`
  - `npm run build`
- Investigated the runtime `Unexpected server error` report and found two environment-level causes:
  - `music_hub` database/schema had not been provisioned yet
  - MinIO storage on `:9000` was not running, so bot imports failed after Telegram file download
- Provisioned the `music_hub` database and synced Prisma schema with `npm run prisma:push`.
- Brought up MinIO and confirmed the import failure was storage-related rather than media-type recognition.
- Reverted the temporary shared-ngrok path proxy change in `jackpot-mvp` so the roulette project is back to its original routing shape.

## In Progress

- Project paused in a documented state for later continuation.

## Remaining

- Add an initial checked-in Prisma migration instead of relying only on `prisma generate`.
- Perform live end-to-end bot/import validation against a real Telegram bot session and running storage/database.
- Perform live attachment-menu validation after BotFather configuration.
- Tighten a few UX edges such as richer playlist confirmations and broader client-side optimistic updates.

## Known Issues

- Browser preview works for UI development, but authenticated API usage still requires opening the Mini App inside Telegram or providing valid Telegram `initData`.
- Live Telegram and storage flows were not exercised end-to-end in this pass, so bot token/webhook/runtime behavior is code-complete but not fully field-verified.
- Attachment menu installation still requires manual BotFather configuration and a Telegram-side confirmation flow.
- No Prisma migration files are committed yet; local schema generation works, but DB bootstrap is still `prisma migrate dev` driven.
- The temporary `/mymusic` shared-ngrok routing experiment was intentionally reverted to avoid affecting `jackpot-mvp`; MyMusic is not currently exposed on that shared domain.

## Next Steps

1. Run `npm run prisma:migrate` against local Postgres and commit the first migration.
2. Bring up `docker compose` services (`minio`, optional local postgres if not reusing another instance) before testing upload/bot import again.
3. Re-establish a dedicated public HTTPS entrypoint for MyMusic before the next real Telegram Mini App smoke pass.
