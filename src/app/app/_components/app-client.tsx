"use client";

import type { BookmarkItem } from "@/lib/types";
import { LogOut, RotateCw, Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { GrokPanel } from "./grok-panel";
import { FolderTabs, type FolderTab } from "./folder-tabs";
import { BookmarkList } from "./bookmark-list";

type ApiResp = {
  user: { id: string; username?: string; name?: string };
  folders: Array<{ id: string; name: string }>;
  items: BookmarkItem[];
  meta?: { next_token?: string; result_count?: number };
};

export function AppClient() {
  const [isPending, startTransition] = useTransition();
  const [activeFolder, setActiveFolder] = useState<string>("all");
  const [data, setData] = useState<Omit<ApiResp, "items" | "meta"> | null>(null);
  const [items, setItems] = useState<BookmarkItem[]>([]);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");
  const [sortKey, setSortKey] = useState<"newest" | "likes" | "impressions">(
    "newest",
  );
  const [error, setError] = useState<string | null>(null);
  const [connectUrl, setConnectUrl] = useState<string>("/api/auth/x/start");

  const tabs = useMemo<FolderTab[]>(() => {
    const base: FolderTab[] = [{ id: "all", name: "All bookmarks" }];
    for (const f of data?.folders ?? []) base.push({ id: f.id, name: f.name });
    return base;
  }, [data?.folders]);

  function fetchPage({
    folderId,
    paginationToken,
  }: {
    folderId: string;
    paginationToken?: string | null;
  }) {
    return new Promise<void>((resolve) => {
      startTransition(() => {
        (async () => {
          setError(null);
          const qs = new URLSearchParams();
          if (folderId !== "all") qs.set("folder_id", folderId);
          if (paginationToken) qs.set("pagination_token", paginationToken);

          const res = await fetch(`/api/bookmarks?${qs.toString()}`, {
            cache: "no-store",
          });
          if (res.status === 401) {
            const b = await res.json().catch(() => ({}));
            setConnectUrl(b.connect_url ?? "/api/auth/x/start");
            setError(b.error ?? "Not connected");
            setData(null);
            setItems([]);
            setNextToken(null);
            return;
          }
          const b = (await res.json()) as ApiResp;
          if (!res.ok) {
            setError(
              (b as unknown as { error?: string }).error ?? "Failed to load",
            );
            setData(null);
            setItems([]);
            setNextToken(null);
            return;
          }

          setData({ user: b.user, folders: b.folders });
          if (paginationToken) setItems((prev) => [...prev, ...b.items]);
          else setItems(b.items);
          setNextToken(b.meta?.next_token ?? null);
        })()
          .catch((e) => {
            setError(e instanceof Error ? e.message : "Failed to load");
            setData(null);
            setItems([]);
            setNextToken(null);
          })
          .finally(resolve);
      });
    });
  }

  useEffect(() => {
    // New folder selection: reset and fetch first page.
    setLoadingMore(false);
    void fetchPage({ folderId: activeFolder, paginationToken: null });
  }, [activeFolder, startTransition]);

  const title =
    activeFolder === "all"
      ? "All bookmarks"
      : data?.folders?.find((f) => f.id === activeFolder)?.name ?? "Folder";

  async function loadMore() {
    if (!nextToken || isPending) return;
    setLoadingMore(true);
    try {
      await fetchPage({ folderId: activeFolder, paginationToken: nextToken });
    } finally {
      setLoadingMore(false);
    }
  }

  async function refreshNow() {
    if (!data) return;
    setQuery("");
    await fetchPage({ folderId: activeFolder, paginationToken: null });
  }

  async function disconnect() {
    await fetch("/api/auth/logout", { method: "POST" });
    setData(null);
    setItems([]);
    setNextToken(null);
    setError("Disconnected");
  }

  const shownItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = items;
    if (q) {
      out = out.filter((b) => {
        const hay = [
          b.text,
          b.author.username,
          b.author.name,
          ...(b.tags ?? []),
          b.url ?? "",
        ]
          .join("\n")
          .toLowerCase();
        return hay.includes(q);
      });
    }

    const sorted = [...out];
    if (sortKey === "likes") {
      sorted.sort(
        (a, b) => (b.metrics?.likeCount ?? 0) - (a.metrics?.likeCount ?? 0),
      );
    } else if (sortKey === "impressions") {
      sorted.sort(
        (a, b) =>
          (b.metrics?.impressionCount ?? 0) - (a.metrics?.impressionCount ?? 0),
      );
    } else {
      sorted.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    }
    return sorted;
  }, [items, query, sortKey]);

  return (
    <main className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-6 py-10 lg:grid-cols-[1fr_380px]">
      <section>
        <div className="flex flex-col gap-4">
          <div>
            <div className="text-xs font-semibold tracking-[0.18em] uppercase text-[color:var(--muted-ink)]">
              Your bookmarks, reorganized
            </div>
            <h1 className="mt-2 font-[var(--font-display)] text-3xl tracking-[-0.03em]">
              Knowledge base
            </h1>
            <div className="mt-2 text-sm text-[color:var(--muted-ink)]">
              {data?.user?.username ? (
                <>
                  Connected as <span className="font-semibold">@{data.user.username}</span>
                </>
              ) : (
                "Connect to load your bookmarks."
              )}
            </div>
          </div>

          <FolderTabs folders={tabs} activeId={activeFolder} onChange={setActiveFolder} />
        </div>

        <div className="mt-6 rounded-[28px] border border-[var(--line)] bg-[var(--paper)] p-5 shadow-[0_30px_120px_var(--shadow)]">
          {error ? (
            <div className="rounded-[22px] border border-[color:rgba(255,93,74,0.35)] bg-[color:rgba(255,93,74,0.10)] p-6">
              <div className="text-sm font-semibold text-[color:rgba(16,17,20,0.88)]">
                {error}
              </div>
              <div className="mt-2 text-sm text-[color:rgba(16,17,20,0.72)]">
                This app needs X OAuth 2.0 (PKCE) with scopes:{" "}
                <span className="font-mono">bookmark.read tweet.read users.read offline.access</span>
              </div>
              <a
                href={connectUrl}
                className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-[color:var(--ink)] px-5 text-sm font-semibold text-[color:var(--paper)] shadow-[0_16px_50px_var(--shadow)] transition hover:-translate-y-[1px]"
              >
                Connect X
              </a>
            </div>
          ) : data ? (
            <BookmarkList
              title={title}
              items={shownItems}
              loading={isPending}
              emptyHint={
                query.trim()
                  ? `No matches for "${query.trim()}". Try a tag, @username, or domain.`
                  : "No bookmarks returned for this folder."
              }
              headerRight={
                data?.user?.id ? (
                  <div className="hidden items-center gap-2 sm:flex">
                    <button
                      type="button"
                      onClick={refreshNow}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-[var(--paper)] px-3 text-xs font-semibold shadow-[0_10px_30px_var(--shadow)] transition hover:-translate-y-[1px]"
                      title="Refresh"
                    >
                      <RotateCw size={14} />
                      Refresh
                    </button>
                    <button
                      type="button"
                      onClick={disconnect}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-[color:rgba(255,93,74,0.35)] bg-[color:rgba(255,93,74,0.10)] px-3 text-xs font-semibold text-[color:rgba(16,17,20,0.86)] shadow-[0_10px_30px_var(--shadow)] transition hover:-translate-y-[1px]"
                      title="Disconnect"
                    >
                      <LogOut size={14} />
                      Disconnect
                    </button>
                  </div>
                ) : null
              }
              toolbar={
                <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_190px]">
                  <div className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-[color:rgba(16,17,20,0.03)] px-4 py-3 shadow-[0_16px_50px_var(--shadow)]">
                    <Search size={16} className="text-[color:var(--muted-ink)]" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search text, @user, #tag, domain..."
                      className="w-full bg-transparent text-sm outline-none placeholder:text-[color:rgba(16,17,20,0.45)]"
                    />
                  </div>
                  <label className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-[color:rgba(16,17,20,0.03)] px-4 py-3 shadow-[0_16px_50px_var(--shadow)]">
                    <SlidersHorizontal
                      size={16}
                      className="text-[color:var(--muted-ink)]"
                    />
                    <select
                      value={sortKey}
                      onChange={(e) =>
                        setSortKey(e.target.value as typeof sortKey)
                      }
                      className="w-full bg-transparent text-sm outline-none"
                      aria-label="Sort"
                    >
                      <option value="newest">Newest posts</option>
                      <option value="likes">Most liked</option>
                      <option value="impressions">Most impressions</option>
                    </select>
                  </label>
                </div>
              }
              canLoadMore={Boolean(nextToken)}
              onLoadMore={loadMore}
              loadingMore={loadingMore}
            />
          ) : (
            <div className="rounded-[22px] border border-[var(--line)] bg-[color:rgba(16,17,20,0.03)] p-6">
              <div className="text-sm font-semibold">Loading...</div>
              <div className="mt-2 text-sm text-[color:var(--muted-ink)]">
                Pulling bookmarks via X API.
              </div>
            </div>
          )}
        </div>

        {isPending ? (
          <div className="mt-3 text-xs font-semibold tracking-[0.18em] uppercase text-[color:var(--muted-ink)]">
            Syncing...
          </div>
        ) : null}
      </section>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <GrokPanel bookmarks={shownItems} />
      </aside>
    </main>
  );
}
