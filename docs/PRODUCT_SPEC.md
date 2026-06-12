# MyMusic Product Spec

## Summary

MyMusic is a Telegram Mini App that gives users a dedicated, personal "My Music" area for tracks they intentionally import or upload. The product avoids the clutter of global Telegram search and does not attempt to access private chat history.

## Core User Flows

### Open and browse

1. User opens the bot.
2. User taps `Open MyMusic`.
3. Mini App opens to Home.
4. User navigates to My Music, Playlists, Favorites, Recently Added, or Import.

### Open from attachment menu

1. User installs MyMusic in the Telegram attachment menu.
2. User opens a chat and taps 📎.
3. User chooses `MyMusic`.
4. The same Mini App opens with the existing library, import, playlist, and player experience.

### Import from Mini App

1. User opens Import.
2. User uploads a supported music file.
3. Backend validates type and size.
4. Track is saved to storage and library.
5. User sees the new track in Recent and My Music.

### Import by forwarding to bot

1. User forwards an audio track to the bot.
2. Bot validates the message and downloads the file via Telegram Bot API.
3. Backend stores the file and creates or reuses a deduplicated track.
4. Bot replies with success or a clear rejection reason.

### Organize and play

1. User opens a track.
2. User edits title, artist, album, or favorite state.
3. User adds the track to a playlist.
4. User plays music through the sticky bottom player and queue.

## MVP Screens

- Home / dashboard
- My Music
- Track details/edit
- Playlists list
- Playlist details
- Import
- Settings / Help

## Telegram Mini App Constraints

- Mini App cannot read personal chats or scan Saved Messages automatically.
- Bot can only process media the user explicitly sends or forwards to it.
- Telegram theme and viewport params should be consumed when available, but the app must still work in a browser preview.
- Native Telegram tabs cannot be replaced; all music UX lives inside the Mini App shell.

## Supported Media

- `mp3`
- `m4a`
- `aac`
- `ogg` only for non-voice music files
- `flac` when provided as regular file/document

## Explicit Non-Goals

- External streaming catalog integrations
- Mass chat import
- Social feed/recommendations
- DRM or licensed streaming
- Desktop-first feature complexity
