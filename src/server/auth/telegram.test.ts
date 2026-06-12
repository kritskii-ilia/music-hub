import crypto from "node:crypto";
import { describe, expect, it } from "vitest";

import { buildDataCheckString, verifyTelegramInitData } from "@/server/auth/telegram";

function createSignedInitData(botToken: string) {
  const params = new URLSearchParams({
    auth_date: String(Math.floor(Date.now() / 1000)),
    query_id: "AAHdF6IQAAAAAN0XohDhrOrc",
    user: JSON.stringify({
      id: 123456789,
      first_name: "Alice",
      username: "alice",
    }),
  });
  const dataCheckString = buildDataCheckString(params.toString());
  const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
  const hash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");
  params.set("hash", hash);

  return params.toString();
}

describe("verifyTelegramInitData", () => {
  it("accepts valid signed init data", () => {
    const botToken = "123:telegram-token";
    const payload = verifyTelegramInitData(createSignedInitData(botToken), botToken);

    expect(payload.user.id).toBe(123456789);
    expect(payload.user.username).toBe("alice");
  });

  it("rejects invalid hash", () => {
    expect(() =>
      verifyTelegramInitData(
        "auth_date=123&query_id=abc&user=%7B%22id%22%3A1%7D&hash=bad",
        "123:telegram-token",
      ),
    ).toThrowError(/verification failed/i);
  });
});
