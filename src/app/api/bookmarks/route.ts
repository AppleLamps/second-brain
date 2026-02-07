import { getSession, setSession } from "@/lib/session";
import { db } from "@/lib/db";
import { isExpired, xFetch, xOAuthToken } from "@/lib/x";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const QSchema = z.object({
  folder_id: z.string().optional(),
  max_results: z.coerce.number().int().min(1).max(100).optional(),
  pagination_token: z.string().optional(),
  force_refresh: z.coerce.boolean().optional(),
});

type XBookmarkFolder = { id: string; name: string };

type XBookmarksResponse = {
  data?: Array<{
    id: string;
    text?: string;
    created_at?: string;
    author_id?: string;
    public_metrics?: {
      like_count?: number;
      retweet_count?: number;
      reply_count?: number;
      impression_count?: number;
    };
    entities?: {
      hashtags?: Array<{ tag: string }>;
      cashtags?: Array<{ tag: string }>;
      mentions?: Array<{ username: string }>;
      urls?: Array<{ expanded_url?: string; display_url?: string }>;
    };
  }>;
  includes?: {
    users?: Array<{ id: string; name?: string; username?: string }>;
  };
  meta?: {
    next_token?: string;
    result_count?: number;
  };
};

function tagsFromEntities(
  e?: NonNullable<XBookmarksResponse["data"]>[number]["entities"],
) {
  const out: string[] = [];
  for (const h of e?.hashtags ?? []) out.push(`#${h.tag}`);
  for (const c of e?.cashtags ?? []) out.push(`$${c.tag}`);
  for (const m of e?.mentions ?? []) out.push(`@${m.username}`);
  for (const u of e?.urls ?? []) {
    const raw = u.expanded_url ?? u.display_url;
    if (!raw) continue;
    try {
      const host = new URL(raw).host.replace(/^www\./, "");
      out.push(host);
    } catch {
      // ignore
    }
  }
  return [...new Set(out)].slice(0, 8);
}

async function refreshIfNeeded(session: NonNullable<Awaited<ReturnType<typeof getSession>>>) {
  if (!isExpired(session)) return session;
  if (!session.refresh_token) return session;

  const params = new URLSearchParams();
  params.set("grant_type", "refresh_token");
  params.set("refresh_token", session.refresh_token);
  // For public clients, helper adds client_id

  const token = await xOAuthToken(params);
  const expiresAt = Math.floor(Date.now() / 1000) + (token.expires_in ?? 0) - 30;

  const next = {
    ...session,
    access_token: token.access_token,
    refresh_token: token.refresh_token ?? session.refresh_token,
    expires_at: expiresAt,
    scope: token.scope ?? session.scope,
    token_type: token.token_type ?? session.token_type,
  };
  await setSession(next);
  return next;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsedQ = QSchema.safeParse(Object.fromEntries(url.searchParams.entries()));
  if (!parsedQ.success) {
    return NextResponse.json({ error: "Invalid query", details: parsedQ.error.flatten() }, { status: 400 });
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Not connected", connect_url: "/api/auth/x/start" },
      { status: 401 },
    );
  }

  let live = session;
  const forceRefresh = Boolean(parsedQ.data.force_refresh);
  try {
    live = await refreshIfNeeded(session);
  } catch {
    // If refresh failed, client can reconnect.
    return NextResponse.json(
      { error: "Session expired", connect_url: "/api/auth/x/start" },
      { status: 401 },
    );
  }

  const me =
    live.user?.id
      ? { data: live.user }
      : ((await xFetch("/users/me?user.fields=username,name", live.access_token)) as {
          data: { id: string; username?: string; name?: string };
        });

  const max = parsedQ.data.max_results ?? 50;
  const folderId = parsedQ.data.folder_id ?? null;
  const paginationToken = parsedQ.data.pagination_token ?? null;
  const dbOffset = paginationToken ? Number.parseInt(paginationToken, 10) : 0;
  const dbPaginationOk = paginationToken ? Number.isFinite(dbOffset) : true;

  if (process.env.DATABASE_URL && !forceRefresh && dbPaginationOk) {
    try {
      const sql = db();
      const whereFolder = folderId
        ? sql`and folder_id = ${folderId}`
        : sql``;

      const totalRows = await sql<
        Array<{ count: number }>
      >`select count(*)::int as count from sb_bookmarks where x_user_id = ${me.data.id} ${whereFolder}`;
      const total = totalRows?.[0]?.count ?? 0;

      if (total > 0) {
        const rows = await sql<
          Array<{
            tweet_id: string;
            text: string | null;
            author_id: string | null;
            author_username: string | null;
            author_name: string | null;
            post_created_at: Date | null;
            last_seen_at: Date | null;
            url: string | null;
            tags: string[] | null;
            like_count: number | null;
            repost_count: number | null;
            reply_count: number | null;
            impression_count: number | null;
            folder_id: string | null;
          }>
        >`
          select
            tweet_id,
            text,
            author_id,
            author_username,
            author_name,
            post_created_at,
            last_seen_at,
            url,
            tags,
            like_count,
            repost_count,
            reply_count,
            impression_count,
            folder_id
          from sb_bookmarks
          where x_user_id = ${me.data.id} ${whereFolder}
          order by last_seen_at desc nulls last
          limit ${max} offset ${dbOffset}
        `;

        const items =
          rows?.map((row) => {
            const username = row.author_username ?? "user";
            return {
              id: row.tweet_id,
              text: row.text ?? "",
              author: {
                id: row.author_id ?? "",
                name: row.author_name ?? username,
                username,
              },
              createdAt: (row.post_created_at ?? row.last_seen_at ?? new Date()).toISOString(),
              savedAt: (row.last_seen_at ?? row.post_created_at ?? new Date()).toISOString(),
              url: row.url ?? `https://x.com/${username}/status/${row.tweet_id}`,
              metrics: {
                likeCount: row.like_count ?? undefined,
                repostCount: row.repost_count ?? undefined,
                replyCount: row.reply_count ?? undefined,
                impressionCount: row.impression_count ?? undefined,
              },
              tags: Array.isArray(row.tags) ? row.tags : [],
              folderId: row.folder_id ?? undefined,
            };
          }) ?? [];

        const folders = await sql<Array<{ folder_id: string; name: string }>>`
          select folder_id, name
          from sb_bookmark_folders
          where x_user_id = ${me.data.id}
          order by name asc
        `;

        const nextOffset = dbOffset + items.length;
        return NextResponse.json({
          user: me.data,
          folders: folders.map((f) => ({ id: f.folder_id, name: f.name })),
          items,
          meta: {
            result_count: items.length,
            next_token: nextOffset < total ? String(nextOffset) : undefined,
          },
        });
      }
    } catch {
      // If DB fails, fall back to live API.
    }
  }

  // Folders
  const foldersResp = (await xFetch(
    `/users/${me.data.id}/bookmarks/folders?max_results=100`,
    live.access_token,
  )) as { data?: XBookmarkFolder[]; meta?: { next_token?: string } };

  const tweetFields = [
    "created_at",
    "author_id",
    "public_metrics",
    "entities",
  ].join(",");
  const userFields = ["username", "name"].join(",");
  const expansions = ["author_id"].join(",");

  let bookmarksPath: string;
  if (folderId) {
    const qs = new URLSearchParams();
    // Even if the OpenAPI snapshot doesn't list these params for folder lookup,
    // passing them is harmless if ignored, and enables pagination if supported.
    qs.set("max_results", String(max));
    if (paginationToken) qs.set("pagination_token", paginationToken);
    qs.set("tweet.fields", tweetFields);
    qs.set("expansions", expansions);
    qs.set("user.fields", userFields);

    bookmarksPath = `/users/${me.data.id}/bookmarks/folders/${encodeURIComponent(folderId)}?${qs.toString()}`;
  } else {
    const qs = new URLSearchParams();
    qs.set("max_results", String(max));
    if (paginationToken) qs.set("pagination_token", paginationToken);
    qs.set("tweet.fields", tweetFields);
    qs.set("expansions", expansions);
    qs.set("user.fields", userFields);
    bookmarksPath = `/users/${me.data.id}/bookmarks?${qs.toString()}`;
  }

  const raw = (await xFetch(bookmarksPath, live.access_token)) as XBookmarksResponse;
  const usersById = new Map<string, { id: string; username?: string; name?: string }>();
  for (const u of raw.includes?.users ?? []) usersById.set(u.id, u);

  const items =
    raw.data?.map((t) => {
      const u = t.author_id ? usersById.get(t.author_id) : undefined;
      const username = u?.username ?? "user";
      return {
        id: t.id,
        text: t.text ?? "",
        author: {
          id: t.author_id ?? "",
          name: u?.name ?? username,
          username,
        },
        createdAt: t.created_at ?? new Date().toISOString(),
        // X does not currently return a "bookmark saved at" timestamp in this payload.
        // We keep `savedAt` for UI consistency, but the UI should not present this as "saved".
        savedAt: t.created_at ?? new Date().toISOString(),
        url: `https://x.com/${username}/status/${t.id}`,
        metrics: {
          likeCount: t.public_metrics?.like_count,
          repostCount: t.public_metrics?.retweet_count,
          replyCount: t.public_metrics?.reply_count,
          impressionCount: t.public_metrics?.impression_count,
        },
        tags: tagsFromEntities(t.entities),
      };
    }) ?? [];

  // Persist to Neon if configured. This is best-effort; live API response is still returned.
  if (process.env.DATABASE_URL) {
    try {
      const sql = db();
      const now = new Date();

      await sql.begin(async (tx) => {
        // postgres.js transaction type doesn't expose template-tag call signature in typings.
        // Runtime does support it, so we cast for ergonomic parameterized queries.
        const q = tx as unknown as ReturnType<typeof db>;

        await q`
          insert into sb_users (x_user_id, username, name, updated_at)
          values (${me.data.id}, ${me.data.username ?? null}, ${me.data.name ?? null}, ${now})
          on conflict (x_user_id) do update
          set username = excluded.username,
              name = excluded.name,
              updated_at = excluded.updated_at
        `;

        // Upsert folders (for the UI list + for later mapping work).
        for (const f of foldersResp.data ?? []) {
          await q`
            insert into sb_bookmark_folders (x_user_id, folder_id, name, updated_at)
            values (${me.data.id}, ${f.id}, ${f.name}, ${now})
            on conflict (x_user_id, folder_id) do update
            set name = excluded.name,
                updated_at = excluded.updated_at
          `;
        }

        const folderIdForItems = folderId ?? null;
        for (const it of items) {
          await q`
            insert into sb_bookmarks (
              x_user_id, tweet_id, folder_id, text,
              author_id, author_username, author_name,
              post_created_at, first_seen_at, last_seen_at,
              like_count, repost_count, reply_count, impression_count,
              url, tags
            )
            values (
              ${me.data.id}, ${it.id}, ${folderIdForItems},
              ${it.text},
              ${it.author.id || null}, ${it.author.username || null}, ${it.author.name || null},
              ${new Date(it.createdAt)},
              ${now}, ${now},
              ${it.metrics?.likeCount ?? null},
              ${it.metrics?.repostCount ?? null},
              ${it.metrics?.replyCount ?? null},
              ${it.metrics?.impressionCount ?? null},
              ${it.url ?? null},
              ${JSON.stringify(it.tags ?? [])}::jsonb
            )
            on conflict (x_user_id, tweet_id) do update
            set folder_id = coalesce(excluded.folder_id, sb_bookmarks.folder_id),
                text = excluded.text,
                author_id = excluded.author_id,
                author_username = excluded.author_username,
                author_name = excluded.author_name,
                post_created_at = excluded.post_created_at,
                last_seen_at = excluded.last_seen_at,
                like_count = excluded.like_count,
                repost_count = excluded.repost_count,
                reply_count = excluded.reply_count,
                impression_count = excluded.impression_count,
                url = excluded.url,
                tags = excluded.tags
          `;
        }
      });
    } catch {
      // Ignore DB failures for now; the app still functions off live calls.
    }
  }

  return NextResponse.json({
    user: me.data,
    folders: foldersResp.data ?? [],
    items,
    meta: raw.meta ?? {},
  });
}
