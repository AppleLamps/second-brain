import { cookies } from "next/headers";
import { EncryptJWT, jwtDecrypt } from "jose";
import crypto from "node:crypto";

const SESSION_COOKIE = "sb_session";
const OAUTH_COOKIE = "sb_oauth";

type AnyObj = Record<string, unknown>;

function getKey() {
  const secret = process.env.APP_SECRET;
  if (!secret) throw new Error("Missing APP_SECRET");
  // Derive a stable 32-byte key suitable for direct symmetric encryption.
  return crypto.createHash("sha256").update(secret).digest();
}

async function encrypt(payload: AnyObj, maxAgeSeconds: number) {
  const key = getKey();
  const now = Math.floor(Date.now() / 1000);
  return await new EncryptJWT(payload)
    .setProtectedHeader({ alg: "dir", enc: "A256GCM", typ: "JWT" })
    .setIssuedAt(now)
    .setExpirationTime(now + maxAgeSeconds)
    .encrypt(key);
}

async function decrypt(token: string) {
  const key = getKey();
  const { payload } = await jwtDecrypt(token, key, {
    keyManagementAlgorithms: ["dir"],
    contentEncryptionAlgorithms: ["A256GCM"],
  });
  return payload as AnyObj;
}

export type XSession = {
  access_token: string;
  refresh_token?: string;
  expires_at: number; // epoch seconds
  scope?: string;
  token_type?: string;
  user?: { id: string; username?: string; name?: string };
};

export type OAuthTemp = {
  state: string;
  code_verifier: string;
  created_at: number; // epoch seconds
};

export async function setTempOAuth(data: OAuthTemp) {
  const value = await encrypt(data, 10 * 60);
  const jar = await cookies();
  jar.set(OAUTH_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 10 * 60,
  });
}

export async function getTempOAuth() {
  const jar = await cookies();
  const c = jar.get(OAUTH_COOKIE)?.value;
  if (!c) return null;
  try {
    const p = (await decrypt(c)) as unknown as OAuthTemp;
    return p;
  } catch {
    return null;
  }
}

export async function clearTempOAuth() {
  const jar = await cookies();
  jar.set(OAUTH_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function setSession(session: XSession) {
  const value = await encrypt(session, 60 * 60 * 24 * 30);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getSession() {
  const jar = await cookies();
  const c = jar.get(SESSION_COOKIE)?.value;
  if (!c) return null;
  try {
    const p = (await decrypt(c)) as unknown as XSession;
    if (!p?.access_token) return null;
    return p;
  } catch {
    return null;
  }
}

export async function clearSession() {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
