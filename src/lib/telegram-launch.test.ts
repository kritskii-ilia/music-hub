import { describe, expect, it } from "vitest";

import { detectTelegramLaunchContext, parseInitDataUnsafe } from "@/lib/telegram-launch";

describe("telegram launch context", () => {
  it("detects attachment menu from receiver payload", () => {
    const initDataUnsafe = parseInitDataUnsafe(
      'query_id=1&user=%7B%22id%22%3A1%7D&receiver=%7B%22id%22%3A2%7D&start_param=mymusic',
    );

    expect(
      detectTelegramLaunchContext({
        isTelegram: true,
        initDataUnsafe,
      }),
    ).toBe("attachment_menu");
  });

  it("detects direct link from chat context fields", () => {
    const initDataUnsafe = parseInitDataUnsafe(
      'query_id=1&user=%7B%22id%22%3A1%7D&chat_type=group&chat_instance=abc',
    );

    expect(
      detectTelegramLaunchContext({
        isTelegram: true,
        initDataUnsafe,
      }),
    ).toBe("direct_link");
  });

  it("falls back to bot menu when only regular init data is present", () => {
    const initDataUnsafe = parseInitDataUnsafe('query_id=1&user=%7B%22id%22%3A1%7D');

    expect(
      detectTelegramLaunchContext({
        isTelegram: true,
        initDataUnsafe,
      }),
    ).toBe("bot_menu");
  });
});
