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
      className="group border-b border-[var(--line)] px-4 py-4 transition hover:bg-[var(--surface)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-[var(--muted-ink)]">
            <span className="text-[var(--ink)]">@{item.author.username}</span>
            <span className="font-normal">
              {" · "}{new Date(item.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="mt-2 text-[15px] leading-6 text-[var(--ink)]">
            {item.text}
          </p>
        </div>
        {item.url ? (
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--muted-ink)] transition hover:bg-[rgba(29,155,240,0.1)] hover:text-[var(--accent)]"
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

      <div className="mt-3 flex items-center gap-6 text-xs text-[var(--muted-ink)]">
        <span className="inline-flex items-center gap-1.5 transition hover:text-[var(--accent-2)]">
          <Star size={14} /> {fmt(item.metrics?.likeCount)}
        </span>
        <span className="inline-flex items-center gap-1.5 transition hover:text-[var(--accent)]">
          <Repeat2 size={14} /> {fmt(item.metrics?.repostCount)}
        </span>
        <span className="inline-flex items-center gap-1.5 transition hover:text-[var(--accent)]">
          <MessageCircle size={14} /> {fmt(item.metrics?.replyCount)}
        </span>
        <span className="hidden sm:inline">
          {fmt(item.metrics?.impressionCount)} views
        </span>
      </div>
    </motion.article>
  );
}
