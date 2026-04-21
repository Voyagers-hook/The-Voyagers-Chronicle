# Welcome to your Lovable project

## Running locally

This is a Vite + React + Supabase app.

1. Create `.env` (see `.env` in repo root for the expected keys)
   - Optional: set `VITE_SITE_URL` to control magic-link redirect (defaults to current origin).
2. Install deps and run:

```bash
npm install
npm run dev
```

## Admin access

Admin is controlled by the `public.user_roles` table in Supabase. Because of RLS, you can’t grant admin from the browser.

### Grant yourself admin (recommended)

1. Sign in to the app once (so your user exists in Supabase)
2. In the app, open the **Admin access** helper panel (home page) and copy the SQL
3. Paste it into Supabase **SQL Editor** and run it
4. Refresh the app; you’ll see the **Admin** button in the header

## Auth redirect (magic links)

The sign-in email link redirect uses `VITE_SITE_URL` when set, otherwise it falls back to `window.location.origin`.
If Supabase still redirects to the “original” hosted domain, ensure that domain is in Supabase Auth → URL configuration (redirect allowlist).
