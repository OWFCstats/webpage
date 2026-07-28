# Old Wellingtonians FC — stats site

Multi-page stats site for the club: results, leaderboards, player pages,
match reports and charts. React (Vite) frontend, Supabase (Postgres + auth)
backend. Public pages are read-only; writing requires a Supabase admin login
and is enforced by Row Level Security, not just the UI.

## One-time setup

1. **Database** — in the Supabase Dashboard, open *SQL Editor*, paste the whole
   of [`supabase/schema.sql`](supabase/schema.sql) and run it. It creates the
   `players`, `matches` and `appearances` tables and the RLS policies
   (public `select`, writes only for authenticated users).
2. **Auth** — in *Authentication → Sign In / Up*, turn **off** "Allow new users
   to sign up" (any authenticated user can write, so accounts must be created
   by you). Then add each admin under *Authentication → Users → Add user*.
3. **Local env** — copy `.env.example` to `.env.local` and fill in the
   project URL and publishable key (Dashboard → Settings → API). `.env*` is
   git-ignored; the publishable key is a public client key — data is protected
   by RLS, not by hiding the key.
4. **Crest** — drop the club crest image at `public/crest.png`. Until it
   exists the header shows an "OW" monogram.

## Develop

```sh
npm install
npm run dev
```

## Deploy (GitHub Pages)

The workflow in `.github/workflows/deploy.yml` builds and publishes on every
push to `main`. Before the first deploy:

1. Repo *Settings → Pages* → Source: **GitHub Actions**.
2. Repo *Settings → Secrets and variables → Actions* → add two secrets:
   `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.

The build uses relative asset paths and hash-based routing, so the same build
works on GitHub Pages and on a custom domain later — no URL is hardcoded.

## How stats work

Everything on the site is computed from the three tables at load time —
nothing is hardcoded and no stat is stored twice. Clean sheets are derived:
a GK or DEF gets one for each match they appeared in where the team conceded
zero. Match results (W/D/L) are derived from the score when saving a match.

## Admin flow

Log in via the header → **Admin**:

1. *Players* — add or edit the squad.
2. *Matches → Create match* — season, date, opponent, competition, score
   (leave the score blank for an upcoming fixture).
3. After saving you land on *Lineup & stats* — tick the squad, mark
   starters vs subs, enter goals / assists / cards / MOTM per player.
4. *Report* — write the match report shown on the public match page.
