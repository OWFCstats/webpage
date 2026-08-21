# Old Wellingtonians FC — stats site

Multi-page stats site for the club: results, leaderboards, player pages,
match reports and charts. React (Vite) frontend, Supabase (Postgres + auth)
backend. Public pages are read-only; writing requires a Supabase admin login
and is enforced by Row Level Security, not just the UI.

## One-time setup

1. **Database** — in the Supabase Dashboard, open *SQL Editor*, paste the whole
   of [`supabase/schema.sql`](supabase/schema.sql) and run it. It creates the
   `players`, `matches`, `appearances`, `teams` and `league_rows` tables and the
   RLS policies (public `select`, writes only for authenticated users).
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
npm run dev            # needs Supabase credentials in .env.local
```

No credentials to hand? `fixtures/` holds the club's real 2025/26 season plus the
states one season doesn't contain, and the site runs on it:

```sh
npm run dev:fixture    # the real pages, no database
npm test               # unit tests over lib/
npm run check:layout   # the mobile invariants, as assertions
npm run shots          # every route × width to shots/, with page heights
```

`check:layout` is deliberately red on `main` until Phase 10: it names each bug it
fails on and the phase that owns it. See `fixtures/README.md` and
`docs/ROADMAP.md`.

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
nothing is hardcoded and no stat is stored twice. (The one exception is the
league table, which needs other clubs' results; see *League standings* below.) Clean sheets are derived
and team-wide: every player who appeared in a match where the team conceded
zero gets one (positions are optional labels and affect no stat). Match
results (W/D/L) are derived from the score when saving a match. A lineup row
can also be marked "Dropped out (24h)" — those rows are excluded from all
stats and surface as a separate Dropouts count on the In-Depth page.

Every opponent is a proper record in `teams` (see below), linked from
`matches.opponent_team_id`. `matches.opponent` still holds the same name as
free text — every write keeps the two in sync — so anything reading the text
column directly still works, but grouping and the opponent page resolve
through the team, not the text. A match saved before the teams migration (or
with a failed backfill) has no `opponent_team_id`; those fall back to the
free-text name so they still resolve rather than breaking the page.

A fixture's kick-off time (`matches.kickoff_time`) is optional and shown
wherever it's set. Its venue is derived, not stored: a home match points at
Old Wellingtonians' own pitch (the `teams` row with `is_club` true), an away
match at the opponent's, and a neutral or unrecorded venue shows no pitch at
all. Pitch name, address, postcode and map link all come from `teams` — set
them once per club on the Teams admin page and every fixture against that
club picks them up.

## League standings

The one table on the site that isn't derived from our own results: a league
table needs the other clubs' games, and nothing here is scraped. Standings are
typed in by hand into `league_rows` — one row per club per season, keyed on the
`teams` row so a club is spelled once and its table row links to the same page
its fixtures do. An optional `division` labels the table (e.g. "Arthurian
League Division 5"), and `updated_at` is stamped on every save so the public
table can say how current it is.

Points and goal difference are **not** columns. Both are derived in the client
(`leagueStandings` in `src/lib/stats.js`) like every other stat here, so a
stored total can never drift from the W/D/L it summarises — and there are two
fewer boxes to fill in on a Saturday night.

Rows sort on points, then goal difference, then goals scored. Where a row
carries an explicit `position` that wins instead, since leagues apply their own
tie-breaks and points deductions that a W/D/L line can't show. Home shows our
row with two clubs either side; the season page shows the whole division. Below
480px the P, D, GF and GA columns drop out rather than let the table scroll
sideways.

## Admin flow

Log in via the header → **Admin**:

1. *Players* — add or edit the squad.
2. *Teams* — manage every club (Old Wellingtonians included), their pitch
   name/address/postcode and a map link. A team referenced by any match
   can't be deleted until that match no longer points at it.
3. *Matches → Create match* — season, date, kick-off time (optional),
   opponent, competition, score (leave the score blank for an upcoming
   fixture).
4. After saving you land on *Lineup & stats* — tick the squad, mark
   starters vs subs, enter goals / assists / cards / MOTM per player.
5. *Report* — write the match report shown on the public match page.
6. *League* — enter the published standings after the results come in. Pick the
   season and type the division label, then fill the grid: one row per club,
   each with a club picker, the position (optional), and P/W/D/L/GF/GA. Add or
   remove a row, and move a club with the arrows — which carry its typed
   position with it — or use *Number 1–n* to number the rows as they stand.
   Points and goal difference update as you type but are never saved. One
   *Save table* writes the lot: clubs still in the grid are upserted, clubs
   taken out of it are deleted, and the page shows when it was last updated.
   The grid stacks to one club per block on a phone, with the save pinned to
   the bottom of the screen.
