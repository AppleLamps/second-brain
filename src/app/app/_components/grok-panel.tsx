"use client";

import type { BookmarkItem, GrokInsights } from "@/lib/types";
import { Sparkles } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { TagPill } from "./tag-pill";

function fallbackInsights(bookmarks: BookmarkItem[]): GrokInsights {
  const tags = new Map<string, number>();
  for (const b of bookmarks) {
    for (const t of b.tags ?? []) tags.set(t, (tags.get(t) ?? 0) + 1);
  }
  const suggestedTags = [...tags.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([t]) => t);

  return {
    title: "Demo insights",
    oneLiner:
      "You bookmark practical ideas and contrarian heuristics; let’s turn them into a retrieval system.",
    themes: [
      { label: "Infrastructure as product", why: "Rate limits, streaming, and policy show up repeatedly." },
      { label: "Measurement over vibes", why: "Benchmarks, edge cases, and testing threads recur." },
      { label: "Methods, not takes", why: "You save frameworks for thinking (contracts, sentence jobs)." },
    ],
    suggestedTags,
    resurfaced: bookmarks.slice(0, 3).map((b) => ({
      id: b.id,
      reason: "High-signal save with durable framing.",
      questionToRevisit: "What changed since you saved this?",
    })),
    nextActions: [
      "Create a ‘Frequent authors’ list from your saves.",
      "Add a ‘Claims to verify’ tag for predictions and disputed facts.",
      "Start a weekly review: 15 minutes, 10 saves, 3 notes.",
    ],
  };
}

export function GrokPanel({ bookmarks }: { bookmarks: BookmarkItem[] }) {
  const [isPending, startTransition] = useTransition();
  const [insights, setInsights] = useState<GrokInsights>(() =>
    fallbackInsights(bookmarks),
  );
  const [error, setError] = useState<string | null>(null);

  const payload = useMemo(
    () => ({
      items: bookmarks.slice(0, 20),
    }),
    [bookmarks],
  );

  function runGrok() {
    setError(null);
    startTransition(async () => {
      try {
        if (payload.items.length === 0) {
          setError("No bookmarks loaded yet.");
          return;
        }
        const res = await fetch("/api/grok", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error ?? "Failed to get insights");
        setInsights(body.insights as GrokInsights);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
        setInsights(fallbackInsights(bookmarks));
      }
    });
  }

  return (
    <div className="rounded-[28px] border border-[var(--line)] bg-[var(--paper)] p-5 shadow-[0_30px_120px_var(--shadow)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold tracking-[0.18em] uppercase text-[color:var(--muted-ink)]">
            Grok
          </div>
          <div className="mt-2 font-[var(--font-display)] text-2xl tracking-[-0.02em]">
            {insights.title}
          </div>
          <p className="mt-2 text-sm leading-7 text-[color:var(--muted-ink)]">
            {insights.oneLiner}
          </p>
        </div>

        <button
          type="button"
          onClick={runGrok}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-[color:var(--ink)] px-4 text-sm font-semibold text-[color:var(--paper)] shadow-[0_16px_50px_var(--shadow)] transition hover:-translate-y-[1px] disabled:opacity-70"
          disabled={isPending || payload.items.length === 0}
          title="Calls your /api/grok endpoint. Requires XAI_API_KEY for real output."
        >
          <Sparkles size={16} />
          {isPending ? "Thinking..." : "Analyze"}
        </button>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-[color:rgba(255,93,74,0.35)] bg-[color:rgba(255,93,74,0.10)] p-4 text-sm text-[color:rgba(16,17,20,0.88)]">
          <div className="font-semibold">Using demo insights</div>
          <div className="mt-1 text-xs text-[color:rgba(16,17,20,0.72)]">
            {error}
          </div>
        </div>
      ) : null}

      <div className="mt-5">
        <div className="text-xs font-semibold tracking-[0.18em] uppercase text-[color:var(--muted-ink)]">
          Themes
        </div>
        <div className="mt-3 space-y-3">
          {insights.themes.map((t) => (
            <div
              key={t.label}
              className="rounded-2xl border border-[var(--line)] bg-[color:rgba(16,17,20,0.03)] p-4"
            >
              <div className="font-semibold">{t.label}</div>
              <div className="mt-1 text-sm leading-7 text-[color:var(--muted-ink)]">
                {t.why}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <div className="text-xs font-semibold tracking-[0.18em] uppercase text-[color:var(--muted-ink)]">
          Suggested tags
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {insights.suggestedTags.map((t) => (
            <TagPill key={t} tone="accent">
              {t}
            </TagPill>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <div className="text-xs font-semibold tracking-[0.18em] uppercase text-[color:var(--muted-ink)]">
          Next actions
        </div>
        <ul className="mt-3 space-y-2 text-sm leading-7 text-[color:rgba(16,17,20,0.88)]">
          {insights.nextActions.slice(0, 5).map((a) => (
            <li key={a} className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-3">
              {a}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
