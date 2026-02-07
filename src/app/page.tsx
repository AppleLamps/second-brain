import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="group inline-flex items-baseline gap-2 text-[13px] font-semibold tracking-[0.18em] uppercase"
        >
          <span className="rounded-full border border-[var(--line)] bg-[var(--paper)] px-3 py-1 shadow-[0_8px_30px_var(--shadow)]">
            Second Brain
          </span>
          <span className="text-[color:var(--muted-ink)]">for X Bookmarks</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            href="/app"
            className="rounded-full border border-[var(--line)] bg-[var(--paper)] px-4 py-2 text-sm font-medium shadow-[0_10px_30px_var(--shadow)] transition hover:-translate-y-[1px] hover:shadow-[0_14px_40px_var(--shadow)]"
          >
            Open Dashboard
          </Link>
          <a
            href="/api/auth/x/start"
            className="rounded-full bg-[color:var(--ink)] px-4 py-2 text-sm font-semibold text-[color:var(--paper)] shadow-[0_16px_50px_var(--shadow)] transition hover:-translate-y-[1px]"
          >
            Connect X
          </a>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 pb-20 pt-10">
        <section className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--paper)] px-4 py-2 text-sm shadow-[0_12px_40px_var(--shadow)]">
              <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
              <span className="text-[color:var(--muted-ink)]">
                Grok-powered organization, built on X API
              </span>
            </p>
            <h1
              className="mt-6 font-[var(--font-display)] text-5xl leading-[1.02] tracking-[-0.04em] text-[color:var(--ink)] sm:text-6xl"
              style={{ fontVariationSettings: '"opsz" 96' }}
            >
              Make bookmarks useful.
              <br />
              Turn saves into signals.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[color:var(--muted-ink)]">
              Sync your X bookmarks, auto-tag them, and get a weekly digest of
              what aged well. Grok reads your saves like a researcher: themes,
              contradictions, and what to revisit next.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/app"
                className="inline-flex h-12 items-center justify-center rounded-full bg-[color:var(--ink)] px-6 text-sm font-semibold text-[color:var(--paper)] shadow-[0_16px_50px_var(--shadow)] transition hover:-translate-y-[1px] hover:shadow-[0_22px_70px_var(--shadow)]"
              >
                Start with the demo dashboard
              </Link>
              <a
                href="#how"
                className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--paper)] px-6 text-sm font-semibold text-[color:var(--ink)] shadow-[0_16px_50px_var(--shadow)] transition hover:-translate-y-[1px] hover:shadow-[0_22px_70px_var(--shadow)]"
              >
                See how it works
              </a>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-4 shadow-[0_20px_70px_var(--shadow)]">
                <div className="text-xs font-semibold tracking-[0.18em] uppercase text-[color:var(--muted-ink)]">
                  Auto-tags
                </div>
                <div className="mt-2 text-sm leading-6">
                  Domains, people, claims, and topics detected from your saves.
                </div>
              </div>
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-4 shadow-[0_20px_70px_var(--shadow)]">
                <div className="text-xs font-semibold tracking-[0.18em] uppercase text-[color:var(--muted-ink)]">
                  Aged well
                </div>
                <div className="mt-2 text-sm leading-6">
                  Weekly resurfacing based on engagement deltas and relevance.
                </div>
              </div>
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-4 shadow-[0_20px_70px_var(--shadow)]">
                <div className="text-xs font-semibold tracking-[0.18em] uppercase text-[color:var(--muted-ink)]">
                  Search
                </div>
                <div className="mt-2 text-sm leading-6">
                  Fast retrieval by tags, authors, links, and themes.
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-[28px] bg-[radial-gradient(80%_80%_at_30%_20%,rgba(31,223,100,0.24),transparent_55%),radial-gradient(70%_70%_at_80%_20%,rgba(47,107,255,0.20),transparent_55%),radial-gradient(80%_80%_at_50%_90%,rgba(255,93,74,0.18),transparent_55%)] blur-xl" />
            <div className="rounded-[28px] border border-[var(--line)] bg-[var(--paper)] p-5 shadow-[0_35px_120px_var(--shadow)]">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold tracking-[0.18em] uppercase text-[color:var(--muted-ink)]">
                  Preview
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[var(--accent-2)]" />
                  <div className="h-2 w-2 rounded-full bg-[var(--accent-3)]" />
                  <div className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-[var(--line)] bg-[color:rgba(16,17,20,0.04)] p-4">
                <div className="text-sm font-semibold">This week’s resurfaced saves</div>
                <div className="mt-3 space-y-3">
                  <div className="rounded-xl border border-[var(--line)] bg-[var(--paper)] p-3">
                    <div className="text-sm font-medium">“Rate limits are the new product surface.”</div>
                    <div className="mt-1 text-xs text-[color:var(--muted-ink)]">
                      Themes: infra, policy, economics
                    </div>
                  </div>
                  <div className="rounded-xl border border-[var(--line)] bg-[var(--paper)] p-3">
                    <div className="text-sm font-medium">Supply chain thread with primary sources</div>
                    <div className="mt-1 text-xs text-[color:var(--muted-ink)]">
                      Themes: geopolitics, manufacturing
                    </div>
                  </div>
                  <div className="rounded-xl border border-[var(--line)] bg-[var(--paper)] p-3">
                    <div className="text-sm font-medium">A tiny Go benchmark that changed my mind</div>
                    <div className="mt-1 text-xs text-[color:var(--muted-ink)]">
                      Themes: performance, Go, tooling
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-[var(--line)] bg-[color:rgba(31,223,100,0.08)] p-4">
                  <div className="text-xs font-semibold tracking-[0.18em] uppercase text-[color:var(--muted-ink)]">
                    Grok note
                  </div>
                  <div className="mt-2 text-sm leading-6">
                    “You bookmark claims. Let’s track which ones get validated.”
                  </div>
                </div>
                <div className="rounded-2xl border border-[var(--line)] bg-[color:rgba(47,107,255,0.08)] p-4">
                  <div className="text-xs font-semibold tracking-[0.18em] uppercase text-[color:var(--muted-ink)]">
                    Action
                  </div>
                  <div className="mt-2 text-sm leading-6">
                    Create a list of authors you frequently save.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="mt-18">
          <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-[26px] border border-[var(--line)] bg-[var(--paper)] p-7 shadow-[0_25px_90px_var(--shadow)]">
              <div className="text-xs font-semibold tracking-[0.18em] uppercase text-[color:var(--muted-ink)]">
                1. Sync
              </div>
              <div className="mt-3 text-lg font-semibold">Pull folders + bookmarks</div>
              <p className="mt-2 text-sm leading-7 text-[color:var(--muted-ink)]">
                Read your bookmark folders and entries, then enrich them with
                post, author, and link metadata.
              </p>
            </div>
            <div className="rounded-[26px] border border-[var(--line)] bg-[var(--paper)] p-7 shadow-[0_25px_90px_var(--shadow)]">
              <div className="text-xs font-semibold tracking-[0.18em] uppercase text-[color:var(--muted-ink)]">
                2. Understand
              </div>
              <div className="mt-3 text-lg font-semibold">Grok builds a map</div>
              <p className="mt-2 text-sm leading-7 text-[color:var(--muted-ink)]">
                Grok clusters themes, extracts claims and sources, and suggests
                tags that match how you actually think.
              </p>
            </div>
            <div className="rounded-[26px] border border-[var(--line)] bg-[var(--paper)] p-7 shadow-[0_25px_90px_var(--shadow)]">
              <div className="text-xs font-semibold tracking-[0.18em] uppercase text-[color:var(--muted-ink)]">
                3. Resurface
              </div>
              <div className="mt-3 text-lg font-semibold">Weekly “aged well”</div>
              <p className="mt-2 text-sm leading-7 text-[color:var(--muted-ink)]">
                Revisit what moved, what was wrong, and what’s now relevant,
                based on engagement deltas and current context.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto w-full max-w-6xl px-6 pb-10 pt-2 text-xs text-[color:var(--muted-ink)]">
        Built to showcase X API bookmarks + Grok intelligence. Demo mode uses
        mocked data until you connect OAuth.
      </footer>
    </div>
  );
}
