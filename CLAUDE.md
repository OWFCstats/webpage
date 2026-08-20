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
see a real, competitive team.

## Sections (don't add a sixth)

Five public sections. The nav does not grow. If something new doesn't belong in
one of these, that's a sign it doesn't belong yet.

| Section | Owns |
| --- | --- |
| **Home** | What's happening now: next fixture, last result, league position, form. Plus one player-facing hook (MOTM of the last game). |
| **Matchday** | One match at a time: scoreboard, squad, report, and the archive stepper across the season. |
| **Season** | One season as a whole: the league table, results, and season charts. |
| **Players** | The squad and the leaderboards — two views behind one nav entry, chosen by a selector at the top of the page. Individual player pages hang off it. |
| **Records** | Above any one season: club records, the honours board, the club badge board, all-time leaders. |

Admin sits behind a login and is lazy-loaded, so a public visitor never
downloads it.

Renames are expensive — every old address needs a redirect shim, and
`src/App.jsx` already carries seven of them. Name a section for what it *is*,
not for what it currently shows.

## Stack

React 18 + Vite, React Router (hash routing), Supabase (Postgres + auth),
Recharts. Deployed to GitHub Pages by `.github/workflows/deploy.yml` on push to
`main`.

```sh
npm install
npm run dev
npm run build
```

Public pages are read-only. Writes require a Supabase login and are enforced by
Row Level Security, not by the UI. The publishable key is a public client key —
data is protected by RLS, not by hiding it.

## Architecture

```
src/
  main.jsx, App.jsx        routing, providers
  context/                 AuthContext (session), DataContext (one load, shared)
  lib/                     derivation and helpers — no JSX
  components/              presentational; shared at the top, one dir per page
  pages/                   one file per route; layout and data wiring only
  pages/admin/             the write side, lazy-loaded
  styles/                  see docs/DESIGN.md
supabase/                  schema.sql + one migration file per change
docs/DESIGN.md             the design system — read before touching UI
docs/ROADMAP.md            what's planned, in order
```

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
`Plate.jsx` and `LeagueTable.jsx` are everyone's. The line is what renders it:
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

- **Mobile first.** Check every change at 375px before anything else. A table
  that side-scrolls on a phone is a bug.
- **Comments explain why, not what.** The existing ones are the house style:
  short, specific, and about the decision rather than the mechanics. Keep that.
- **No new page-specific CSS class without checking the primitives first.**
  This is how `styles.css` reached 2,654 lines. See `docs/DESIGN.md`.
- **One migration file per schema change**, named `migration_YYYY_MM_thing.sql`,
  and `schema.sql` updated to match.
- **One branch per change**, single purpose, descriptive commit. This part is
  already working well — keep it.
- **Empty states are content.** A record nobody holds still gets named. The club
  is early, not empty, and the copy should say so.

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
