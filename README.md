# JC TOURNAMENT

**PLAY · COMPETE · WIN**

JC TOURNAMENT is a Vite React application for Free Fire esports tournaments, wallet-backed entries, admin-reviewed deposits, and leaderboard results powered by Supabase.

## Project overview

- Frontend: React + Vite + Tailwind CSS
- Backend: Supabase Auth + Postgres + Realtime + RLS
- Production build output: `dist`
- Required frontend env vars:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`

## Local development

```bash
npm install
npm run dev
npm run build
```

## Environment variables

Create a local `.env` file with:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

Do not use `NEXT_PUBLIC_*` values in a Vite app.

## Supabase data model

The app expects the live Supabase tables and columns to match the current schema contract:

- `profiles` with `id`, `email`, `full_name`, `username`, `phone`, `avatar_url`, `wallet_balance`, `role`, `stats`
- `tournaments` with `status`, `date`, `entry_fee`, `room_released`, `results_published`
- `participants`, `results`, `wallet_transactions`, `deposits`, `withdrawals`, `notifications`

Realtime should be enabled only for the tables the app actually uses, without adding unrelated tables.

## Deployment

Production deployment uses the existing Netlify site and the standard Vite build configuration:

- Build command: `npm run build`
- Publish directory: `dist`

## Security notes

- Keep Row Level Security enabled.
- Do not expose a Supabase service role key in client code.
- Only grant function execution to authenticated users when the function itself enforces the needed authorization and admin checks inside the SQL function body.
- Anonymous users must not be able to call privileged wallet, deposit, or tournament result functions.

## Project status

This repository is intentionally kept on the Supabase migration path and does not include Firebase runtime dependencies.
