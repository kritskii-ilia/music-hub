import "dotenv/config";

import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_BASE_PATH: z.string().default(""),
  SESSION_COOKIE_NAME: z.string().min(1).default("music_hub_session"),
  SESSION_SECRET: z.string().min(16),
  DATABASE_URL: z.string().min(1),
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  TELEGRAM_BOT_USERNAME: z.string().min(1),
  TELEGRAM_WEBHOOK_SECRET: z.string().min(1),
  TELEGRAM_MINI_APP_SHORT_NAME: z.string().min(1).default("mymusic"),
  ATTACHMENT_MENU_START_PARAM: z.string().min(1).default("mymusic"),
  NEXT_PUBLIC_TELEGRAM_BOT_USERNAME: z.string().min(1),
  NEXT_PUBLIC_MINI_APP_NAME: z.string().min(1).default("MyMusic"),
  S3_ENDPOINT: z.string().min(1),
  S3_REGION: z.string().min(1).default("us-east-1"),
  S3_BUCKET: z.string().min(1),
  S3_ACCESS_KEY: z.string().min(1),
  S3_SECRET_KEY: z.string().min(1),
  S3_FORCE_PATH_STYLE: z
    .string()
    .default("true")
    .transform((value) => value === "true"),
  STORAGE_PUBLIC_BASE_URL: z.string().url(),
  MAX_UPLOAD_BYTES: z
    .string()
    .default("31457280")
    .transform((value) => Number.parseInt(value, 10)),
  TELEGRAM_BOT_MODE: z.enum(["polling", "webhook"]).default("polling"),
});

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  APP_URL: process.env.APP_URL ?? "http://localhost:3000",
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  NEXT_PUBLIC_BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
  SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME ?? "music_hub_session",
  SESSION_SECRET: process.env.SESSION_SECRET ?? "test-session-secret-123456",
  DATABASE_URL:
    process.env.DATABASE_URL ?? "postgresql://music_hub:music_hub@localhost:5432/music_hub?schema=public",
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN ?? "test:token",
  TELEGRAM_BOT_USERNAME: process.env.TELEGRAM_BOT_USERNAME ?? "music_hub_bot",
  TELEGRAM_WEBHOOK_SECRET: process.env.TELEGRAM_WEBHOOK_SECRET ?? "telegram-webhook-secret",
  TELEGRAM_MINI_APP_SHORT_NAME: process.env.TELEGRAM_MINI_APP_SHORT_NAME ?? "mymusic",
  ATTACHMENT_MENU_START_PARAM: process.env.ATTACHMENT_MENU_START_PARAM ?? "mymusic",
  NEXT_PUBLIC_TELEGRAM_BOT_USERNAME: process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? "music_hub_bot",
  NEXT_PUBLIC_MINI_APP_NAME: process.env.NEXT_PUBLIC_MINI_APP_NAME ?? "MyMusic",
  S3_ENDPOINT: process.env.S3_ENDPOINT ?? "http://localhost:9000",
  S3_REGION: process.env.S3_REGION ?? "us-east-1",
  S3_BUCKET: process.env.S3_BUCKET ?? "music-hub",
  S3_ACCESS_KEY: process.env.S3_ACCESS_KEY ?? "minioadmin",
  S3_SECRET_KEY: process.env.S3_SECRET_KEY ?? "minioadmin",
  S3_FORCE_PATH_STYLE: process.env.S3_FORCE_PATH_STYLE ?? "true",
  STORAGE_PUBLIC_BASE_URL: process.env.STORAGE_PUBLIC_BASE_URL ?? "http://localhost:9000/music-hub",
  MAX_UPLOAD_BYTES: process.env.MAX_UPLOAD_BYTES ?? "31457280",
  TELEGRAM_BOT_MODE: process.env.TELEGRAM_BOT_MODE,
});
