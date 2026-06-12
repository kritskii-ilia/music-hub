import { apiPath, withBasePath } from "@/lib/paths";

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T & {
    error?: {
      code: string;
      message: string;
    };
  };

  if (!response.ok) {
    throw new Error(payload.error?.message ?? "Request failed.");
  }

  return payload;
}

export async function apiGet<T>(input: string) {
  const response = await fetch(resolveClientPath(input), {
    credentials: "include",
    cache: "no-store",
  });

  return parseResponse<T>(response);
}

export async function apiSend<T>(input: string, init: RequestInit) {
  const response = await fetch(resolveClientPath(input), {
    ...init,
    credentials: "include",
  });

  return parseResponse<T>(response);
}

function resolveClientPath(input: string) {
  if (/^https?:\/\//.test(input)) {
    return input;
  }

  if (input.startsWith("/api/")) {
    return apiPath(input);
  }

  return withBasePath(input);
}
