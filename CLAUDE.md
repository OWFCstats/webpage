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
downloads it.

Renames are expensive — every old address needs a redirect shim, and
`src/App.jsx` already carries seven of them. Name a section for what it *is*,
not for what it currently shows.

## Stack

React 18 + Vite, React Router (hash routing), Supabase (Postgres + auth),
Recharts. Deployed to GitHub Pages by `.github/workflows/deploy.yml` on push to
`main`; `.github/workflows/check.yml` runs the tests, the layout invariants and
a production build on every pull request.

```sh
npm install
npm run dev             # needs Supabase credentials in .env.local
npm run dev:fixture     # the real pages on the committed fixture, no credentials
npm run build

npm test                # lib/ unit tests, over the fixture
npm run check:layout    # the mobile invariants, as assertions
npm run shots           # every route × width to shots/, with page heights
```

No test needs a database. `fixtures/` holds the club's real 2025/26 season
parsed to JSON plus the states one season doesn't contain, and `vite.config.js`
aliases `lib/supabase` to a stub when `FIXTURE` is set — `src/` has no idea any
of it exists. See `fixtures/README.md`.

Public pages are read-only. Writes require a Supabase login and are enforced by
Row Level Security, not by the UI. The publishable key is a public client key —
data is protected by RLS, not by hiding it.

## Architecture

```
src/
  main.jsx, App.jsx        routing, providers
  assets/badges/           the club's badge drawings, one SVG per badge
  context/                 AuthContext (session), DataContext (one load, shared)
  lib/                     derivation and helpers — no JSX
  components/              presentational; shared at the top, one dir per page
  pages/                   one file per route; layout and data wiring only
  pages/admin/             the write side, lazy-loaded
  styles/                  see docs/DESIGN.md
supabase/                  schema.sql + one migration file per change
fixtures/                  the committed season, the datasets, the Supabase stub
scripts/                   the harness: shots, check:layout, the invariants
tests/                     node --test over lib/, against the fixture
docs/DESIGN.md             the design system — read before touching UI
docs/ROADMAP.md            what's planned, in order
```

`fixtures/`, `scripts/` and `tests/` are outside `src/` on purpose: nothing the
site ships imports them, and the fixture stub reaches the app through one alias
in `vite.config.js` rather than a flag anybody has to remember to unset.

`src/assets/badges/` is inside `src/` for the opposite reason: the four career
badges are recoloured per tier and three more are gilded once, which means their
fills have to be reachable, so they are inlined rather than served as images —
`components/BadgeIcon.jsx` is the only thing that reads them and `lib/badge-art.js`
does the recolouring. A file there is named for the badge's own slug, which is
also its key in `lib/awards.js` and its address under `/records/badges/`, and
nothing else goes in it. `public/` stays for what the browser fetches whole —
today that is only the crest.

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
you something.

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

`lib/tokens.js` is the one that isn't about football: it reads the design
tokens out of `styles/tokens.css` for the charts and sparklines, which put
colours in SVG attributes where `var()` doesn't work. No colour is ever written
down in JS.

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
