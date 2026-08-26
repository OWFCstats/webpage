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
| 25 | Matchday: the season ladder | `seasonLadder` + `SeasonLadder.jsx`: the stepper, jump strip, form chips and next-fixture card became one object, every game a rung with its running goal difference; the budget moved to 2,300 |
| 26 | Matchday: the match panel | `MotmPlate.jsx` and `TeamSheet.jsx` replace the monogram card and squad pills; the scoreboard gained a head row (competition, matchday number, W/D/L) and one condensed meta line; `BallMark` and a gold star are the only two marks a name carries; `WorthNoting` deleted, its ordinals now the team sheet's own App column |

**The detail behind any closed phase is in its commit** — `git log --grep="Phase
20"` finds it, and forty-five commits name their phase. That is what makes
condensing this file safe rather than lossy.

Two rulings from that half still bind everywhere: **everything is derived,
nothing is stored twice**, and **a component that gains a second page moves up to
`components/`**.

---

## Now

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
2. **Reuse `SeasonLadder.jsx` from Phase 25, do not write a second one.** It
   takes `rungs`, `season`, `teams`, an optional `currentId` and optional
   `children` (the panel that opens under the current rung); Season passes
   neither of the last two and gets one unbroken ladder. It is in
   `components/matchday/` and moves up to `components/` on that second caller,
   with `styles/components/season-ladder.css` already where it needs to be. If
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
| Matchday — latest | 2,220 | 2,300 | met (25) — 1,812 before the ladder, against the old 1,900 |
| Matchday — clean sheet (12 named, a report) | 2,682 | 2,300 | 27 — 382 over; the report clamp is the big lever |
| Matchday — walkover (no team sheet) | 1,507 | 2,300 | within |
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

**Nothing open.**

**Settled, and worth knowing before you touch a scoreline.**

1. **Matchday's budget moves to 2,300px; the ladder does not collapse**
   (Phase 25, step 7). Decided before the ladder was built. The full argument is
   in `DESIGN.md` → *Page length*, because the budget table is the authority for
   the number; the short version is that 1,900 was set for a page that was one
   match plus a stepper, the page now carries the season's archive as well, and
   1,900 + ~730px of rungs − ~330px of stepper, strip, form and fixture card is
   ~2,300. Opening on eight games with the rest behind a control was rejected: it
   rebuilds the compressed index the ladder replaces, contradicts the approved
   flat, and would break Phase 29, which needs this component to put *every* game
   of a season on the page.

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
