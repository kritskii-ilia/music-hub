# MyMusic Implementation Plan

## Goal

Deliver a production-sane MVP Telegram Mini App that gives the user a focused personal music library inside Telegram, without reading private chat history and without modifying Telegram's native client UI.

## Product Boundaries

- Implement as Telegram Mini App opened via bot menu button, direct Mini App link, or bot chat button.
- Import only from user-controlled actions: Mini App file upload and forwarding media to the bot.
- Do not attempt to scan personal Telegram chats or Saved Messages automatically.
- Reject voice messages, video notes, and unsupported documents.

## Architecture Choice

### Chosen stack

- Next.js App Router for frontend and API route handlers
- Prisma 6.x + PostgreSQL for relational data
- S3-compatible storage for files and optional covers
- Telegram bot service built around Bot API helpers with both polling and webhook entrypoints
- Secure signed cookie session after Telegram `initData` verification

### Why this path

- Single TypeScript codebase keeps MVP delivery fast.
- Next.js route handlers are enough for CRUD, upload, and auth flows.
- Prisma keeps schema evolution and owner checks straightforward.
- S3-compatible storage keeps deploy path compatible with MinIO, AWS S3, Hetzner, etc.

## High-Level Modules

1. `src/app`
   - Mini App routes and API route handlers.
2. `src/server/auth`
   - Telegram `initData` verification, session creation, auth guards.
3. `src/server/db`
   - Prisma client and query helpers.
4. `src/server/storage`
   - S3 client, upload/download helpers, checksum helpers.
5. `src/server/telegram`
   - Bot message handling, Bot API calls, Telegram file ingestion.
6. `src/server/tracks`
   - Track validation, deduplication, filtering, metadata sanitation.
7. `src/server/playlists`
   - Playlist CRUD and reorder logic.

## Data Model

- `User`
  - Telegram identity and profile snapshot.
- `Track`
  - Owner-scoped library item with Telegram and storage metadata.
- `Playlist`
  - Owner-scoped playlist.
- `PlaylistItem`
  - Ordered join table.
- `ImportLog`
  - Track imports from upload/telegram, status, dedupe outcome, errors.

## Delivery Stages

1. Foundation
   - Scaffold app, docs, env, Prisma schema, shared validation utilities.
2. Auth and sessions
   - `POST /api/auth/telegram/init`, signed cookie, `GET /api/me`.
3. Storage and uploads
   - Multipart upload endpoint, MIME/size validation, S3 persistence, checksum.
4. Bot ingestion
   - `/start`, Mini App button, `audio`/music `document` handling, Telegram file download.
5. Library API
   - Track CRUD, filters, sorts, dedupe.
6. Playlist API
   - CRUD, add/remove tracks, reorder.
7. Frontend
   - Home, library, playlists, import, settings, edit track, sticky player.
8. Hardening
   - Rate limiting, error normalization, tests, Docker/dev scripts.

## Key Decisions

- Session transport: signed JWT-like cookie via `jose`, not localStorage token.
- Deduplication: first by `telegramUniqueFileId`, fallback by SHA-256 checksum.
- File acceptance: `audio/*` and selected document MIME/extensions (`mp3`, `m4a`, `aac`, `ogg`, `flac`).
- Player: HTML5 `<audio>` with React context queue state.
- Dev bot flow: long polling locally; webhook route kept for deploy.
- Prisma pinned to 6.x because Prisma 7 introduced datasource/config changes that added setup churn without MVP value for this project.

## Current Completion

- Core MVP foundation is implemented.
- Verified locally in this environment:
  - `npm install`
  - `npx prisma generate`
  - `npm test`
  - `npm run lint`
  - `npm run build`
- Playlist management UI now includes create, rename, delete, add track, remove track, and reorder.
- Track edit UI now includes metadata edit, lyrics field, favorite toggle, and delete action.
- Player state persists current queue/track/progress in client storage.
- Attachment menu integration is the current second-stage extension on top of the verified MVP foundation.

## Assumptions

- Cover extraction and rich metadata parsing stay minimal in MVP.
- OGG support is limited to normal music files; voice notes remain blocked via Telegram message type and MIME checks.
- Lyrics field exists in schema but is not populated automatically.

## Backlog / Optional Enhancements

- Waveform/progressive preload
- Cover upload or extraction from embedded tags
- Bulk import queue UI
- Shareable playlists
- Background jobs for metadata enrichment
- Presigned direct uploads
