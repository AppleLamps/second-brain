import { clearSession, getSession } from "@/lib/session";
import { xOAuthRevoke } from "@/lib/x";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  const session = await getSession();

  // Best-effort revoke. If it fails, still clear local session.
  try {
    if (session?.refresh_token) await xOAuthRevoke(session.refresh_token);
    else if (session?.access_token) await xOAuthRevoke(session.access_token);
  } catch {
    // ignore
  }

  await clearSession();
  return NextResponse.json({ ok: true, redirect: "/" }, { status: 200 });
}
