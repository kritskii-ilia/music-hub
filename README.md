# MyMusic

Telegram Mini App для персональной музыкальной библиотеки. Загружай треки, создавай плейлисты, слушай через встроенный плеер — всё внутри Telegram.

## Features

- Загрузка треков через Mini App или пересылка боту
- Плейлисты: создание, переименование, reorder треков
- Встроенный плеер: play/pause, next/prev, seek, очередь
- Поиск и фильтрация треков
- Избранное и метаданные
- Attachment Menu интеграция
- Авторизация через Telegram initData

## Tech Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- PostgreSQL + Prisma
- MinIO / S3 (хранение файлов)
- Telegram Bot API + Mini Apps

## Quick Start

```bash
docker compose up -d postgres minio
npm install
npx prisma generate && npm run prisma:migrate
npm run dev
# В другом терминале:
npm run bot:dev
```

## Tests

```bash
npm test
npm run lint
npm run build
```
