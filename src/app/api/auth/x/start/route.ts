import { randomBase64Url, sha256Base64Url } from "@/lib/crypto";
import { setTempOAuth } from "@/lib/session";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

export async function GET() {
  const clientId = requireEnv("X_CLIENT_ID");
  const redirectUri = requireEnv("X_REDIRECT_URI");
  const authorizeUrl = process.env.X_AUTHORIZE_URL ?? "https://x.com/i/oauth2/authorize";
  const scopes = process.env.X_SCOPES ?? "tweet.read users.read bookmark.read offline.access";

  const state = randomBase64Url(24);
  const codeVerifier = randomBase64Url(48);
  const codeChallenge = sha256Base64Url(codeVerifier);

  await setTempOAuth({
    state,
    code_verifier: codeVerifier,
    created_at: Math.floor(Date.now() / 1000),
  });

  const u = new URL(authorizeUrl);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("client_id", clientId);
  u.searchParams.set("redirect_uri", redirectUri);
  u.searchParams.set("scope", scopes);
  u.searchParams.set("state", state);
  u.searchParams.set("code_challenge", codeChallenge);
  u.searchParams.set("code_challenge_method", "S256");

  return NextResponse.redirect(u.toString());
}

