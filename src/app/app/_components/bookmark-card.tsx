"use client";

import type { BookmarkItem } from "@/lib/types";
import { motion } from "framer-motion";
import { ExternalLink, MessageCircle, Repeat2, Star } from "lucide-react";
import { TagPill } from "./tag-pill";

function fmt(n?: number) {
  if (n === undefined) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}m`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return `${n}`;
}

export function BookmarkCard({ item }: { item: BookmarkItem }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10, filter: "blur(2px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
      className="group rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-4 shadow-[0_18px_60px_var(--shadow)] transition hover:-translate-y-[1px] hover:shadow-[0_26px_90px_var(--shadow)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold tracking-[0.16em] uppercase text-[color:var(--muted-ink)]">
            @{item.author.username}{" "}
            <span className="font-normal tracking-normal">
              {" - "}posted {new Date(item.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="mt-2 text-sm leading-7 text-[color:rgba(16,17,20,0.92)]">
            {item.text}
          </p>
        </div>
        {item.url ? (
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--line)] bg-[color:rgba(16,17,20,0.02)] text-[color:var(--muted-ink)] transition hover:bg-[color:rgba(16,17,20,0.06)]"
            title="Open on X"
          >
            <ExternalLink size={16} />
          </a>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {(item.tags ?? []).slice(0, 4).map((t) => (
          <TagPill key={t} tone="ink">
            {t}
          </TagPill>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 border-t border-[var(--line)] pt-3 text-xs text-[color:var(--muted-ink)]">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1">
            <Star size={14} /> {fmt(item.metrics?.likeCount)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Repeat2 size={14} /> {fmt(item.metrics?.repostCount)}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageCircle size={14} /> {fmt(item.metrics?.replyCount)}
          </span>
        </div>
        <span className="hidden sm:inline">
          impressions: {fmt(item.metrics?.impressionCount)}
        </span>
      </div>
    </motion.article>
  );
}
