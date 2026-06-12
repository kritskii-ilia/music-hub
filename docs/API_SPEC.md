# API Spec

## Auth

### `POST /api/auth/telegram/init`

Verifies Telegram Mini App `initData`, upserts user, and sets a secure session cookie.

Request:

```json
{
  "initData": "query_id=...&user=...&hash=..."
}
```

Response `200`:

```json
{
  "user": {
    "id": "uuid",
    "telegramUserId": "123456",
    "username": "alice"
  }
}
```

Errors:

- `400 INVALID_INIT_DATA`
- `401 TELEGRAM_AUTH_FAILED`

### `GET /api/me`

Returns current authenticated user profile and counters.

## Tracks

### `GET /api/tracks`

Query params:

- `q`
- `favorites`
- `sort`
- `order`
- `page`
- `pageSize`
- `cover`
- `recent`

Response `200`:

```json
{
  "items": [],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

### `POST /api/tracks/upload`

Multipart upload endpoint for files selected in the Mini App.

### `POST /api/tracks/from-telegram`

Internal/authenticated ingestion endpoint for Telegram bot imports.

### `GET /api/tracks/:id`

Returns one owner-scoped track.

Response `200`:

```json
{
  "id": "trk_123",
  "title": "Song",
  "artist": "Artist"
}
```

### `PATCH /api/tracks/:id`

Editable fields:

- `title`
- `artist`
- `album`
- `lyrics`
- `isFavorite`

### `DELETE /api/tracks/:id`

Current behavior: hard-delete database record and attempt to delete the stored object from S3-compatible storage.

## Playlists

### `POST /api/playlists`
### `GET /api/playlists`
### `GET /api/playlists/:id`
### `PATCH /api/playlists/:id`
### `DELETE /api/playlists/:id`

`GET /api/playlists` response:

```json
{
  "items": []
}
```

`GET /api/playlists/:id` response:

```json
{
  "id": "pl_123",
  "name": "Night Drive",
  "description": "Late playlist",
  "items": []
}
```

### `POST /api/playlists/:id/tracks`

Adds a track to playlist.

### `PATCH /api/playlists/:id/tracks/reorder`

Reorders playlist items using an ordered list of track IDs or item IDs.

Request:

```json
{
  "trackIds": ["trk_1", "trk_2", "trk_3"]
}
```

### `DELETE /api/playlists/:id/tracks/:trackId`

Removes a track from playlist.

## Auth Rules

- All `/api/tracks*`, `/api/playlists*`, and `/api/me` endpoints require a valid signed session cookie.
- Owner checks are enforced server-side on every track and playlist mutation/read.
- `POST /api/tracks/from-telegram` is limited to bot-authenticated/internal use.
- `POST /api/telegram/webhook` requires the `x-telegram-bot-api-secret-token` header matching `TELEGRAM_WEBHOOK_SECRET`.

## Common Error Codes

- `UNAUTHORIZED`
- `FORBIDDEN`
- `NOT_FOUND`
- `VALIDATION_ERROR`
- `UNSUPPORTED_MEDIA`
- `FILE_TOO_LARGE`
- `RATE_LIMITED`
- `DUPLICATE_TRACK`
- `INTERNAL_ERROR`
