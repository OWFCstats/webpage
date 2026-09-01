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
2. **Auth** — in *Authentication → Sign In / Up*, turn **off** both "Allow new
   users to sign up" **and** "Allow anonymous sign-ins". Writes are granted to
   any `authenticated` role, and an anonymous sign-in creates one, so either
   left on hands the club's whole database to anybody who finds the site. Then
   add each admin by hand under *Authentication → Users → Add user*. This is
   the only thing standing between a public URL and a stranger rewriting the
   record; it is a dashboard setting and no code enforces it, so check it
   rather than assuming it.
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

`check:layout` passes on `main`. Its only known failures are the club crest,
which is a bitmap and can't be measured for icon contrast — see
`scripts/expected-failures.js`, `fixtures/README.md` and `docs/ROADMAP.md`.

## Deploy (GitHub Pages)

The workflow in `.github/workflows/deploy.yml` builds and publishes on every
push to `main`. Before the first deploy:

1. Repo *Settings → Pages* → Source: **GitHub Actions**.
2. Repo *Settings → Secrets and variables → Actions* → add two secrets:
   `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.

The build uses relative asset paths and hash-based routing, so the same build
works on GitHub Pages and on the custom domain — no URL is hardcoded.

## The link preview, and the home screen

`npm run og` draws four files into `public/`: `og.png`, the 1200x630 card a
messaging app shows when the link is pasted, and the 192 / 512 / 180px icons a
phone uses when the site is installed to a home screen. They are rendered in
Chromium against `src/styles/tokens.css` in the site's own faces, so the card is
the masthead at poster size rather than a second place a colour is written down.
The output is committed — a scraper needs a stable address, not a hashed one.
Nothing in CI runs it: re-run it by hand when the crest or the palette changes.

`public/manifest.webmanifest` is what makes *Add to Home Screen* give the crest
as an icon and open the site full-screen on Home, with no browser chrome.

The `og:image` and `og:url` tags need an absolute URL — a scraper isn't a
browser that already knows where it is — so `vite.config.js` substitutes
`%SITE_URL%` at build time. It is the one absolute URL in the build. Unset it
falls back to the GitHub Pages address; see below.

## The domain

The site's address is **`oldwellingtoniansfc.com`**, registered at Porkbun.
Nothing in the build hardcodes a URL, so this is configuration rather than a
change. Steps, in order:

1. **Porkbun → your domain → DNS Records.** Add GitHub's four apex `A` records
   for `oldwellingtoniansfc.com`, plus the four `AAAA` records if you want IPv6.
   Then a `CNAME` record for the `www` host pointing at `owfcstats.github.io`.
   Take the actual IP addresses from GitHub's own *Managing a custom domain for
   your GitHub Pages site* page rather than from here — they are the one value in
   this file that could go stale, and a wrong one fails the DNS check with no
   clue why.
2. **Repo → Settings → Pages → Custom domain.** Enter `oldwellingtoniansfc.com`,
   save, wait for the DNS check to pass (minutes to a few hours), then tick
   **Enforce HTTPS**. The certificate is free and automatic.
3. **Add `public/CNAME`** containing just `oldwellingtoniansfc.com`. With an
   Actions-based deploy the setting in step 2 lives in repo config rather than in
   the branch, and this keeps the domain in the built artifact too.
4. **Set the `SITE_URL` repository variable** (*Settings → Secrets and variables
   → Actions → Variables*) to `https://oldwellingtoniansfc.com`, then re-run the
   deploy.

**Step 4 is the one that bites, because skipping it breaks nothing visible.**
`SITE_URL` is the only absolute URL in the build, and it feeds `og:image` and
`<link rel="canonical">`. Set the domain without setting the variable and every
page still loads perfectly; the only symptoms are that a pasted link fetches its
preview image from the old `github.io` origin and that the canonical tag points
search engines somewhere else. Nothing in CI catches it. So after the deploy,
paste the link into a chat with yourself and look at the card.

**Do this before telling the squad to install the site.** An installed app is
pinned to the origin it was installed from, and the admin's session cookie is
scoped to that origin too. The `github.io` address keeps redirecting so nothing
already shared breaks, but installing from one origin and then moving is how you
end up supporting two.

URLs keep the `#` — that is hash routing, which is what lets a single-page app
work on a static host, and changing it would break every link already shared.

## Counting usage

GitHub Pages is a file host with no server logs, so knowing whether the squad
opened the site after Saturday's game takes a script in the page.
`src/lib/analytics.js` is that, and it names no vendor — which counter to use is
a signup decision. Two build-time variables configure it:

```
VITE_ANALYTICS_SRC     the script URL the provider gives you
VITE_ANALYTICS_ATTR    its one data-attribute, as name=value (optional)
```

Set them as repository *variables* (not secrets — they end up in the bundle,
which is the point) and `deploy.yml` passes them through. Unset, which is how
the site ships today and how every local run and pull request builds, the module
does nothing: no script, no requests, nothing in the bundle.

**GoatCounter is the counter this club uses.** It is free at this size,
cookieless, and the one provider in the list whose manual `count()` this code
already calls correctly.

`analytics.js` lists four providers at the top and one of them is a trap:
**Cloudflare Web Analytics cannot work here.** Its beacon exposes no manual
counter, so `countView` has no branch for it, and choosing it would count the
landing page and nothing else — exactly the failure the module says it exists
to prevent. Plausible has the opposite problem: the SRC listed is
`script.hash.js`, which already fires a pageview on `hashchange`, so combining
it with the manual call would count every navigation twice. Phase 45 cuts the
list down to what `countView` can serve. Until it lands, use GoatCounter.

The one thing worth knowing: the site is on hash routing, so a section change is
a `#/players` change. Most counters watch `history.pushState`, which React
Router does call — but the ones with a manual counter get told explicitly from
`Layout.jsx`, so the numbers say which sections get opened rather than just that
somebody landed on Home. Production builds only: the layout harness drives every
route at six widths twice per run, and those aren't visits.

## Backups, and keeping the database awake

`.github/workflows/backup.yml` runs `npm run backup` every day at 04:17 UTC. It
reads all six tables through the public key and writes `backups/` — one JSON
file per table plus `restore.sql`, which upserts the lot back — then commits,
but only when something actually changed (or once a month regardless, so the
scheduled workflow isn't disabled for repository inactivity).

It exists because the free Supabase tier has no automated backups. It also
solves two problems it wasn't built for:

- **Pausing.** Supabase sleeps a free project after roughly a week with no
  requests, and nobody opens a football site in June. A fetch a day keeps it up.
- **Alerting.** If the fetch fails — paused project, rotated key, an outage —
  the job fails and GitHub emails the repo owner. That is the only monitoring
  the site has.

To restore: open the Supabase SQL editor and run `backups/restore.sql`. It
upserts on the primary key, so it repairs a partly-damaged database in place.
For a clean point-in-time restore, empty the tables first — `season_awards`,
`league_rows`, `appearances`, `matches`, `players`, `teams`, in that order — and
then run it.

Run it by hand any time from *Actions → Backup → Run workflow*, or locally with
`node --env-file=.env.local scripts/backup.mjs`.

If `main` is ever branch-protected, the commit step will start failing: either
allow `github-actions[bot]` to bypass the rule, or point the job at a branch of
its own. Nothing else in the workflow needs to change.

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
