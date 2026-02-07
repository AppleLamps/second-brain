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
  const [viewMode, setViewMode] = useState<"analysis" | "bookmarks">("analysis");
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

  const isBookmarksFocus = viewMode === "bookmarks";

  return (
    <main
      className={`grid w-full grid-cols-1 gap-0 ${
        isBookmarksFocus
          ? "lg:grid-cols-[1fr_380px]"
          : "lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]"
      }`}
    >
      {isBookmarksFocus ? (
        <>
          <section className="border-r border-[var(--line)] px-6 py-6">
            <div className="flex flex-col gap-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold tracking-[-0.02em] text-[var(--ink)]">
                    Bookmarks
                  </h1>
                  <div className="mt-1 text-sm text-[var(--muted-ink)]">
                    {data?.user?.username ? (
                      <>
                        Connected as{" "}
                        <span className="font-semibold text-[var(--ink)]">
                          @{data.user.username}
                        </span>
                      </>
                    ) : (
                      "Connect to load your bookmarks."
                    )}
                  </div>
                </div>
                <div className="inline-flex items-center rounded-full border border-[var(--line)] bg-[var(--surface)] p-1 text-xs font-semibold text-[var(--muted-ink)]">
                  <button
                    type="button"
                    onClick={() => setViewMode("analysis")}
                    className="rounded-full px-3 py-1 transition hover:bg-[var(--surface-2)]"
                  >
                    AI analysis
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("bookmarks")}
                    className="rounded-full bg-[var(--ink)] px-3 py-1 text-[var(--surface)]"
                  >
                    Bookmarks
                  </button>
                </div>
              </div>

              <FolderTabs
                folders={tabs}
                activeId={activeFolder}
                onChange={setActiveFolder}
              />
            </div>

            <div className="mt-6">
              {error ? (
                <div className="rounded-2xl border border-[rgba(249,24,128,0.25)] bg-[rgba(249,24,128,0.06)] p-6">
                  <div className="text-sm font-semibold text-[var(--ink)]">
                    {error}
                  </div>
                  <div className="mt-2 text-sm text-[var(--muted-ink)]">
                    This app needs X OAuth 2.0 (PKCE) with scopes:{" "}
                    <span className="font-mono">
                      bookmark.read tweet.read users.read offline.access
                    </span>
                  </div>
                  <a
                    href={connectUrl}
                    className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-[var(--accent)] px-5 text-sm font-bold text-white transition hover:opacity-90"
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
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 text-xs font-semibold text-[var(--ink)] transition hover:bg-[var(--surface-2)]"
                          title="Refresh"
                        >
                          <RotateCw size={14} />
                          Refresh
                        </button>
                        <button
                          type="button"
                          onClick={disconnect}
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-[rgba(249,24,128,0.25)] bg-[rgba(249,24,128,0.06)] px-3 text-xs font-semibold text-[var(--accent-2)] transition hover:bg-[rgba(249,24,128,0.12)]"
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
                      <div className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
                        <Search size={16} className="text-[var(--muted-ink)]" />
                        <input
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="Search text, @user, #tag, domain..."
                          className="w-full bg-transparent text-sm text-[var(--ink)] outline-none placeholder:text-[var(--muted-ink)]"
                        />
                      </div>
                      <label className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
                        <SlidersHorizontal
                          size={16}
                          className="text-[var(--muted-ink)]"
                        />
                        <select
                          value={sortKey}
                          onChange={(e) =>
                            setSortKey(e.target.value as typeof sortKey)
                          }
                          className="w-full bg-transparent text-sm text-[var(--ink)] outline-none"
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
                <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6">
                  <div className="text-sm font-semibold text-[var(--ink)]">
                    Loading...
                  </div>
                  <div className="mt-2 text-sm text-[var(--muted-ink)]">
                    Pulling bookmarks via X API.
                  </div>
                </div>
              )}
            </div>

            {isPending ? (
              <div className="mt-3 text-xs font-semibold tracking-[0.14em] uppercase text-[var(--muted-ink)]">
                Syncing...
              </div>
            ) : null}
          </section>

          <aside className="px-6 py-6 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
            <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted-ink)]">
                AI analysis
              </div>
              <div className="mt-2 text-lg font-semibold text-[var(--ink)]">
                Signals, themes, next actions
              </div>
              <p className="mt-2 text-sm text-[var(--muted-ink)]">
                This view keeps analysis in reach while you browse bookmarks.
              </p>
              <div className="mt-4">
                <GrokPanel bookmarks={shownItems} />
              </div>
            </div>
          </aside>
        </>
      ) : (
        <>
          <section className="border-r border-[var(--line)] px-6 py-6">
            <div className="flex flex-col gap-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold tracking-[-0.02em] text-[var(--ink)]">
                    AI analysis
                  </h1>
                  <div className="mt-1 text-sm text-[var(--muted-ink)]">
                    Your bookmarks are context. The insights are the main event.
                  </div>
                </div>
                <div className="inline-flex items-center rounded-full border border-[var(--line)] bg-[var(--surface)] p-1 text-xs font-semibold text-[var(--muted-ink)]">
                  <button
                    type="button"
                    onClick={() => setViewMode("analysis")}
                    className="rounded-full bg-[var(--ink)] px-3 py-1 text-[var(--surface)]"
                  >
                    AI analysis
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("bookmarks")}
                    className="rounded-full px-3 py-1 transition hover:bg-[var(--surface-2)]"
                  >
                    Bookmarks
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted-ink)]">
                  Analysis scope
                </div>
                <div className="mt-3">
                  <FolderTabs
                    folders={tabs}
                    activeId={activeFolder}
                    onChange={setActiveFolder}
                  />
                </div>
              </div>

              {error ? (
                <div className="rounded-2xl border border-[rgba(249,24,128,0.25)] bg-[rgba(249,24,128,0.06)] p-6">
                  <div className="text-sm font-semibold text-[var(--ink)]">
                    {error}
                  </div>
                  <div className="mt-2 text-sm text-[var(--muted-ink)]">
                    This app needs X OAuth 2.0 (PKCE) with scopes:{" "}
                    <span className="font-mono">
                      bookmark.read tweet.read users.read offline.access
                    </span>
                  </div>
                  <a
                    href={connectUrl}
                    className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-[var(--accent)] px-5 text-sm font-bold text-white transition hover:opacity-90"
                  >
                    Connect X
                  </a>
                </div>
              ) : null}

              <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6">
                <GrokPanel bookmarks={shownItems} />
              </div>
            </div>
          </section>

          <aside className="px-6 py-6 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted-ink)]">
                  Bookmarks context
                </div>
                <div className="mt-1 text-sm text-[var(--muted-ink)]">
                  {data?.user?.username ? (
                    <>
                      @{data.user.username} · {shownItems.length} loaded
                    </>
                  ) : (
                    "Connect to load your bookmarks."
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewMode("bookmarks")}
                className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-xs font-semibold text-[var(--ink)] transition hover:bg-[var(--surface-2)]"
              >
                Open bookmarks
              </button>
            </div>

            <div className="mt-4">
              {error ? (
                <div className="rounded-2xl border border-[rgba(249,24,128,0.25)] bg-[rgba(249,24,128,0.06)] p-4 text-sm text-[var(--ink)]">
                  Bookmarks unavailable. Connect X to load them.
                </div>
              ) : data ? (
                <BookmarkList
                  title="Bookmarks"
                  items={shownItems}
                  loading={isPending}
                  emptyHint={
                    query.trim()
                      ? `No matches for "${query.trim()}".`
                      : "No bookmarks returned for this folder."
                  }
                  canLoadMore={Boolean(nextToken)}
                  onLoadMore={loadMore}
                  loadingMore={loadingMore}
                />
              ) : (
                <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 text-sm text-[var(--muted-ink)]">
                  Loading bookmarks...
                </div>
              )}
            </div>
          </aside>
        </>
      )}
    </main>
  );
}
