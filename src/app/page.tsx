import Link from "next/link";

const previewItems = [
  {
    title: "Rate limits are the new product surface.",
    meta: "Themes: infra, policy, economics",
  },
  {
    title: "Supply chain thread with primary sources",
    meta: "Themes: geopolitics, manufacturing",
  },
  {
    title: "A tiny Go benchmark that changed my mind",
    meta: "Themes: performance, Go, tooling",
  },
];

const featureItems = [
  {
    title: "Auto-tags, quietly done",
    description: "Domains, people, and claims detected without a manual pass.",
  },
  {
    title: "Weekly resurfacing",
    description: "Aged-well signals tuned by engagement shifts and context.",
  },
  {
    title: "Fast retrieval",
    description: "Search by theme, author, or link in a single command.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8">
        <Link href="/" className="group inline-flex items-center gap-3">
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6 fill-current text-[var(--ink)]"
            aria-label="X"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <span className="text-base font-semibold tracking-[-0.02em] text-[var(--ink)]">
            Second Brain
          </span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            href="/app"
            className="rounded-full border border-[var(--line)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--surface-2)]"
          >
            Open Dashboard
          </Link>
          <a
            href="/api/auth/x/start"
            className="rounded-full bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-[var(--surface)] transition hover:opacity-90"
          >
            Connect X
          </a>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 pb-20 pt-8">
        <section className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-[var(--muted-ink)]">
              Grok + X bookmarks
            </p>
            <h1 className="mt-6 max-w-xl font-[var(--font-display)] text-5xl leading-[1.05] tracking-[-0.03em] text-[var(--ink)] sm:text-6xl">
              Make saved links feel alive.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--muted-ink)]">
              A quiet workspace for your X saves. Auto-tagged, resurfaced, and
              distilled into weekly signals you can actually act on.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/app"
                className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-semibold text-[var(--surface)] transition hover:opacity-90"
              >
                Start in demo mode
              </Link>
              <a
                href="/api/auth/x/start"
                className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] px-6 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--surface-2)]"
              >
                Connect X to sync
              </a>
            </div>

            <p className="mt-6 text-xs uppercase tracking-[0.2em] text-[var(--muted-ink)]">
              Private by default. No feeds, no noise.
            </p>
          </div>

          <div className="relative">
            <div className="absolute -inset-8 -z-10 rounded-[36px] bg-[radial-gradient(60%_70%_at_60%_20%,rgba(15,17,19,0.08),transparent_70%)]" />
            <div className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_30px_90px_rgba(15,17,19,0.12)]">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-[var(--muted-ink)]">
                <span>Preview</span>
                <span>Week 06</span>
              </div>
              <div className="mt-5 rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] p-4">
                <div className="text-sm font-semibold text-[var(--ink)]">
                  Resurfaced saves
                </div>
                <div className="mt-4 space-y-3">
                  {previewItems.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3"
                    >
                      <div className="text-sm font-medium text-[var(--ink)]">
                        “{item.title}”
                      </div>
                      <div className="mt-1 text-xs text-[var(--muted-ink)]">
                        {item.meta}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-[var(--muted-ink)]">
                <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
                  <div className="text-[11px] uppercase tracking-[0.2em]">
                    Grok note
                  </div>
                  <div className="mt-3 text-sm leading-6 text-[var(--ink)]">
                    Bookmark claims. Track which ones get validated.
                  </div>
                </div>
                <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
                  <div className="text-[11px] uppercase tracking-[0.2em]">
                    Next action
                  </div>
                  <div className="mt-3 text-sm leading-6 text-[var(--ink)]">
                    List authors you frequently save.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 grid grid-cols-1 gap-6 border-t border-[var(--line)] pt-10 md:grid-cols-3">
          {featureItems.map((feature) => (
            <div key={feature.title} className="space-y-3">
              <div className="text-sm font-semibold text-[var(--ink)]">
                {feature.title}
              </div>
              <p className="text-sm leading-7 text-[var(--muted-ink)]">
                {feature.description}
              </p>
            </div>
          ))}
        </section>
      </main>

      <footer className="mx-auto w-full max-w-6xl px-6 pb-10 pt-4 text-xs text-[var(--muted-ink)]">
        Built for focused research on X bookmarks. Demo mode uses mocked data
        until you connect OAuth.
      </footer>
    </div>
  );
}
