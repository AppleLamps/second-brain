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
        <h2 className="font-[var(--font-display)] text-2xl tracking-[-0.02em]">
          {title}
        </h2>
        <div className="flex items-center gap-2">
          {headerRight}
          <div className="rounded-full border border-[var(--line)] bg-[color:rgba(16,17,20,0.03)] px-3 py-1 text-xs font-semibold tracking-[0.14em] uppercase text-[color:var(--muted-ink)]">
            {items.length} posts
          </div>
        </div>
      </div>

      {toolbar ? <div className="mt-4">{toolbar}</div> : null}

      <div className="mt-4 grid grid-cols-1 gap-4">
        {loading && items.length === 0 ? (
          <>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={`sk-${i}`}
                className="rounded-2xl border border-[var(--line)] bg-[color:rgba(16,17,20,0.02)] p-4 shadow-[0_18px_60px_var(--shadow)]"
              >
                <div className="h-3 w-44 animate-pulse rounded bg-[color:rgba(16,17,20,0.10)]" />
                <div className="mt-3 space-y-2">
                  <div className="h-3 w-full animate-pulse rounded bg-[color:rgba(16,17,20,0.08)]" />
                  <div className="h-3 w-[92%] animate-pulse rounded bg-[color:rgba(16,17,20,0.08)]" />
                  <div className="h-3 w-[82%] animate-pulse rounded bg-[color:rgba(16,17,20,0.08)]" />
                </div>
                <div className="mt-4 flex gap-2">
                  <div className="h-6 w-20 animate-pulse rounded-full bg-[color:rgba(16,17,20,0.07)]" />
                  <div className="h-6 w-16 animate-pulse rounded-full bg-[color:rgba(16,17,20,0.07)]" />
                  <div className="h-6 w-24 animate-pulse rounded-full bg-[color:rgba(16,17,20,0.07)]" />
                </div>
              </div>
            ))}
          </>
        ) : (
          items.map((b) => <BookmarkCard key={b.id} item={b} />)
        )}
      </div>

      {!loading && items.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-[var(--line)] bg-[color:rgba(16,17,20,0.03)] p-6">
          <div className="text-sm font-semibold">Nothing here yet</div>
          <div className="mt-2 text-sm text-[color:var(--muted-ink)]">
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
            className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--paper)] px-5 text-sm font-semibold shadow-[0_16px_50px_var(--shadow)] transition hover:-translate-y-[1px] disabled:opacity-70"
          >
            {loadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      ) : null}
    </section>
  );
}
