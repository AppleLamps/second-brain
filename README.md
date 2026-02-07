Second Brain is a polished demo web app that turns X bookmarks into a searchable knowledge base, with Grok-powered insights.

## Getting Started

Install and run the dev server:

```bash
npm i
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Grok (xAI) setup

Copy `.env.example` to `.env.local` and set:

- `XAI_API_KEY`
- `XAI_BASE_URL` (defaults to `https://api.x.ai/v1`)
- `XAI_MODEL` (defaults to `grok-2-latest`)

Then use the dashboard button "Analyze" to call `src/app/api/grok/route.ts`.

## X OAuth setup (Bookmarks)

Set the following in `.env.local` (and in Vercel project env vars):

- `APP_SECRET` (random long string)
- `X_CLIENT_ID`
- `X_REDIRECT_URI` (must exactly match your app settings; e.g. `https://YOUR.vercel.app/api/auth/x/callback`)
- Optional: `X_CLIENT_SECRET` (only for confidential clients)

Then click "Connect X" (hits `src/app/api/auth/x/start/route.ts`) and the app will load bookmarks from `src/app/api/bookmarks/route.ts`.

## Neon (Postgres) setup

1. Set `DATABASE_URL` in `.env.local` (and in Vercel project env vars).
2. Run migrations:

```bash
npm run db:migrate
```

When `DATABASE_URL` is present, `/api/bookmarks` will upsert users/folders/bookmarks into Neon.

## Notes

Bookmark lookup does not return a "saved at" timestamp; the UI currently uses `created_at` as a stand-in.
