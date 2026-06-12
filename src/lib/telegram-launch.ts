export type TelegramLaunchContext =
  | "browser"
  | "bot_menu"
  | "attachment_menu"
  | "direct_link";

export type TelegramInitDataUnsafe = {
  query_id?: string;
  user?: {
    id: number;
    username?: string;
    first_name?: string;
    last_name?: string;
    language_code?: string;
    photo_url?: string;
  };
  receiver?: {
    id: number;
    username?: string;
    first_name?: string;
    last_name?: string;
    photo_url?: string;
  };
  chat?: {
    id: number;
    type: "private" | "group" | "supergroup" | "channel";
    title?: string;
    username?: string;
    photo_url?: string;
  };
  chat_type?: "sender" | "private" | "group" | "supergroup" | "channel";
  chat_instance?: string;
  start_param?: string;
};

export function parseInitDataUnsafe(initData: string): TelegramInitDataUnsafe {
  const params = new URLSearchParams(initData);

  return {
    query_id: params.get("query_id") ?? undefined,
    user: parseJson(params.get("user")),
    receiver: parseJson(params.get("receiver")),
    chat: parseJson(params.get("chat")),
    chat_type:
      (params.get("chat_type") as TelegramInitDataUnsafe["chat_type"] | null) ??
      undefined,
    chat_instance: params.get("chat_instance") ?? undefined,
    start_param: params.get("start_param") ?? undefined,
  };
}

export function detectTelegramLaunchContext(input: {
  isTelegram: boolean;
  initDataUnsafe: TelegramInitDataUnsafe;
}) {
  if (!input.isTelegram) {
    return "browser" satisfies TelegramLaunchContext;
  }

  if (input.initDataUnsafe.receiver || input.initDataUnsafe.chat) {
    return "attachment_menu" satisfies TelegramLaunchContext;
  }

  if (input.initDataUnsafe.chat_type || input.initDataUnsafe.chat_instance) {
    return "direct_link" satisfies TelegramLaunchContext;
  }

  return "bot_menu" satisfies TelegramLaunchContext;
}

function parseJson<T>(value: string | null): T | undefined {
  if (!value) {
    return undefined;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
}
