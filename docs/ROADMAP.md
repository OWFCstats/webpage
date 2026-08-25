# Roadmap

One phase per branch, in order. Each phase names the files it touches, the work,
and the test that says it is finished.

**When a phase lands it moves to *Done* as one line, and its instructions are
deleted.** That is the whole reason this file is short. The detail behind a
closed phase is in its commit message and in `docs/DESIGN.md` — which is where
the next session should look, because that file is the contract a component
author reads. A closed phase kept in full is a thousand tokens every session
pays for and nobody reads. This file used to be 2,163 lines for exactly that
reason.

Read `CLAUDE.md` first, then `docs/DESIGN.md`. This file is the order of the
work, not the design.

---

## Done

Phases 0–8 fixed *how the site is built*. Phase 9 made it measurable. Everything
from 10 on is information design — what a page decides to say first — driven by a
page-by-page review against the club's real 2025/26 season.

| # | Phase | What changed |
| --- | --- | --- |
| 0 | Write it down | `CLAUDE.md`, `DESIGN.md` and this file exist |
| 1 | Split the CSS | `styles/` in layers, verified pixel-identical |
| 2 | Tokens and type | One token set, seven type steps, no hex outside `tokens.css` |
| 3 | Split `.card` | `.sheet` and `.board`, and the rule for which |
| 4 | Split `lib/stats.js` | Six domain modules |
| 5 | Build the plate | Tiered badges, honours board, Player of the Season |
| 6 | Players page | Leaderboard first, squad as a team sheet |
| 7 | Charts | Linear lines, flat fills, direct labels |
| 8 | Page components | Every page reads as a layout, longest 247 lines |
| 9 | Let the repo see itself | Committed fixture, `npm run shots`, `npm run check:layout`, unit tests, CI on every PR |
| 10 | The current season, and the result row | `currentSeasonOf` (most recent season with a *result*); `ResultList.jsx` is the one scoreline primitive, six call sites |
| 11 | The palette and the display face | Racing green ground, aged brass, Libre Caslon Display, the four metal ramps |
| 12 | The label device | `.block` in four variants; one heading grammar; fifteen blocks of explanatory prose cut |
| 13 | Sub-navigation | Real addresses under a section via a segmented control, applied to Players |
| 14 | Leaderboards | One leader card per stat rather than one promoted hero; 1,370px, inside budget |
| 15 | The badge system | Three classes of badge, ten drawings, `.plate` and its 24 "Nobody yet" boxes deleted |
| 16 | Records, split three ways | `/records`, `/records/honours`, `/records/all-time`; one 4,841px page became three under 2,000 |
| 17 | The squad view | `Squad.jsx` — list or tiles, all-time by default, top 20 on open |
| 18 | Season | `/season` and `/season/charts`; Charts at 1,909px |
| 19 | Home | The result leads, the next fixture collapses to a row; 2,113px → 1,882px, still 282 over |
| 20 | The Matchday scoreboard | Each score attached to its own team row; the pitch address moved to the fixture; page 1,857px → 1,812px |
| 21 | Player detail and the opponent page | 3,127px → 2,241px; the head-to-head table stopped hiding 36px at 320px |
| 22 | The data centre | `/players/data` — every player, every stat, the one deliberate side-scroll |
| 23 | Home, the cosmetic pass | The last result positions by venue with a badge marking which side is us; the momentum chart gained gridlines, value labels, an area fill and the list's own height, plus a "Charts" button |
| 24 | Players, the second pass | `seasonPools`, the closed archive banner, five small tables became one wide reference table |

**The detail behind any closed phase is in its commit** — `git log --grep="Phase
20"` finds it, and forty-five commits name their phase. That is what makes
condensing this file safe rather than lossy.

Two rulings from that half still bind everywhere: **everything is derived,
nothing is stored twice**, and **a component that gains a second page moves up to
`components/`**.

---

## Now

### Phase 25 — Matchday: the season ladder

The stepper, the form strip and the next-fixture card become one object: the
whole season as a ladder, newest first, with the match being read highlighted in
it. Approved design: `docs/mocks/matchday-final.html` (Phone and Web).

**Files**

- `src/lib/matches.js` — add `seasonLadder`
- `src/components/matchday/SeasonLadder.jsx` — new
- delete `src/components/matchday/MatchdayNav.jsx`, `src/components/matchday/FormAndNext.jsx`
- `src/pages/Matchday.jsx`, `src/styles/pages/matchday.css`
- `tests/matches.test.js`, `docs/DESIGN.md` (*Structure*)

**Do**

1. `seasonLadder(matches, season)` → one row per match, newest first:
   `{ match, gd }`, where `gd` is the cumulative goal difference **after** that
   game. Walk the played games oldest-first accumulating `goals_for -
   goals_against`, then reverse. Unplayed fixtures sort to the front with
   `gd: null`. Built on the existing `isPlayed` / `resultOf` / `playedMatches`;
   nothing new stored, nothing new in the schema.
2. `SeasonLadder.jsx` renders a rung per row on one shared
   `grid-template-columns`: date, opponent + venue mark, score, running `gd`,
   W/D/L chip. The current match's rung takes the gold wash, a gold rule top and
   bottom, and `aria-current="page"`. A fixture row drops `gd` and the chip and
   shows its kick-off time; the soonest one carries a `Next` block.
3. Names: `teams.short_name` below 900px, full `opponent` above it — one
   `.full` / `.short` pair switched in CSS, no JS. `short_name` is nullable;
   fall back to `opponent`.
4. Below 400px the venue mark comes off the rung — the scoreboard above already
   carries it. One breakpoint, the same `max-width: 359px`-style single exception
   the league table already owns; a name clipped mid-word is the bug `DESIGN.md`
   names, and a short name is a column the schema already has.
5. `Matchday.jsx` drops `<MatchdayNav>` and `<FormAndNext>`. The ladder is the
   page's spine: fixtures, the current rung, the match panel, then the older
   rungs.
6. `formOf` stays in `lib/matches.js` — Home still uses it. Only Matchday's use
   of it goes.
7. **Decide the budget question in this phase, not at the end.** The flat
   measures 2,522px at 375px against a 1,900px budget, and this ladder is ~700px
   of it. Pick one, write it down here and in `DESIGN.md`: the ladder opens on
   the eight most recent games with the rest behind one control; or the budget
   moves to ~2,300px because the page now carries the archive as well as the
   match. Do not build the whole page and then negotiate.

**Done means** `/matchday` has no stepper, no jump strip, no form chips and no
next-fixture card; `npm test` covers `seasonLadder` against a season containing a
walkover and against one with unplayed fixtures ahead; `npm run check:layout` is
clean at all six widths with no new `scripts/expected-failures.js` entry; the
`npm run shots` height is written into the budget table below.

---

### Phase 26 — Matchday: the match panel

The match itself: the board scoreline, the gilded man-of-the-match plate, and the
team sheet that replaces the pills.

**Files**

- `src/components/matchday/Scoreboard.jsx`
- `src/components/matchday/MotmCard.jsx` → `MotmPlate.jsx`
- `src/components/matchday/TeamSheet.jsx` — new; delete `SquadPills.jsx`
- delete `src/components/matchday/WorthNoting.jsx`
- `src/components/bits.jsx` — add `BallMark`
- `src/pages/Matchday.jsx`, `src/styles/pages/matchday.css`, `docs/DESIGN.md`

**Do**

1. **Scoreboard** keeps its two mirrored rows. Add a head row above them —
   competition `.block`, `Matchday n · season`, W/D/L chip — and one condensed
   meta line below (`Full time · Sat 14 Mar 2026, 2:00pm · Big Side (H)`). The
   per-row `.sub` squad count comes off; the team sheet's own head says
   "8 named".
2. **MotmPlate**: `--board` ground, gold label, name in `--gold-leaf` at
   `--t-headline`, one line of what they did plus the appearance ordinal. The
   monogram avatar goes. The Golden Boot line goes with it — Phase 14 gave every
   stat its own leader row on Players, and this was the last place repeating one.
3. **TeamSheet**: a ruled ledger on one `grid-template-columns` — name and its
   marks, what the player did this game, appearance ordinal. Scorers carry
   `<BallMark />` after the name *and* keep "1 goal" in its column; the MOTM row
   carries a gold star and the gold wash. Footer line: goals, assists, cards,
   debuts, and any dropout by name. `matchContext` already returns `squad`,
   `scorers`, `motm`, `debutIds`, `dropoutNames` and `seasonAppCount` — no new
   derivation.
4. **`BallMark`** in `bits.jsx`: a 15px inline SVG, `viewBox="0 0 16 16"`, ring
   plus centre pentagon plus five spokes that stop inside the ring, all
   `currentColor` so it inherits `--gold-deep` from the row. Same house as
   `Layout.jsx`'s nav icons. Drawn rather than an emoji because every other mark
   on this site is engraved or gilded and an emoji renders in whatever the phone
   feels like. It does not go in `src/assets/badges/` — that directory is one
   file per badge slug and this is not a badge.
5. **WorthNoting goes.** The appearance ordinals it printed are a column on the
   team sheet now, and the debut and dropout names are on the footer line. This
   removes the page's last duplicate fact.

**Done means** no squad pills and no colour legend; the ball and the star are the
only two marks a name carries; the walkover route (`2025-11-29`, no appearance
rows at all) still renders with no team sheet, and the clean-sheet route
(`2026-02-07`) still renders its debut goal, red card and dropout; `npm test`,
`npm run check:layout` and `npm run build` pass.

---

### Phase 27 — Matchday: head to head, and the report

"How it compares" becomes a head-to-head section, and a long report stops setting
the length of the page.

**Files**

- `src/components/matchday/HeadToHead.jsx` — new; delete `ComparisonCard.jsx`
- `src/components/matchday/MatchReport.jsx`
- `src/lib/league.js` — add `twoRows`
- `src/pages/Matchday.jsx`, `src/styles/pages/matchday.css`
- `tests/league.test.js`, `docs/DESIGN.md`

**Do**

1. `twoRows(leagueRows, teams, season, opponentTeamId)` → `{ us, them }`, either
   possibly `null`. It calls `leagueStandings` and picks two rows out of it — it
   does not re-derive points or goal difference, which that function already
   owns.
2. `HeadToHead.jsx`, heading "Head to head": first every meeting with this
   opponent this season, on `ResultList`'s compact inline variant
   (`matchContext.priorMeetings` plus this match); then the tape — one row per
   figure (points, won, drawn, lost, scored, conceded) with the two values at the
   outer edges and mirrored bars growing outward from a centre label. The leading
   side's figure takes its own colour, the trailing side's takes `--ink-soft`.
   Footnote: games played each, and the `updatedAt` `leagueStandings` returns.
3. **The empty branch is the common one.** A friendly, a cup tie, or a club with
   no row in the division has no tape. Then the meetings list renders alone, with
   the two figures `ComparisonCard` used to carry — this game's scored and
   conceded against the season average before it, already on `matchContext` as
   `avgFor` / `avgAgainst`. Nothing is lost, it just stops being a card.
4. `MatchReport.jsx` clamps to the first ~300 characters at a word boundary, with
   the rest behind one control ("Read the rest" / "Show less"). Split on
   paragraph breaks so the rest opens as paragraphs, not one block. A report
   already inside the limit renders whole and shows no control.

**Done means** no "how it compares" card; a friendly against a club with no
league row renders the meetings and the two figures and does not crash; the
control appears only when there is something behind it; the clamp is unit-tested
(short report, long report, one exactly at the boundary); `check:layout` clean;
Matchday's height recorded both clamped and open.

---

### Phase 28 — Matchday: the desktop rail

The season on the left, the match on the right. The first two-column page on the
site.

**Files** `src/pages/Matchday.jsx`, `src/styles/pages/matchday.css`,
`docs/DESIGN.md` (*Mobile*).

**Do**

1. Above 900px: `grid-template-columns: 344px 1fr` — the ladder in a rail with a
   right-hand hairline and a faint tint, the match beside it. Below 900px it is
   exactly what phases 25–27 built.
2. **Use a media query, not a container query.** The mock uses `@container` only
   because it renders inside a fixed-width frame; the app has no such container
   and `@media (min-width: 900px)` is what `styles/layout.css` already speaks.
3. **One instance of the match panel.** The mock duplicates it and hides one per
   width — fine in a flat, not in the app. Render it once and let the grid or
   `order` place it.
4. The rail's hairline and tint run the full height of the page, not the height
   of the ladder.
5. Nothing to add to the header: `Layout.jsx`'s `.main-nav` already carries the
   five sections above 700px.

**Done means** 1400px shows the whole season in the rail with the match beside
it; 700px and below is unchanged from Phase 27; `check:layout` clean at all six
widths; the 1400px shot shows no void under the rail.

---

### Phase 29 — Season, inside its budget

Season is 3,248px against 2,200. Sixteen played games cost 1,286px on the shared
result row before the league table, the summary or a single fixture is counted,
and that arithmetic does not close by trimming.

**Files** `src/pages/Season.jsx`, `src/components/season/*`,
`src/styles/pages/season.css`, `docs/DESIGN.md`.

**Do**

1. The season's results become a ladder: one ~40px rung per game instead of an
   ~80px result row, which is roughly 640px back with every game still on the
   page.
2. **Reuse `SeasonLadder.jsx` from Phase 25, do not write a second one.** That
   reuse is the test of whether Phase 25 built a component or a page section; if
   it needs more than new props, fix it there and note it.

**Done means** `/season` under 2,200px at 375px with all sixteen games on it, or
a written argument here for why the budget should move; `SeasonLadder` reused,
not copied; `check:layout` clean.

---

### Phase 30 — The cosmetic review: Players and Records

The last two sections of the review Phase 23 started on Home. Screenshot first at
375px and 1400px, list the findings, then one branch per page. Matchday's own
review is superseded by phases 25–28, and Season's length is Phase 29's job.

**Done means** two short phases appended above with real findings, or a line here
saying a page had none.

---

## Page budgets

`DESIGN.md`'s *Page length* table is the authority for the numbers — they are a
design constraint and a component author reads that file. This is the tracking
view. *Now* is `npm run shots` on the `mid-season` fixture at 375px.

| Page | Now | Budget | Owner |
| --- | --- | --- | --- |
| Home | 2,047 | 1,600 | **unowned** — 447 over; Phase 23's badge, label and button cost 165px of it |
| Matchday — latest | 1,812 | 1,900 | 25–28 |
| Matchday — clean sheet (13 named, a report) | 2,328 | 1,900 | 25–28 — **already 428 over before the rebuild starts** |
| Matchday — walkover (no team sheet) | 1,226 | 1,900 | within |
| Season | 3,224 | 2,200 | 29 |
| Season → charts | 1,909 | 2,200 | met (18) |
| Players → Leaderboards | 1,296 | 1,400 | met (14, 24) |
| Records → badges / honours / all-time | 1,667 / 961 / 1,807 | 2,000 | met (16) |
| Player detail | 2,241 | 2,400 | met (21) |
| Opponent detail | 1,259 | 2,000 | met (21) |
| Players → Squad | 1,671 list / 2,138 tiles | no cap — it's a roster | measured, not capped (17, 24) |
| Players → Data centre | 2,584 | no cap — it's the reference table | measured, not capped (22, 24) |

Home is the one page with no phase against it. Add one when someone is willing to
cut a section rather than shave one, because `LeagueTable` and `RecentForm` alone
are most of the page and neither shrinks without breaking a rule.

---

## Decisions

**Open — blocking a phase.**

1. **Matchday's budget** (Phase 25, step 7). The flat is 2,522px against 1,900,
   on an eight-man squad — a thirteen-man one is longer, and that route is
   already 428px over today. Either the ladder opens on eight games with the
   rest behind a control, or the budget moves to ~2,300px because the page now
   carries the archive as well as the match.
**Settled, and worth knowing before you touch a scoreline.**

2. **Score order.** Phase 23 made Home read home-first (`1–4` when we are away), with a badge marking which side is us.
   Every other scoreline on the site reads goals-for–goals-against, ours first.
   That is deliberate — a scoreboard reads by venue, a result row reads by us —
   but if it ever needs to be uniform it is a `DESIGN.md` ruling, not a
   component fix.

---

## Parked

Named so they don't get lost.

- **About us** — needs a photo worth showing.
- **Player photos** — blocked on collecting 30 headshots; initials are fine.
- **Final league positions per season** — the Records season index has a footnote
  waiting for standings entered per season.
- **Head-to-head pages** — Phase 27's tape could grow into the opponent page.
- **New badge types** — attendance streaks, consecutive scoring. Add once Phase
  15's three classes have survived a second season.
- **A figure recipe in the type layer** — the display face at 600 with
  `-0.015em` and tabular figures is written out in twelve rules. One decision in
  `DESIGN.md`'s *Type* section.

---

## Not on the list

Dark mode, a component library, a CSS framework, an animation library,
server-side aggregation, a sixth nav section. See *Deliberately not doing* in
`DESIGN.md`.
