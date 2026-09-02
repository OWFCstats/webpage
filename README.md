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
3. Same screen, *Variables* tab → add `VITE_ANALYTICS_SRC` and
   `VITE_ANALYTICS_ATTR` from the club's GoatCounter account — the two values
   are under *Counting usage* below. Skipping this breaks nothing; the site
   just never tells you whether anybody opened it.

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
`%SITE_URL%` at build time. It is the one absolute URL in the build, and it is
read out of `public/CNAME`: the domain is written down once, in the file the
deploy already ships. See *The domain* below.

### The offline shell

`public/sw.js` is a service worker, registered by `src/lib/offline.js` on
production builds only. It exists because an installed app has no address bar:
without it, a phone with no signal got the browser's own offline page and no way
back. With it the app opens to the masthead, the tab bar and a "no connection"
note where the stats go, and re-reads by itself when the signal returns.

It is **network-first** — every request tries the network and only falls back to
what it last had — so a deploy is picked up on the next visit and nobody can end
up pinned to an old build. It caches the site's own files only; every request to
Supabase is cross-origin and never goes through it, so no club data and no login
is stored on the phone.

Two things worth knowing when supporting a phone:

- **The cache fills as the reader passes through it**, not from a list built at
  deploy time. So the first-ever visit installs the worker and the *next* one is
  the one that works with no signal — which installing to a home screen and
  opening it already is.
- **Nothing needs clearing.** If a phone ever does look stuck on an old page,
  the honest fix is still a reload with a signal, and a worker at a stable
  address is what lets a bad one be replaced by a deploy rather than by asking
  thirty people to clear their site data.

`tests/sw.test.js` drives the worker in a fake browser — network-first, the
same-origin rule, the shell served for any URL, and a new build evicting the
old. It is the one part of the site nobody can eyeball, because it only does
anything on a connection that has stopped working.

## The domain

The site's address is **`oldwellingtoniansfc.com`**, registered at Porkbun. It
is set up and live. Nothing in the build hardcodes a URL, so this was
configuration rather than a change; what follows is the record of it, and what
to do if the address ever moves.

**`public/CNAME` is the domain.** One line, no scheme. Three things read it: the
Pages deploy, which needs it in the artifact or a deploy can clear the custom
domain; `vite.config.js`, which turns it into the `https://` origin it
substitutes for `%SITE_URL%`; and the *the domain shipped* step in
`.github/workflows/check.yml`, which fails a pull request whose build gets
either of those wrong. Changing the address means editing that file and the DNS,
and nothing else in the repository.

The DNS, at **Porkbun → your domain → DNS Records**:

- Four `A` records on the apex, one per GitHub Pages IPv4 address.
- Four `AAAA` records on the apex, the same four servers over IPv6. Worth having
  rather than optional: a phone on a mobile network with no IPv4 left resolves
  `AAAA` or nothing.
- A `CNAME` record for the `www` host pointing at `owfcstats.github.io`, which
  is what makes `www.` reach the site too.

Take the IP addresses from GitHub's own *Managing a custom domain for your GitHub
Pages site* page rather than from here — they are the one value in this file that
could go stale, and a wrong one fails the DNS check with no clue why.

Then **Repo → Settings → Pages → Custom domain**: enter the domain, save, wait
for the DNS check to pass (minutes to a few hours), and tick **Enforce HTTPS**.
The certificate is free and automatic.

There used to be a fourth step — a `SITE_URL` repository variable holding the
same domain a second time — and it was the one that bit, because skipping it
broke nothing visible: every page still loaded, and the only symptoms were a
pasted link fetching its preview image from the old `github.io` origin and a
canonical tag pointing search engines somewhere else. Reading `public/CNAME`
instead removed the second copy, and CI now asserts the built `og:image` and
canonical are on that domain, so the failure is loud and lands on a pull request
rather than on a link in the group chat. `SITE_URL` is still honoured if it is
set in the environment, for building against some other address without editing
the file the deploy reads; the repository variable is no longer used and can be
deleted.

**Move the squad before they install, not after.** An installed app is pinned to
the origin it was installed from, and the admin's session cookie is scoped to
that origin too. The `github.io` address keeps redirecting so nothing already
shared breaks, but installing from one origin and then moving is how you end up
supporting two.

URLs keep the `#` — that is hash routing, which is what lets a single-page app
work on a static host, and changing it would break every link already shared.

## Counting usage

GitHub Pages is a file host with no server logs, so knowing whether the squad
opened the site after Saturday's game takes a script in the page.
`src/lib/analytics.js` is that script's whole footprint. It is cookieless: no
personal data, no consent banner, nothing that would make the site worth
avoiding.

Two build-time variables configure it:

```
VITE_ANALYTICS_SRC     the script URL the provider gives you
VITE_ANALYTICS_ATTR    its one data-attribute, as name=value (optional)
```

Set them as repository *variables* (not secrets — they end up in the bundle,
which is the point) under *Settings → Secrets and variables → Actions →
Variables*, and `deploy.yml` passes them through. Unset — every local run and
every pull request — the module compiles to nothing: no script, no requests, no
vendor name anywhere in the bundle.

**GoatCounter is the counter this club uses**, free at this size and cookieless.
Its two values:

```
VITE_ANALYTICS_SRC     https://gc.zgo.at/count.js
VITE_ANALYTICS_ATTR    data-goatcounter=https://<your-code>.goatcounter.com/count
```

### The site counts every view; the script counts none

This is a hash-routed app, so `#/players` and `#/records` are one pathname as
far as the browser is concerned, and `<link rel="canonical">` pins even that to
`/`. A counter left to its own devices therefore files every arrival against
`/` and reports that the squad opened Home and read nothing — including the
arrival that matters most, a player page pasted into the group chat.

So `startAnalytics` sets GoatCounter's `no_onload` before loading count.js, and
`Layout.jsx` calls `countView` for every route including the first. Two
consequences worth knowing:

- **The first view of every visit is fired before the deferred script exists.**
  `analytics.js` holds views until count.js loads and files them in order —
  bounded at twenty, and dropped if the script errors, which is what an ad
  blocker looks like.
- **Ids never reach the dashboard.** Every id in the database is a UUID, so a
  raw pathname would fill the dashboard with a row per player and a row per
  match, each counting one or two visits. `describeView` collapses them to
  `/players/:playerId`, `/matchday/:matchId` and so on. Readable keys are left
  alone — `/records/badges/appearances` and `/opponents/old-stoics` say
  something a template path would throw away.

A player page and a badge page also fire a named event, `player-page` and
`badge-page`. A path count answers "was Players opened"; the question this site
exists to answer is whether a player looked up their own goals, and only an
event named for it survives the next redesign of the nav.

### Adding a provider takes a branch, not just a variable

The configuration names no vendor, but the counting has to: only a provider
with a manual `count(path)` can be told which hash route the reader is on, and
that call differs per vendor. `countView` has one branch, for GoatCounter.
Two providers were listed in this file until Phase 45 and neither can do the
job:

- **Cloudflare Web Analytics** exposes no manual counter at all. Choosing it
  would count the landing page and nothing else.
- **Plausible's** `script.hash.js` counts a `hashchange` itself, so the manual
  call would double every move. Its `script.manual.js` is the variant to
  investigate if the club ever switches.

So a third provider means reading its manual-pageview API, adding a branch, and
checking whether it counts anything on its own — not just changing a variable.

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
