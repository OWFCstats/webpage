# Old Wellingtonians FC — stats site

## What this is for

A stats site for an old boys' football club. It has two jobs, in this order:

1. **Make players want to turn up.** Goals, assists, appearances, awards and
   badges exist so that showing up week after week is visibly worth something.
   If a change doesn't make a player more likely to check the site or want
   their name higher on it, it's decoration.
2. **Keep the club's history.** Seasons accumulate. In ten years this is where
   someone looks up who played, who scored, and who won what. Nothing should be
   built in a way that loses a season.

Match and league content — fixtures, results, standings — is the layer around
that core, not the core. It answers "what's happening", which is why people
open the site; the player content is why they stay.

The audience is the squad, on phones, mostly on a Saturday night or a Sunday
morning. Data is entered on a phone too. Mobile is the design target, not the
fallback.

Anyone who has never played for the club should be able to land on Home and
see a real, competitive team — within a screen or two of scrolling. That is not
a first-screen requirement, though: the first screen belongs to the squad, and
what it owes them is the last result and a name.

## Sections (don't add a sixth)

Five public sections. The nav does not grow. If something new doesn't belong in
one of these, that's a sign it doesn't belong yet.

| Section | Owns | Sub-pages |
| --- | --- | --- |
| **Home** | What's happening now, led by the last result with its MOTM named on the same surface. League position, form, next fixture. | — |
| **Matchday** | One match at a time: scoreboard, squad, report, and the archive stepper across the season. | — |
| **Season** | One season as a whole. | Season · Charts |
| **Players** | The leaderboards, the squad, and the numbers. Individual player pages hang off it. | Leaderboards · Squad · Data centre |
| **Records** | **All time**, and anything above a single season. | Badges · Honours · All-time |

**A section may have sub-pages; the nav still has five entries.** Depth goes
into a sub-page with a real address, reached by a segmented control at the top of
the section — not into a sixth tab and not into a dropdown on the bottom bar. See
*Structure* in `docs/DESIGN.md`.

The Players/Records split is the one to keep straight, because they used to
render the same leaderboard component with a season selector and therefore said
the same thing twice. It no longer splits the same way on every sub-page:
**Players → Leaderboards is scoped to a season** — the current one, open in
full, with every earlier season collapsed into a thin banner beneath it, so a
name's current standing is still the first thing on the page. **Players →
Squad and → Data centre are the club's whole history by default**, because a
name or a stat should be findable regardless of which season it happened in —
both take an optional year filter for the reader who wants one season only.
**Records stays the one place that combines every season into a single
all-time board**, so a career total is never the same board shown twice.

Admin sits behind a login and is lazy-loaded, so a public visitor never
downloads it. It is the phone-first flow — a pub table on a Saturday night —
and it is measured like every public page: its routes are in
`scripts/site-map.js` and `npm run check:layout` covers them. They were outside
that list until Phase 35, which is how three of its pages came to hide columns
on a phone while every reader-facing one was checked at six widths on every
pull request.

Being fetched on demand is also the one way a page can take the whole site down
with it, so **the `<Suspense>` and `<ErrorBoundary>` those routes need live
inside `components/Layout.jsx`**, around `<Outlet />` rather than around the
router. Outside the frame they unmounted the masthead and the tab bar too —
tapping *Add result* on a bad signal gave a spinner alone on empty paper, and a
chunk that never arrived gave a blank document. See *The frame outlives the
page* in `docs/DESIGN.md`.

**One match is one row.** Fixtures are entered in advance, so every write path
that records a result — the wizard and the walkover form — fills in the fixture
already in the diary rather than inserting beside it (`lib/admin.js` →
`fixtureFor`). Getting this wrong is not a cosmetic bug: the site showed one
game as both the last result and the next fixture, and lost the kick-off time
and venue entered with it.

Renames are expensive — every old address needs a redirect shim, and
`src/App.jsx` already carries seven of them. Name a section for what it *is*,
not for what it currently shows.

## Stack

React 18 + Vite, React Router (hash routing), Supabase (Postgres + auth),
Recharts. Deployed to GitHub Pages by `.github/workflows/deploy.yml` on push to
`main`, at `oldwellingtoniansfc.com` (registered at Porkbun; the DNS, the
`CNAME` file and the `SITE_URL` variable are Phase 47, and `README.md` has the
runbook); `.github/workflows/check.yml` runs the tests, the layout invariants and
a production build on every pull request; `.github/workflows/backup.yml` dumps
the database to `backups/` daily.

```sh
npm install
npm run dev             # needs Supabase credentials in .env.local
npm run dev:fixture     # the real pages on the committed fixture, no credentials
npm run build

npm test                # lib/ unit tests, over the fixture
npm run check:layout    # the mobile invariants, as assertions
npm run shots           # every route × width to shots/, with page heights
npm run badges -- <dir> # ingest a drop of badge art: rename, optimise, commit
npm run backup          # pull every row to backups/ — what CI runs daily
```

No test needs a database. `fixtures/` holds the club's real 2025/26 season
parsed to JSON plus the states one season doesn't contain, and `vite.config.js`
aliases `lib/supabase` to a stub when `FIXTURE` is set — `src/` has no idea any
of it exists. See `fixtures/README.md`.

Public pages are read-only. Writes require a Supabase login and are enforced by
Row Level Security, not by the UI. The publishable key is a public client key —
data is protected by RLS, not by hiding it.

**A read that can grow has to page.** PostgREST caps a response at 1,000 rows.
Every read `DataContext` makes goes through `lib/paging.js`, which fetches to
exhaustion under a total order — a unique tiebreaker on every query, since
paging an order that has ties lets rows move between pages. `scripts/backup.mjs`
pages the same way. `appearances` is the table that would have hit the cap
first — 155 rows after one season, so around season six — and it was read with
no `.order()` at all, so the thousand rows that came back would have been
arbitrary: not a table that breaks loudly, but every derived figure on the site
going quietly wrong. Phase 43 closed it. Anything added later that reads a table
which grows per match, per appearance or per season pages the same way.

**Reads and writes use two different clients.** `lib/supabase.js` exports
`supabase`, which carries the admin's session, and `supabaseRead`, which sends
the publishable key and nothing else; `DataContext` — which holds every read the
site makes — uses the second. Every table is `for select using (true)`, so a
read never needed a login, and sharing one client meant a just-refreshed token
the API rejected ("JWT issued at future") turned the whole site into an error
note until a manual reload. There is no reload on a phone's home screen, so
`DataContext` also retries twice before it reports anything at all.

## Architecture

```
src/
  main.jsx, App.jsx        routing, providers
  assets/badges/           the club’s badge drawings — one SVG per badge per tier
  context/                 AuthContext (session), DataContext (one load, shared)
  lib/                     derivation and helpers — no JSX
  components/              presentational; shared at the top, one dir per page
  pages/                   one file per route; layout and data wiring only
  pages/admin/             the write side, lazy-loaded
  styles/                  see docs/DESIGN.md
supabase/                  schema.sql + one migration file per change
fixtures/                  the committed season, the datasets, the Supabase stub
backups/                   the database, dumped daily by CI: JSON + restore.sql
scripts/                   the harness: shots, check:layout, the invariants
tests/                     node --test over lib/, against the fixture
docs/DESIGN.md             the design system — read before touching UI
docs/ROADMAP.md            what's planned, in order
```

`fixtures/`, `scripts/`, `tests/` and `backups/` are outside `src/` on purpose:
nothing the site ships imports them, and the fixture stub reaches the app
through one alias in `vite.config.js` rather than a flag anybody has to
remember to unset.

**`backups/` is the club's history, not a fixture.** Everything the site knows
lives in one free-tier Postgres instance with no automated backups, so the daily
job in `.github/workflows/backup.yml` is the only second copy — six JSON files
plus a `restore.sql` that upserts them back. CI writes it and nothing else does;
a human editing a file in there is editing a record, not a config. The same run
is the keepalive (Supabase pauses a free project after about a week idle) and
the site's only alerting (a failed fetch fails the job and emails the owner),
which is why it is daily rather than weekly.

`src/assets/badges/` is inside `src/` so Vite hashes and emits the twenty-two
drawings as cached assets rather than serving them unversioned: they are
`<img src>` now, not inlined markup, because nothing recolours them any more and
807 KB of artwork does not belong in the JavaScript bundle.
`components/BadgeIcon.jsx` is the only thing that draws one and
`lib/badge-art.js` is the whole of the lookup. A career badge's file is
`<key>-<metal>.svg` and everything else is `<key>.svg`, where the key is also its
key in `lib/awards.js` and its address under `/records/badges/`; nothing else
goes in that directory. `npm run badges -- <dir>` is how a fresh drop of art gets
renamed, optimised and written there. `public/` stays for what the browser
fetches whole and unversioned: the crest, the share card (`og.png`) and the
home-screen icons, which a WhatsApp scraper and a phone's installer both have
to find at a stable address rather than a hashed one. `npm run og` redraws all
four against `styles/tokens.css` and the site's own faces; nothing in CI runs
it, so re-run it when the crest or the palette changes.

**Cookies only — no `localStorage`, no `sessionStorage`, anywhere.**
`lib/cookieStorage.js` is the adapter that keeps supabase-js off `localStorage`,
and the same rule covers anything the site remembers about a reader. There are
two kinds of client state and they must not be confused: the admin's session is
authentication and grants writes, while a reader picking their own name is a
preference on their own phone with no account behind it. `docs/DESIGN.md` →
*What the site remembers* is the ruling.

**Everything is derived, nothing is stored twice.** Player totals, records,
form, badges, points, goal difference — all computed from `players`, `matches`,
`appearances` and `teams` at load time. A stored total can drift from the rows
it summarises; a derived one can't. The exceptions are deliberate and few:
league standings (`league_rows`) need other clubs' results, which we don't
have, and hand-picked awards need a human. Both are typed in by an admin.
Don't add a third exception without a reason that good.

**A page file should read as a layout.** Sections, and the data it feeds them.
When a page defines its own presentational sub-components inline it has stopped
being a page — move them to `components/`. Anything over ~250 lines is telling
you something. Two files are over it today and both are on Phase 51's list:
`components/season/SeasonCharts.jsx` at 374 and `pages/admin/AddResult.jsx` at
295. Phase 8's row in the roadmap used to record "longest 247 lines", which is
the kind of measurement that goes stale quietly, so the rule is written as a
threshold now and the exceptions are named.

The one thing that isn't a section and does belong in a page: a keyed inner
component behind a load guard (`<LineupInner key={matchId} …>`). Its job is to
seed `useState` from loaded data and reset on navigation, which is wiring, not
presentation. Four admin pages use it and it's the reason they can't be split
any further.

**`components/` is shared vocabulary at the top level, one directory per page
below it.** `components/matchday/Scoreboard.jsx` is Matchday's; `bits.jsx`,
`BadgeIcon.jsx` and `LeagueTable.jsx` are everyone's. The line is what renders it:
two or more pages puts a component at the top level, one page puts it in that
page's directory, named after the page file (`player-detail/`, `add-result/`).
A component that gains a second page moves up — that's what happened to
`WalkoverForm`, which two admin pages open.

**`lib/` is split by domain, not by size.** Formatting, matches, players,
awards, league, charts, tokens. A helper goes where its subject lives.

Two modules in there aren't about football. `lib/tokens.js` reads the design
tokens out of `styles/tokens.css` for the charts and sparklines, which put
colours in SVG attributes where `var()` doesn't work — no colour is ever
written down in JS. `lib/analytics.js` is the usage counter. Its
*configuration* names no vendor — which counter is a signup decision, so it
takes a script URL and one data-attribute as build-time variables and compiles
to nothing when they are unset, which is every local run and every pull
request. Its *counting* has to name one, because a hash-routed site on a static
host serves every route under one pathname and only a manual `count(path)` can
say which route a reader is on; GoatCounter is the branch it has.

**What it has to measure is whether a player opened their own page**, not how
many sections got opened — the first is the test this file's job 1 states, and
a section counter cannot answer it. So the site files every view itself and the
script files none (`no_onload`), including the first, since a link pasted into
the group chat is how a player reaches their own page; UUID routes are counted
as template paths and readable keys are left alone; a player page and a badge
page each fire a named event; and views taken before the deferred script lands
are held rather than dropped. Phase 45.

## Conventions

- **Mobile first.** Check every change at 375px before anything else, with
  `npm run check:layout` and `npm run shots`. A table that side-scrolls is a bug
  *including inside a `.table-wrap`*: that loophole is how two tables shipped
  hiding a third of themselves, and the check now asserts the rule as
  `DESIGN.md` states it rather than the weaker version that passed. It is green
  on `main` — every known failure names the phase that owns it on
  `scripts/expected-failures.js`, and anything not on that list is a regression.
  Pages have height budgets; see *Mobile* in `docs/DESIGN.md`.
- **Comments explain why, not what.** The existing ones are the house style:
  short, specific, and about the decision rather than the mechanics. Keep that.
- **No new page-specific CSS class without checking the primitives first.**
  This is how `styles.css` reached 2,654 lines. See `docs/DESIGN.md`.
- **One migration file per schema change**, named `migration_YYYY_MM_thing.sql`,
  and `schema.sql` updated to match.
- **One branch per change**, single purpose, descriptive commit. This part is
  already working well — keep it.
- **Empty states are content.** A record nobody holds still gets named. The club
  is early, not empty, and the copy should say so. An empty state says what to do
  next; it does not explain the design.
- **Explain decisions in the docs, not on the page.** Fifteen blocks of
  explanatory prose had accumulated across eleven components — a five-line
  paragraph under the honours board was longer than the five awards above it. If
  a section needs a paragraph to justify itself, that paragraph belongs in
  `docs/DESIGN.md` and the section probably needs redesigning.
- **The current season is the most recent season with a result**, not with a row.
  Entering next season's fixtures must never blank the site.

## Working agreement

The reason this project needed rebuilding three times in its first month is
that nothing was written down, so every session re-argued the design and the
information architecture from scratch.

So: **a change either fits the system or changes the system.** If it fits,
build it. If it doesn't, edit `docs/DESIGN.md` or this file *in the same
commit* as the code. Never leave the docs describing a site that no longer
exists — a stale doc is worse than no doc, because the next session will trust
it.

Before adding a feature, check `docs/ROADMAP.md`. If it's not there and it's
not small, it goes there first.

**The site has not been sent to the squad yet.** `docs/ROADMAP.md` → *Now* is
the release sequence and the order is deliberate: Phases 42–47, then a launch
checklist, then everything under *Next*. A change that isn't one of those is
almost certainly not the next thing to do.

**When a phase lands, condense it.** Its row in the roadmap's *Done* table is one
line; its instructions are deleted in the same commit that closes it. The detail
lives in the commit message (`git log --grep="Phase 20"`) and any ruling it
established lives in `docs/DESIGN.md`. The roadmap reached 2,163 lines by keeping
every closed phase in full, which is a cost every session pays and no session
reads.
