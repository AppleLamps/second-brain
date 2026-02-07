import { clearTempOAuth, getTempOAuth, setSession } from "@/lib/session";
import { xFetch, xOAuthToken } from "@/lib/x";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    await clearTempOAuth();
    return NextResponse.redirect(new URL(`/app?auth=error&error=${encodeURIComponent(error)}`, url));
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL("/app?auth=missing_code", url));
  }

  const temp = await getTempOAuth();
  await clearTempOAuth();
  if (!temp || temp.state !== state) {
    return NextResponse.redirect(new URL("/app?auth=bad_state", url));
  }

  const redirectUri = requireEnv("X_REDIRECT_URI");

  const params = new URLSearchParams();
  params.set("grant_type", "authorization_code");
  params.set("code", code);
  params.set("redirect_uri", redirectUri);
  params.set("code_verifier", temp.code_verifier);

  // For public clients, docs require client_id in body. Our helper adds it.
  const token = await xOAuthToken(params);

  const expiresAt = Math.floor(Date.now() / 1000) + (token.expires_in ?? 0) - 30;

  // Fetch user identity (helps build profile URLs and user-scoped endpoints).
  let me: { data?: { id: string; username?: string; name?: string } } | null = null;
  try {
    me = await xFetch("/users/me?user.fields=username,name", token.access_token);
  } catch {
    // Not fatal; the session can still be used for bookmark calls.
  }

  await setSession({
    access_token: token.access_token,
    refresh_token: token.refresh_token,
    expires_at: expiresAt,
    scope: token.scope,
    token_type: token.token_type,
    user: me?.data?.id
      ? { id: me.data.id, username: me.data.username, name: me.data.name }
      : undefined,
  });

  return NextResponse.redirect(new URL("/app", url));
}
