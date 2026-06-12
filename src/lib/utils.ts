import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeText(value: string | null | undefined, fallback = "") {
  if (!value) {
    return fallback;
  }

  return value.replace(/\s+/g, " ").replace(/[<>]/g, "").trim();
}

export function slugifyFilename(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatDuration(totalSeconds: number | null | undefined) {
  if (!totalSeconds || totalSeconds < 0) {
    return "0:00";
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
