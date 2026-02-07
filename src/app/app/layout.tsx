import type { ReactNode } from "react";
import Link from "next/link";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[color:rgba(246,241,230,0.75)] backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-baseline gap-3">
            <span className="font-[var(--font-display)] text-xl tracking-[-0.02em]">
              Second Brain
            </span>
            <span className="text-xs font-semibold tracking-[0.18em] uppercase text-[color:var(--muted-ink)]">
              Demo
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-full border border-[var(--line)] bg-[var(--paper)] px-4 py-2 text-sm font-semibold shadow-[0_10px_30px_var(--shadow)] transition hover:-translate-y-[1px]"
            >
              Home
            </Link>
            <a
              href="/api/auth/x/start"
              className="rounded-full bg-[color:var(--ink)] px-4 py-2 text-sm font-semibold text-[color:var(--paper)] shadow-[0_16px_50px_var(--shadow)] transition hover:-translate-y-[1px]"
              title="Connect your X account (OAuth 2.0 PKCE)"
            >
              Connect X
            </a>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
