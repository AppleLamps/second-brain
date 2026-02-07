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
    aboutUser:
      "You lean toward systems thinking, technical depth, and actionable frameworks over hot takes.",
    interestSignals: [
      { label: "Infrastructure as product", evidence: ["rate limits", "streaming", "policy"] },
      { label: "Measurement over vibes", evidence: ["benchmarks", "edge cases"] },
      { label: "Methods over opinions", evidence: ["contracts", "sentence jobs"] },
    ],
    recentBookmarks: bookmarks.slice(0, 3).map((b) => ({
      id: b.id,
      summary: b.text.slice(0, 120) || "Recent save",
      why: "Recent post that likely reflects a current focus.",
    })),
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
      items: bookmarks.slice(0, 500),
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
    <div className="sb-fade-up rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.14em] uppercase text-[var(--muted-ink)]">
            <Sparkles size={14} className="text-[var(--accent)]" />
            Grok
            {isPending ? <span className="sb-pulse-dot" aria-hidden /> : null}
          </div>
          <div className="mt-2 text-xl font-bold tracking-[-0.02em] text-[var(--ink)]">
            {insights.title}
          </div>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-ink)]">
            {insights.oneLiner}
          </p>
          <div className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-4 text-sm leading-6 text-[var(--ink)]">
            {insights.aboutUser}
          </div>
        </div>

        <button
          type="button"
          onClick={runGrok}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-[var(--accent)] px-4 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
          disabled={isPending || payload.items.length === 0}
          title="Calls your /api/grok endpoint. Requires XAI_API_KEY for real output."
        >
          <Sparkles size={16} />
          {isPending ? "Thinking..." : "Analyze"}
        </button>
      </div>

      {error ? (
        <div className="mt-4 rounded-xl bg-[rgba(249,24,128,0.06)] p-4 text-sm text-[var(--ink)]">
          <div className="font-semibold">Using demo insights</div>
          <div className="mt-1 text-xs text-[var(--muted-ink)]">
            {error}
          </div>
        </div>
      ) : null}

      {isPending ? <div className="mt-4 sb-thinking-bar" /> : null}

      <div className="mt-5">
        <div className="text-xs font-semibold tracking-[0.14em] uppercase text-[var(--muted-ink)]">
          Interest signals
        </div>
        <div className="sb-stagger mt-3 space-y-2">
          {insights.interestSignals.map((signal) => (
            <div
              key={signal.label}
              className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-4"
            >
              <div className="font-semibold text-[var(--ink)]">{signal.label}</div>
              <div className="mt-1 text-sm text-[var(--muted-ink)]">
                Evidence: {signal.evidence.join(", ")}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <div className="text-xs font-semibold tracking-[0.14em] uppercase text-[var(--muted-ink)]">
          Recent bookmarks
        </div>
        <div className="sb-stagger mt-3 space-y-2">
          {insights.recentBookmarks.map((b) => (
            <div
              key={b.id}
              className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-4"
            >
              <div className="text-sm font-semibold text-[var(--ink)]">
                {b.summary}
              </div>
              <div className="mt-1 text-sm text-[var(--muted-ink)]">{b.why}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <div className="text-xs font-semibold tracking-[0.14em] uppercase text-[var(--muted-ink)]">
          Themes
        </div>
        <div className="sb-stagger mt-3 space-y-2">
          {insights.themes.map((t) => (
            <div
              key={t.label}
              className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-4"
            >
              <div className="font-semibold text-[var(--ink)]">{t.label}</div>
              <div className="mt-1 text-sm leading-6 text-[var(--muted-ink)]">
                {t.why}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <div className="text-xs font-semibold tracking-[0.14em] uppercase text-[var(--muted-ink)]">
          Suggested tags
        </div>
        <div className="sb-stagger mt-3 flex flex-wrap gap-2">
          {insights.suggestedTags.map((t) => (
            <TagPill key={t} tone="accent">
              {t}
            </TagPill>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <div className="text-xs font-semibold tracking-[0.14em] uppercase text-[var(--muted-ink)]">
          Next actions
        </div>
        <ul className="sb-stagger mt-3 space-y-2 text-sm leading-6 text-[var(--ink)]">
          {insights.nextActions.slice(0, 5).map((a) => (
            <li key={a} className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-3">
              {a}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
