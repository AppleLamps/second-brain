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
      <div className="no-scrollbar flex w-full items-center gap-2 overflow-x-auto pb-1">
        {folders.map((f) => {
          const active = f.id === activeId;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onChange(f.id)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold shadow-[0_10px_30px_var(--shadow)] transition hover:-translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:rgba(31,223,100,0.55)]",
                active
                  ? "border-[color:rgba(31,223,100,0.55)] bg-[color:rgba(31,223,100,0.20)] text-[color:rgba(16,17,20,0.92)]"
                  : "border-[var(--line)] bg-[var(--paper)] text-[color:var(--muted-ink)] hover:bg-[color:rgba(16,17,20,0.04)]",
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
