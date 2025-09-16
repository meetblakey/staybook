# staybook

Staybook is a local-first, Supabase-powered alternative to Airbnb built with Next.js App Router, Tailwind CSS v4, and Leaflet maps. Hosts manage listings, bookings, and conversations while guests explore, save, and reserve stays.

## Prerequisites

- Node.js 20+
- A Supabase project with Auth, Postgres, and Storage enabled

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment variables and supply your own secrets:
   ```bash
   cp .env.example .env.local
   ```
   Fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (local use only)
   - `NEXT_PUBLIC_MAP_TILES_URL` if you prefer a custom tile server
3. In Supabase Dashboard ➜ SQL Editor run the SQL files in order:
   1. `supabase/schema.sql`
   2. `supabase/policies.sql`
   3. `supabase/storage_buckets.sql`
   4. (Optional) `supabase/sample_data.sql` for quick demo content
4. To populate richer local data, run the TypeScript seed script (uses the service role key, do **not** ship to production):
   ```bash
   npm run seed
   ```
   Sample accounts are printed and can be used to sign in during development.

## Local development

```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) to explore Staybook.

## Quality checks

```bash
npm run lint
npm run typecheck
npm run build
```

## Deployment

1. Push the repo to a private GitHub repository.
2. Connect the project to Vercel.
3. Set the following environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
4. Do **not** upload the service role key to Vercel—keep it local for the seed script only.

## Architecture notes

- **Tailwind CSS v4**: configured via `postcss.config.mjs` and `@theme` tokens in `app/_styles/globals.css`. No `tailwind.config.js` is required.
- **Supabase SSR**: server utilities in `utils/supabase/` use `@supabase/ssr` for cookie-aware clients in server components, routes, and middleware.
- **Leaflet**: map rendering is isolated to `app/_components/map/MapClient.tsx`, which dynamically imports the Leaflet map with `ssr: false` to avoid window errors.
- **Server Actions**: listing, booking, messaging, and wishlist workflows use server actions to enforce Supabase RLS and keep secrets server-side.

## Safety reminders

- Never commit `.env.local` or the service role key.
- After seeding, remove the `SUPABASE_SERVICE_ROLE_KEY` from your shell history.
- Storage buckets `avatars` and `listing-photos` require the provided policies for secure uploads.
