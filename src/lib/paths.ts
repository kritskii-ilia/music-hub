import { env } from "@/lib/env";

export function getBasePath() {
  const basePath = env.NEXT_PUBLIC_BASE_PATH.trim();

  if (!basePath) {
    return "";
  }

  return basePath.startsWith("/") ? basePath : `/${basePath}`;
}

export function withBasePath(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const basePath = getBasePath();

  if (!basePath) {
    return normalizedPath;
  }

  if (normalizedPath === "/") {
    return basePath;
  }

  return `${basePath}${normalizedPath}`;
}

export function apiPath(path: string) {
  return withBasePath(path.startsWith("/api/") ? path : `/api/${path.replace(/^\//, "")}`);
}
