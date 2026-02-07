"use client";

import { cn } from "@/lib/cn";

export function TagPill({
  children,
  tone = "paper",
}: {
  children: string;
  tone?: "paper" | "accent" | "ink";
}) {
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium";
  const toneClass =
    tone === "accent"
      ? "bg-[rgba(29,155,240,0.12)] text-[var(--accent)]"
      : tone === "ink"
        ? "bg-[rgba(255,255,255,0.06)] text-[var(--muted-ink)]"
        : "bg-[var(--surface)] text-[var(--muted-ink)]";

  return <span className={cn(base, toneClass)}>{children}</span>;
}

