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
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-[0.06em]";
  const toneClass =
    tone === "accent"
      ? "border border-[color:rgba(31,223,100,0.35)] bg-[color:rgba(31,223,100,0.16)] text-[color:rgba(16,17,20,0.92)]"
      : tone === "ink"
        ? "border border-[color:rgba(16,17,20,0.18)] bg-[color:rgba(16,17,20,0.06)] text-[color:rgba(16,17,20,0.86)]"
        : "border border-[var(--line)] bg-[var(--paper)] text-[color:var(--muted-ink)]";

  return <span className={cn(base, toneClass)}>{children}</span>;
}

