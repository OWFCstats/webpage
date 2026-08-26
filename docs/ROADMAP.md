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
| 27 | Matchday: head to head, and the report | `HeadToHead.jsx` (`lib/league.js`'s `twoRows`) replaces `ComparisonCard.jsx`: every meeting this season on `ResultList`'s inline variant, then a six-row mirrored-bar tape where the opponent has a league row this season, the old two-figure comparison where it doesn't; `MatchReport.jsx` clamps to its first ~300 characters (`lib/format.js`'s `clampReport`) with the rest behind one control. Real new content, not a wash: the default route rose to 2,456px against its 2,300 budget, purely from the tape — see `DESIGN.md` → *Page length* |
| 28 | Matchday: the desktop rail | Above 900px, `.matchday-rail` in `styles/pages/matchday.css` turns the page into a 344px/1fr grid: `SeasonLadder`'s own two wrapping elements go `display: contents`, promoting the head, every rung and the current match's panel to be direct grid items, so the one tree Matchday already builds serves both layouts. The open rung shares a row with the panel and stretches to match it, turning the highlight into a gold band the height of the match beside it. Below 900px is unchanged; the 375px budget is untouched since the rail is a >=900px-only change — see `DESIGN.md` → *Page length* |
| 29 | Season, the ladder | `SeasonLadder` moved to `components/` and reused on Season in place of `ResultsTable` and `UpcomingFixtures` — a ~40px rung against the ~80px row, every game and both fixtures still on the page; 3,224px → 2,490px, 734px back but 290 short of the 2,200 budget — see *Decisions* → *Open* |

**The detail behind any closed phase is in its commit** — `git log --grep="Phase
20"` finds it, and forty-five commits name their phase. That is what makes
condensing this file safe rather than lossy.

Two rulings from that half still bind everywhere: **everything is derived,
nothing is stored twice**, and **a component that gains a second page moves up to
`components/`**.

---

## Now

### Phase 30 — The cosmetic review: Players and Records

The last two sections of the review Phase 23 started on Home. Screenshot first at
375px and 1400px, list the findings, then one branch per page. Matchday's own
review is superseded by phases 25–28, and Season's length was Phase 29's job —
closed to within 290px; the rest is *Decisions* → *Open*.

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
| Matchday — latest | 2,456 | 2,300 | **unowned** — 156 over; head to head's tape, real content the old card didn't carry. Phase 28's rail doesn't move this: the budget is stated at 375px and the rail is a >=900px-only change |
| Matchday — clean sheet (12 named, a report, clamped / open) | 2,746 / 3,150 | 2,300 | **unowned** — 446 over clamped; the clamp bounds it, it doesn't fit it. Same as above, untouched by 28 |
| Matchday — walkover (no team sheet) | 1,533 | 2,300 | within |
| Season | 2,490 | 2,200 | **unowned** — 290 over; Phase 29's `SeasonLadder` reuse took 734px back, see *Decisions* → *Open* |
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

**Open.**

1. Whether Matchday's budget needs to move again, the way it did in Phase 25,
   or whether the head to head tape needs to shrink. Phase 27 shipped it at
   its full designed size — the tape's six rows, not a smaller version — and
   that alone put the default route 156px over 2,300; the clean-sheet route's
   report clamp bounds a long write-up rather than shrinking the page below
   what Phase 26 measured. The numbers and the argument are in `DESIGN.md` →
   *Page length*. Phase 28's rail was the hoped-for third way — a side column
   stops the panel stacking under the ladder at all — but it doesn't reach
   this number: the budget is stated at 375px and the rail only applies above
   900px, so the gap is exactly what Phase 27 left it (see *Settled* below).
   Still open, and still nobody's — a phase that takes it needs to choose
   between the two.

2. Season's remaining 290px. Phase 29 reused `SeasonLadder` in place of the
   shared result row and the separate upcoming-fixtures block, which took the
   page from 3,224px to 2,490px — 734px back, all sixteen played games and
   both fixtures ahead still on it. The 2,200 budget assumed the whole gap
   would close on that lever alone; it doesn't, because what's left is the
   full league table and the aside (season at a glance, the appearances
   leaderboard), and Phase 29's brief was the ladder, not those two. A phase
   that takes this needs to choose between shrinking one of them or moving
   the budget the way Matchday's did — argued before the page is touched
   again, not fitted to it afterwards.

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

2. **The rail doesn't move the 375px budget.** Measured at Phase 28: the
   default and clean-sheet routes are 2,456 / 2,746 / 3,150px at 375px, the
   same three figures Phase 27 left, because the rail is a `min-width: 900px`
   change and the budget is stated at 375px. What the rail does change is a
   reading the table doesn't track — at 1400px the same three routes are
   2,336 / 2,580 / 2,821px, shorter than at 700px, because the panel no
   longer stacks under the whole ladder — but that isn't this gap closing.

3. **Score order.** Phase 23 made Home read home-first (`1–4` when we are away), with a badge marking which side is us.
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
