# MyMusic Attachment Menu Integration

## What Is Implemented In Code

- The existing Mini App can now be opened from:
  - the bot chat via Web App button
  - a direct Mini App link
  - the Telegram attachment menu after bot setup
- The bot `/start` flow now includes:
  - `Open MyMusic`
  - `Install in 📎`
  - `Direct Link`
- The frontend detects launch context from Telegram `initData` and shows a contextual banner when opened from the attachment menu.

## Official References

- `https://core.telegram.org/bots/webapps#attachment-menu`
- `https://core.telegram.org/bots/features#attachment-menu`
- `https://core.telegram.org/bots/webapps#initializing-mini-apps`

## Manual BotFather Setup

Telegram attachment menu configuration is not fully automatable from this repository. The remaining setup is manual in BotFather.

### Required BotFather Steps

1. Open `@BotFather`.
2. Run `/mybots` and choose your bot.
3. Open `Bot Settings`.
4. Configure the bot as a Web App / Mini App bot if not already done:
   - set the Mini App URL
   - configure the Mini App short name if you want the `t.me/<bot>/<short_name>` direct link
5. Configure attachment menu support:
   - enable attachment menu for the bot
   - set the same Web App URL that should open MyMusic
   - choose the supported chat types if BotFather asks

## Deep Links Used By This Project

- Direct Mini App link pattern:
  - `https://t.me/<bot_username>/<mini_app_short_name>`
- Attachment menu install link pattern:
  - `https://t.me/<bot_username>?startattach=<start_param>&choose=users+groups+channels+bots`

The project exposes these through bot buttons, using:

- `TELEGRAM_BOT_USERNAME`
- `TELEGRAM_MINI_APP_SHORT_NAME`
- `ATTACHMENT_MENU_START_PARAM`

## How To Test Attachment Menu

1. Configure the bot in BotFather.
2. Set `.env` with the real bot token, username, and public app URL.
3. Run the project and bot worker.
4. Open the bot in Telegram and run `/start`.
5. Tap `Install in 📎`.
6. Accept Telegram's prompt to add MyMusic to the attachment menu.
7. Open a supported chat, press 📎, and choose `MyMusic`.
8. Verify that:
   - the existing Mini App opens
   - Telegram auth still succeeds
   - Home / My Music / Playlists / Import / Player still work

## Limitations

- BotFather setup remains manual.
- Attachment menu availability depends on Telegram account/client support and the bot being configured correctly.
- Per Telegram's official docs, launching from the attachment menu in production is restricted; all bots can test this flow on the test environment, while production access is limited.
- This integration does not create a native Telegram tab and does not modify Telegram client UI.
