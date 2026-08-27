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
| 28 | Matchday: the desktop rail | Above 900px, `.matchday-rail` in `styles/pages/matchday.css` turns the page into a 344px/1fr grid, the season on the left and the match beside it. Built with `display: contents` on `SeasonLadder`'s wrapping elements so one tree served both layouts; **superseded by Phase 31**, which is where the mechanism is now written down. Below 900px is unchanged |
| 29 | Season, the ladder | `SeasonLadder` moved to `components/` and reused on Season in place of `ResultsTable` and `UpcomingFixtures` — a ~40px rung against the ~80px row, every game and both fixtures still on the page; 3,224px → 2,490px, 734px back but 290 short of the 2,200 budget — see *Decisions* → *Open* |
| 31 | Matchday: the rail, corrected | Phase 28's `display: contents` put the match panel in the *open rung's own grid row*, so that rung stretched to the panel's height — a 40px rung became a thousand-pixel gold slab, and the rest of the season was pushed below the whole match instead of continuing under it. The rail and the match are two ordinary boxes again; Matchday reads the 900px breakpoint with `useIsNarrow` and places the panel, because CSS can restyle a box but not reparent one. Above 1200px the match splits into the two columns the approved flat always had — squad left, comparison and report right — which no phase had ever asked for. `MatchReport`'s clamp state moved up to its caller, so a resize across 900px no longer collapses an open report. 375px is untouched (2,456 / 2,746 / 3,150px); 1400px goes 2,336 → 1,183px on the default route. Out of order on purpose: a defect in shipped work, not new scope |
| 32 | The new badge art | Twenty-two drawings in, one per badge per tier, `<img>` rather than inlined; out went the four metal ramps as paint, `recolour`, `toneRange`, `metalRamp`, the paper/board bands, the `on` prop and the medallion. `npm run badges -- <dir>` ingests a drop — rename, `svgo` at one decimal, 1.8 MB → 807 KB with nothing visible changing. The icon-contrast invariant learned to fetch and score an SVG `<img>`, and to score a shaded badge on separation from its ground (2:1 on the mean) rather than on the share of its ink that happens to be dark — the three drawings the medallion existed for score 1.31–1.78, this set's worst is 2.12 |
| 33 | The cosmetic pass the art paid for | Player badges 24 → 34 in the hero and 30–34 → 40 on the shelf, with the shelf's first column fixed at 40px so four labels start in one place; squad tiles 21 + a disc → 26 of drawing; the roster opens on **cards** (`?layout=list` is the address the team sheet carries now); Records' career cards 44 → 52, stackables 34 → 48 (the hat-trick is 1.57 wide and was reading as the smaller badge), trophy strip 40 → 64 in a band that grew to hold it; the badge page's four tiers 28 → 40, which is the one place all four drawings are set side by side. Player detail 2,241 → 2,279px, squad tiles 2,138 → 2,057 |
| 35 | The admin review | The write side, page by page. **Add result stopped inserting blind**: it opens on the fixtures already in the diary and fills one in (`lib/admin.js` → `fixtureFor`), so the same game can't exist twice — it did, and Home showed one match as both the last result and "kick-off in 8 days", losing the fixture's kick-off time and venue with it. The walkover form does the same. **The three admin tables became `AdminList`** — the match list was hiding 484px of its 738px at 375px with all three of its actions off screen; teams hid 289px, the squad 98px. **The admin routes went into `site-map.js`**, which is why none of that had ever been measured. Plus: MOTM is one a game in the lineup editor too (it was a plain checkbox per slot, so eleven could be saved and all eleven counted); the lineup grid captions its inputs and its save follows you down, both of which the league grid already did; Edit on the squad list carries you to the form instead of changing one 4,994px above the tap; login honours the address it bounced you from; Overview leads on what is outstanding — a fixture played but not entered first, then lineups, MOTM, a stale table, an unvoted season — and dropped two cards that restated the nav |
| 34 | The trophy cabinet | `/records/honours` stopped being a list of four label/name rows a season. One green band, a shelf per season, the year top-left and the four trophies across it at 72px with the winner under each and their mark — carrying a `unit`, since "9" under a boot is a shirt number until it says "9 goals" — under the name. 2×2 on a phone, four across from 520px. A season nobody has won yet keeps its four drawings, drained, under *Not awarded*: that is the season the reader is about to play. 961 → 1,155px against a 2,000 budget |

**The detail behind any closed phase is in its commit** — `git log --grep="Phase
20"` finds it, and forty-five commits name their phase. That is what makes
condensing this file safe rather than lossy. Phases 32–34 are the one exception
to one-phase-one-commit: they arrived as a single drop of artwork and landed
together, because 33 and 34 are decisions about drawings that only exist after
32 — sizes, a greyed placeholder, a shelf of trophies. One commit names all
three, so the grep still finds each of them.

Two rulings from that half still bind everywhere: **everything is derived,
nothing is stored twice**, and **a component that gains a second page moves up to
`components/`**.

---

## Now

### Phase 36 — Losing a form on a phone

Nothing on the write side warns before it drops what you typed. The wizard holds
four steps in memory and writes nothing until the last one, so a stray tap on the
bottom bar loses the lot; the lineup editor, the league grid and the report
editor are the same. `beforeunload` covers a reload and a closed tab and not the
tap that actually does it — in-app navigation needs `useBlocker`, which
React Router only gives a data router, and this app is on `<HashRouter>`. So
this is a routing change first and a dialogue second, which is why Phase 35
left it rather than half-doing it.

**Done means** leaving a half-filled form asks first, at 375px, on every write
page — or a written argument here for why the wizard should save a draft
instead.

### Phase 30 — The cosmetic review: Players and Records

Still open, and now partly answered: Phase 33 is the badge half of the Players
and Records findings. What Phase 30 still owns is everything on those two pages
that isn't a badge. Screenshot at 375px and 1400px, list the findings, one branch
per page.

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
| Matchday — latest | 2,456 | 2,300 | **unowned** — 156 over; head to head's tape, real content the old card didn't carry. The rail doesn't move this: the budget is stated at 375px and the rail is a >=900px-only change |
| Matchday — clean sheet (12 named, a report, clamped / open) | 2,746 / 3,150 | 2,300 | **unowned** — 446 over clamped; the clamp bounds it, it doesn't fit it. Same as above, untouched by 28 or 31 |
| Matchday — walkover (no team sheet) | 1,533 | 2,300 | within |
| Season | 2,490 | 2,200 | **unowned** — 290 over; Phase 29's `SeasonLadder` reuse took 734px back, see *Decisions* → *Open* |
| Season → charts | 1,909 | 2,200 | met (18) |
| Players → Leaderboards | 1,296 | 1,400 | met (14, 24) |
| Records → badges / honours / all-time | 1,729 / 1,155 / 1,807 | 2,000 | met (16); badges +62 and honours +194 for the bigger trophies (32–34) |
| Player detail | 2,279 | 2,400 | met (21); +38 for the 40px shelf (33) |
| Opponent detail | 1,259 | 2,000 | met (21) |
| Players → Squad | 2,057 cards (default) / 1,671 list | no cap — it's a roster | measured, not capped (17, 24, 33); the tiles lost 81px to the medallion coming off, despite the drawings growing |
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
   *Page length*. The rail was the hoped-for third way — a side column
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
  15's three classes have survived a second season. Note the cost changed with
  Phase 32: a new career badge is four drawings, not one recolour.
- **Own goals against us, in the wizard** — `MatchForm` takes both columns; the
  four-step flow only takes `own_goals_for`, so a player putting one into his own
  net has to be recorded through the full editor. Rare enough to leave, common
  enough to name.
- **The awards page, once there are ten seasons** — it renders every season on
  record as its own block with its own picker, and saves all of them at once.
  Fine at two. Not at ten.
- **A figure recipe in the type layer** — the display face at 600 with
  `-0.015em` and tabular figures is written out in twelve rules. One decision in
  `DESIGN.md`'s *Type* section.

---

## Not on the list

Dark mode, a component library, a CSS framework, an animation library,
server-side aggregation, a sixth nav section. See *Deliberately not doing* in
`DESIGN.md`.
