import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";

import { env } from "@/lib/env";
import { ApiError } from "@/server/api/errors";

const secret = new TextEncoder().encode(env.SESSION_SECRET);

export type SessionPayload = {
  sub: string;
  telegramUserId: string;
};

export async function signSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySession(token: string) {
  const result = await jwtVerify<SessionPayload>(token, secret);
  return result.payload;
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(env.SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    return await verifySession(token);
  } catch {
    return null;
  }
}

export async function requireSession() {
  const session = await getSession();

  if (!session?.sub || !session.telegramUserId) {
    throw new ApiError(401, "UNAUTHORIZED", "Authentication required.");
  }

  return session;
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(env.SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}
