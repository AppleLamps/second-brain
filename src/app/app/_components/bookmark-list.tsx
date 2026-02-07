"use client";

import type { BookmarkItem } from "@/lib/types";
import { BookmarkCard } from "./bookmark-card";

export function BookmarkList({
  title,
  items,
  loading = false,
  toolbar,
  headerRight,
  emptyHint,
  canLoadMore = false,
  onLoadMore,
  loadingMore = false,
}: {
  title: string;
  items: BookmarkItem[];
  loading?: boolean;
  toolbar?: React.ReactNode;
  headerRight?: React.ReactNode;
  emptyHint?: React.ReactNode;
  canLoadMore?: boolean;
  onLoadMore?: () => void;
  loadingMore?: boolean;
}) {
  return (
    <section>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold tracking-[-0.02em] text-[var(--ink)]">
          {title}
        </h2>
        <div className="flex items-center gap-2">
          {headerRight}
          <div className="rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-medium text-[var(--muted-ink)]">
            {items.length} posts
          </div>
        </div>
      </div>

      {toolbar ? <div className="mt-4">{toolbar}</div> : null}

      <div className="mt-4 rounded-2xl border border-[var(--line)] overflow-hidden">
        {loading && items.length === 0 ? (
          <>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={`sk-${i}`}
                className="border-b border-[var(--line)] px-4 py-4"
              >
                <div className="h-3 w-44 animate-pulse rounded bg-[rgba(255,255,255,0.06)]" />
                <div className="mt-3 space-y-2">
                  <div className="h-3 w-full animate-pulse rounded bg-[rgba(255,255,255,0.04)]" />
                  <div className="h-3 w-[92%] animate-pulse rounded bg-[rgba(255,255,255,0.04)]" />
                  <div className="h-3 w-[82%] animate-pulse rounded bg-[rgba(255,255,255,0.04)]" />
                </div>
                <div className="mt-4 flex gap-2">
                  <div className="h-6 w-20 animate-pulse rounded-full bg-[rgba(255,255,255,0.04)]" />
                  <div className="h-6 w-16 animate-pulse rounded-full bg-[rgba(255,255,255,0.04)]" />
                  <div className="h-6 w-24 animate-pulse rounded-full bg-[rgba(255,255,255,0.04)]" />
                </div>
              </div>
            ))}
          </>
        ) : (
          items.map((b) => <BookmarkCard key={b.id} item={b} />)
        )}
      </div>

      {!loading && items.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6">
          <div className="text-sm font-semibold text-[var(--ink)]">Nothing here yet</div>
          <div className="mt-2 text-sm text-[var(--muted-ink)]">
            {emptyHint ?? "Try another folder, or clear your search."}
          </div>
        </div>
      ) : null}

      {canLoadMore ? (
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--surface-2)] disabled:opacity-70"
          >
            {loadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      ) : null}
    </section>
  );
}
