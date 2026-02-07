import type { ReactNode } from "react";
import Link from "next/link";
import { Bookmark, Home, Search, Sparkles, Zap } from "lucide-react";
import { getSession } from "@/lib/session";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  const username = session?.user?.username ?? session?.user?.name;
  return (
    <div className="flex min-h-screen">
      {/* Grok-style sidebar */}
      <aside className="sticky top-0 flex h-screen w-[68px] flex-col items-center border-r border-[var(--line)] bg-[var(--bg)] py-6 lg:w-[240px] lg:items-stretch lg:px-4">
        {/* Logo */}
        <Link href="/" className="mb-8 flex items-center gap-3 px-3">
          <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current text-[var(--ink)]" aria-label="X">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <span className="hidden text-lg font-bold tracking-[-0.02em] text-[var(--ink)] lg:block">
            Second Brain
          </span>
        </Link>

        {/* Nav items */}
        <nav className="flex flex-1 flex-col gap-1">
          <Link
            href="/"
            className="flex items-center gap-4 rounded-full px-3 py-3 text-[15px] text-[var(--muted-ink)] transition-colors hover:bg-[var(--surface)] lg:px-4"
          >
            <Home size={22} strokeWidth={1.75} />
            <span className="hidden lg:block">Home</span>
          </Link>
          <Link
            href="/app"
            className="flex items-center gap-4 rounded-full px-3 py-3 text-[15px] font-bold text-[var(--ink)] transition-colors hover:bg-[var(--surface)] lg:px-4"
          >
            <Bookmark size={22} strokeWidth={2} />
            <span className="hidden lg:block">Bookmarks</span>
          </Link>
          <Link
            href="/app"
            className="flex items-center gap-4 rounded-full px-3 py-3 text-[15px] text-[var(--muted-ink)] transition-colors hover:bg-[var(--surface)] lg:px-4"
          >
            <Sparkles size={22} strokeWidth={1.75} />
            <span className="hidden lg:block">Grok Insights</span>
          </Link>
          <Link
            href="/app"
            className="flex items-center gap-4 rounded-full px-3 py-3 text-[15px] text-[var(--muted-ink)] transition-colors hover:bg-[var(--surface)] lg:px-4"
          >
            <Search size={22} strokeWidth={1.75} />
            <span className="hidden lg:block">Search</span>
          </Link>
        </nav>

        {/* Bottom action */}
        <div className="mt-auto flex flex-col gap-2">
          {session ? (
            <div className="flex items-center justify-center gap-3 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-3 text-xs font-semibold text-[var(--muted-ink)] lg:px-5">
              <Zap size={16} className="text-[var(--accent-3)]" />
              <span className="hidden lg:block">
                Connected{username ? ` as @${username}` : ""}
              </span>
            </div>
          ) : (
            <a
              href="/api/auth/x/start"
              className="flex items-center justify-center gap-3 rounded-full bg-[var(--accent)] px-3 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 lg:px-5"
              title="Connect your X account (OAuth 2.0 PKCE)"
            >
              <Zap size={18} />
              <span className="hidden lg:block">Connect X</span>
            </a>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
