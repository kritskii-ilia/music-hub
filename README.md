# MyMusic

MyMusic is an MVP Telegram Mini App for building a personal music library inside Telegram without scanning private chats or modifying Telegram's native UI. Users open the Mini App from a bot, upload or forward music files, organize tracks into playlists, and listen through a built-in mobile-first web player.

## Stack

- Next.js 16 App Router + TypeScript
- Tailwind CSS 4
- PostgreSQL + Prisma 6.x
- S3-compatible object storage (MinIO for local dev)
- Telegram Bot API integration
- Signed httpOnly session cookie after Telegram `initData` verification

## Current Status

This repository is in a verified MVP-ready development state:

- `npm install` works and generates `package-lock.json`
- `npx prisma generate` works
- `npm test` passes
- `npm run lint` passes
- `npm run build` passes

What is implemented now:

- Telegram Mini App screens: Home, My Music, Playlists, Playlist detail, Import, Settings, Track detail
- Upload endpoint and bot import pipeline
- Track CRUD, filtering, favorites, metadata editing, deletion
- Playlist create, rename, delete, add/remove tracks, reorder tracks
- Sticky player with play/pause, next/previous, seek, queue persistence in client state/local storage
- Attachment menu launch support on top of the same Mini App foundation

What is still not fully verified:

- Live bot/webhook flow with a real `.env` and running Telegram session
- Initial committed Prisma migration files

## Current Runtime Notes

- The repository itself is in a buildable/testable state.
- Runtime use still depends on local infrastructure being up:
  - PostgreSQL with the `music_hub` database/schema available
  - MinIO on `:9000` for file storage
- A recent runtime debugging pass found that the reported `Unexpected server error` was caused by missing database/storage setup rather than a broken track-recognition flow.
- A temporary shared `ngrok` path experiment through `jackpot-mvp` was reverted to avoid affecting that separate project. MyMusic currently has no active shared public URL in this repository state.

## Local Run

1. Copy `.env.example` to `.env`.
2. Start infra:
   ```bash
   docker compose up -d minio create-bucket
   ```
   If you are not reusing another PostgreSQL instance, also start the project database service:
   ```bash
   docker compose up -d postgres
   ```
3. Install deps:
   ```bash
   npm install
   ```
4. Run Prisma:
   ```bash
   npx prisma generate
   npm run prisma:migrate
   ```
5. Start the app:
   ```bash
   npm run dev
   ```
6. In another terminal start the bot worker:
   ```bash
   npm run bot:dev
   ```

Important:

- If the bot imports a track but responds with a generic failure, first confirm MinIO is reachable on `http://127.0.0.1:9000`.
- If Telegram login succeeds but API calls fail with server errors, confirm the `music_hub` database exists and Prisma schema has been pushed or migrated.

## Telegram Setup

1. Create a bot with BotFather.
2. Set `/start` text and menu button URL to your deployed Mini App URL.
3. Set the bot token and username in `.env`.
4. For webhook mode, configure the same secret in Telegram and `TELEGRAM_WEBHOOK_SECRET`.
5. Configure the Mini App short name and attachment menu in BotFather.
6. Configure either:
   - polling for local development with `npm run bot:dev`
   - webhook via `POST /api/telegram/webhook`
7. Forward an audio track to the bot or upload from inside the Mini App.

## Attachment Menu Integration

What is already implemented in code:

- bot `/start` explains attachment-menu installation
- bot buttons now include:
  - `Open MyMusic`
  - `Install in 📎`
  - `Direct Link`
- the Mini App detects when it was launched from attachment menu and keeps the same UX/auth flow

What must still be done manually in BotFather:

1. Enable the bot's Mini App / Web App setup.
2. Set the public Mini App URL.
3. Configure the Mini App short name.
4. Enable attachment menu support for the bot and point it to the same Mini App URL.

How to install MyMusic in Telegram:

1. Open the bot and run `/start`.
2. Tap `Install in 📎`.
3. Confirm Telegram's prompt to add MyMusic to attachment menu.
4. Open a supported chat, tap 📎, and choose `MyMusic`.

How to verify launch through attachment menu:

1. Start the app and bot worker locally or deploy them to a public URL.
2. Finish the BotFather setup above.
3. Install MyMusic via the bot.
4. Open a chat, tap 📎, launch MyMusic, and verify the same library/player/import flow works.

Relevant env/config:

- `APP_URL`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_BOT_USERNAME`
- `TELEGRAM_MINI_APP_SHORT_NAME`
- `ATTACHMENT_MENU_START_PARAM`
- `TELEGRAM_WEBHOOK_SECRET`

Current note:

- The earlier temporary shared-`ngrok` path used for quick testing was reverted, so attachment-menu/manual Telegram testing will need a fresh dedicated public HTTPS URL when you return to this stage.

## Mini App Development

- In Telegram, the app uses `window.Telegram.WebApp`.
- Outside Telegram, the frontend falls back to browser-safe mock behavior for local preview.
- The app reads Telegram theme params when present and otherwise uses local light/dark theme defaults.

## Import Testing

- Upload supported files from the Import screen.
- Forward an `audio` message to the bot.
- Forward a `document` only if it is a supported music MIME type.
- Voice messages and video notes are rejected by design.
- Duplicate imports should resolve to the existing track instead of creating another copy.

## Verification

The following commands were run successfully in this environment:

```bash
npm install
npx prisma generate
npm test
npm run lint
npm run build
```

## Docs

- [Implementation plan](/home/user/music-hub/docs/IMPLEMENTATION_PLAN.md)
- [Progress log](/home/user/music-hub/docs/PROGRESS_LOG.md)
- [Product spec](/home/user/music-hub/docs/PRODUCT_SPEC.md)
- [API spec](/home/user/music-hub/docs/API_SPEC.md)
- [Attachment menu integration](/home/user/music-hub/docs/ATTACHMENT_MENU_INTEGRATION.md)
