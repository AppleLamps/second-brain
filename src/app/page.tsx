export default function Home() {
  return (
    <div className="min-h-screen">
      <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-6">
        <section className="w-full max-w-xl">
          <div className="rounded-[36px] border border-[var(--line)] bg-[var(--surface)] p-8 shadow-[0_40px_120px_rgba(15,17,19,0.12)]">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-3 rounded-full border border-[var(--line)] bg-[var(--surface-2)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted-ink)]">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 fill-current text-[var(--ink)]"
                  aria-label="X"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Second Brain
              </div>
            </div>

            <div className="mt-8 text-center">
              <h1 className="font-[var(--font-display)] text-4xl leading-[1.05] tracking-[-0.03em] text-[var(--ink)] sm:text-5xl">
                Your bookmarks, distilled.
              </h1>
              <p className="mt-4 text-base leading-7 text-[var(--muted-ink)]">
                Grok turns your X saves into weekly signals, clear themes, and
                next actions. No feed. No clutter.
              </p>
            </div>

            <div className="mt-8 flex flex-col items-center gap-3">
              <a
                href="/api/auth/x/start"
                className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[var(--ink)] px-6 text-sm font-semibold text-[var(--surface)] transition hover:opacity-90"
              >
                Connect X
              </a>
              <a
                href="/app"
                className="inline-flex h-11 w-full items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] px-6 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--surface-2)]"
              >
                Enter demo
              </a>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted-ink)]">
                Private by default
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
