import type { XSession } from "@/lib/session";

const X_API_BASE = "https://api.x.com/2";

const dailyRequestState = {
  date: "",
  used: 0,
};

function applyDailyRequestBudget() {
  const rawBudget = process.env.X_DAILY_REQUEST_BUDGET;
  if (!rawBudget) return;

  const budget = Number(rawBudget);
  if (!Number.isFinite(budget) || budget <= 0) return;

  const today = new Date().toISOString().slice(0, 10);
  if (dailyRequestState.date !== today) {
    dailyRequestState.date = today;
    dailyRequestState.used = 0;
  }

  if (dailyRequestState.used + 1 > budget) {
    throw new Error(
      `X daily request budget exceeded (${dailyRequestState.used}/${budget}). Try again tomorrow or raise X_DAILY_REQUEST_BUDGET.`,
    );
  }

  dailyRequestState.used += 1;
}

export type XTokenResponse = {
  token_type: string;
  expires_in: number;
  access_token: string;
  scope?: string;
  refresh_token?: string;
};

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

function basicAuthHeader(clientId: string, clientSecret: string) {
  const encoded = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  return `Basic ${encoded}`;
}

export async function xOAuthToken(params: URLSearchParams) {
  const tokenUrl = process.env.X_TOKEN_URL ?? "https://api.x.com/2/oauth2/token";
  const clientId = requireEnv("X_CLIENT_ID");
  const clientSecret = process.env.X_CLIENT_SECRET;

  // For public clients, docs show passing client_id in the body.
  if (!clientSecret && !params.has("client_id")) {
    params.set("client_id", clientId);
  }

  const headers: Record<string, string> = {
    "content-type": "application/x-www-form-urlencoded",
  };
  if (clientSecret) {
    headers.authorization = basicAuthHeader(clientId, clientSecret);
  }

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers,
    body: params.toString(),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(`X token error ${res.status}: ${text.slice(0, 400)}`);
  return JSON.parse(text) as XTokenResponse;
}

export async function xOAuthRevoke(token: string) {
  const revokeUrl = process.env.X_REVOKE_URL ?? "https://api.x.com/2/oauth2/revoke";
  const clientId = requireEnv("X_CLIENT_ID");
  const clientSecret = process.env.X_CLIENT_SECRET;

  const params = new URLSearchParams();
  params.set("token", token);
  params.set("client_id", clientId);

  const headers: Record<string, string> = {
    "content-type": "application/x-www-form-urlencoded",
  };
  if (clientSecret) {
    headers.authorization = basicAuthHeader(clientId, clientSecret);
  }

  const res = await fetch(revokeUrl, { method: "POST", headers, body: params.toString() });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`X revoke error ${res.status}: ${text.slice(0, 400)}`);
  }
}

export async function xFetch(path: string, accessToken: string, init?: RequestInit) {
  const url = path.startsWith("http") ? path : `${X_API_BASE}${path}`;

  applyDailyRequestBudget();

  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      authorization: `Bearer ${accessToken}`,
    },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`X API ${res.status}: ${text.slice(0, 500)}`);
  }
  return text ? JSON.parse(text) : null;
}

export function isExpired(session: XSession, skewSeconds = 60) {
  const now = Math.floor(Date.now() / 1000);
  return session.expires_at <= now + skewSeconds;
}

