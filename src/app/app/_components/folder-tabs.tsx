"use client";

import { cn } from "@/lib/cn";

export type FolderTab = { id: string; name: string };

export function FolderTabs({
  folders,
  activeId,
  onChange,
}: {
  folders: FolderTab[];
  activeId: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="relative">
      <div className="no-scrollbar flex w-full items-center gap-1 overflow-x-auto pb-1">
        {folders.map((f) => {
          const active = f.id === activeId;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onChange(f.id)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
                active
                  ? "bg-[var(--surface-2)] text-[var(--ink)] font-semibold border border-[var(--line)]"
                  : "text-[var(--muted-ink)] hover:bg-[var(--surface)]",
              )}
            >
              {f.name}
            </button>
          );
        })}
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-[linear-gradient(to_left,var(--bg),transparent)]" />
    </div>
  );
}
