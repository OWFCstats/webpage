# Roadmap

Living document. One phase per branch, in order. Each phase says what "done"
means so it can't quietly expand.

The order is deliberate: mechanical refactors that can't change behaviour come
first, then the visual foundation, then the feature work that depends on it.
That's what stops another full-page rebuild — by the time we touch the Players
page, the tokens, surfaces and stats modules it needs already exist.

---

## Phase 0 — Write it down ✅

`CLAUDE.md`, `docs/DESIGN.md`, `docs/ROADMAP.md`. No code.

---

## Phase 1 — Split the CSS, change nothing ✅

`src/styles.css` (2,654 lines) became `src/styles/` in the layer structure in
`DESIGN.md`, carrying every value across unchanged.

Verified pixel-identical three ways rather than by eye:

- **Rule inventory.** 1,752 declarations before, 1,752 after, none lost, none
  gained.
- **Cascade.** Splitting a file reorders rules, so all 14,111 pairs that share
  a property and changed relative order were checked. Every one is decided by
  specificity, carries the same value either way, or targets elements that can
  never be the same node. Zero could change a resolved value.
- **Rendering.** A fixture holding every component's real markup, rendered
  under the old and new bundles at 11 breakpoints: 566 elements × every
  computed property × 11 widths = 2,621,146 comparisons, zero differences.

Three dead rules turned up and were left in place with a comment, since this
phase only moves things: `.grid.leaders` (replaced by `.grid.boards`),
`.chart-split` and `.chart-body.auto`. Phases 3 and 7 remove them.

Doing this before the token swap means Phase 2 is a small diff in one file
instead of a 2,600-line rewrite where visual and structural changes are
impossible to tell apart.

---

## Phase 2 — Tokens and type ✅

The palette, the three faces and the seven-step scale, swapped in across all
eighteen stylesheets at once. Manrope is gone; Fraunces, Archivo and Archivo
Narrow are self-hosted through `@fontsource`.

All four done-criteria hold, checked rather than eyeballed:

- **No hex literal outside `tokens.css`**, and none in JS either. Tints are
  `color-mix()` off a token. The chart colours are read out of `:root` by
  `lib/tokens.js`, because Recharts writes them into SVG attributes where
  `var()` is invalid — that also killed the four duplicated stat-colour lists
  in `PlayersHub`, `PlayerDetail`, `Records` and `Season`.
- **No font size below 0.75rem**, and nothing outside the seven steps. Forty
  declarations at twelve distinct sizes between 0.58rem and 0.74rem are gone,
  and the forty-nine distinct font sizes the site used are now seven tokens.
- **One uppercase style.** Twelve label styles became `.label`, plus
  `.label.ruled` where a hairline closed off a heading. Rendered at six widths,
  every uppercase element in the page resolves to that one rule.
- **`npm run build` clean.**

Also verified in a browser rather than by eye: a fixture carrying every
component's real markup, rendered at 320 / 375 / 414 / 700 / 900 / 1400px. No
element overflows the viewport at any width, no text computes below 12px, and
the league table now fits its container at every width including 320 — it
side-scrolled at 320 before.

Two things rode along, because the token set left no alternative: `.card`'s
12px radius and its double shadow. There is no 12px radius and no content
shadow in the token set, so keeping them would have meant inventing values
outside the system for the sake of a phase boundary. Phase 3 keeps the part
that actually needs judgement.

The spacing tokens (`--s1`–`--s7`) are declared and used by the new rules, but
existing padding and margins were left alone — moving forty surfaces onto the
4px scale belongs with Phase 3, where those surfaces get rebuilt anyway.

One thing did not survive contact: the league table still hides P, D, GF and GA
below 480px. Condensed figures brought the full ten columns from a side-scroll
at every phone width down to 332px, but a 375px phone only leaves the table
309px inside the card. The missing 23px is the card's own padding, so it's
Phase 3's, and `DESIGN.md` now says so instead of claiming the type fixed it.

---

## Phase 3 — Surfaces ✅

`.card` is gone. Fifty call sites are `.sheet`, five are `.board`, and the
`.plate` waits for Phase 5, which is what builds the badges it exists for.

All four done-criteria hold, checked in a browser rather than by eye:

- **Every dark section is a deliberate occasion.** Five of them: the
  scoreboard, a player's hero, the Records honours board, the leaderboard leader
  and Home's last result. Four render today — `LeadBoard` is the fifth, built
  and verified but not on a page until Phase 6 puts a leaderboard on Players.
  No page carries more than one, and at 375px a board is 5–29% of its page's
  height — the 29% being Matchday, where the scoreboard *is* the page.
- **Everything else is a sheet**, including the two surfaces that were drawing
  their own paper-and-hairline by hand (`.season-card`, `.stat-cell`). The
  invariant that keeps it that way is in `DESIGN.md` and is greppable: no class
  whose name contains `card` draws a surface any more.
- **The league table shows all ten columns at 375px**, and from 360px up. The
  missing 23px was exactly where Phase 2 said it was — the surface's own
  padding — so below 480px the sheet gives it back and the standings run to the
  hairline. Measured: 341px available against 309px needed at 375, 326 against
  303 at 360. Below 360 the four secondary columns still come out, because the
  shortfall there is the club names and a name can't shrink past its longest
  word.
- **Checked at 375px**, and at 320 / 360 / 414 / 700 / 900 / 1400. Every public
  route and seven admin routes rendered against a fixture dataset: nothing
  overflows the viewport, no table side-scrolls outside a `.table-wrap`, no text
  computes below 12px, and nothing on a board resolves to paper ink or a paper
  ground.

The real win isn't the two class names. Each dark section used to restate the
ground, the ink and the border for itself, so the rule that made a label legible
on one had to name all five sections by hand — and the next board would have
needed a sixth name. `.board` carries the ink for labels, links, `.muted`, tags
and tables, so a new one is correct on arrival.

Three judgement calls worth recording, since they're the kind that get
re-argued:

- **The gold edge is 1px, not the scoreboard's old 3px.** Five boards each
  underlined 3px read as five underlines. The masthead keeps its 3px: it's the
  frame, not an occasion.
- **A board used as a band inside a sheet squares its corners** —
  `.lead-hero`'s bottom edge is the line between the leader and the chasers, and
  a 4px curve there read as a second box.
- **`.honour` and `.ms` still draw their own boxes.** Phase 5 deletes both.
  Adopting a surface on the way to being demolished is wasted motion.

The spacing scale moved with the surfaces, and stopped where `DESIGN.md` now
says it stops: tokens for anything that positions a block, literals inside a
control or a row, and `layout.css` untouched because moving the page gutter
moves every width measurement in *Mobile* with it.

Dead rules removed: `.grid.leaders`, as Phase 1 scheduled, and `.match-hero`,
which was a dark section nothing rendered. `.scoreline` is also dead and is
marked in place for Phase 8, which rewrites Matchday's components and can say
whether a shared score style is wanted.

Three things the 375px check turned up that weren't on the list, fixed here
because the check is the criterion:

- A division name in the league widget's head pushed the row past a 320px
  viewport, because the note was `nowrap` and sized for a date. It wraps now,
  and below 480px the head stacks so the heading stops wrapping mid-phrase.
- The scoreboard's two sides laid their badge, name, kickoff and pitch address
  out in one flex row on a phone, which squeezed the address into a column of
  single words. Badge beside a stacked block instead.
- A pitch address in the Season page's Upcoming table inherited `white-space:
  nowrap` from `table.data td` and sent the table into a side-scroll.

---

## Phase 4 — Split `lib/stats.js` ✅

1,099 lines → six modules by domain:

- `format.js` — dates, times, rates, pluralisation. No football logic.
- `matches.js` — match derivations: played/result/venue, fixtures and form,
  season summaries, streaks, the Match Centre's `matchContext`.
- `players.js` — career totals, season breakdowns, milestones, the full
  player-page profile.
- `awards.js` — club records, season honours, the club hall of fame.
- `league.js` — `leagueStandings`, the one table that isn't derived from our
  own results.
- `charts.js` — the point series behind the season and career charts.

Every export kept its exact body; only the imports at the top of each
consuming file changed. `isCleanSheet` is the one visibility change, not a
logic one — `players.js` and `awards.js` both need it, so it went from a
private helper in `stats.js` to an export of `matches.js` rather than being
copied twice.

The module boundaries follow the dependency direction, so there's no cycle:
`format.js` and `matches.js` stand alone, `players.js` depends on both,
`awards.js` and `charts.js` depend on `matches.js` and `players.js`,
`league.js` stands alone.

**Done means:** every export lands in the module its subject belongs to,
imports updated, no behaviour change. The "derive everything, store nothing"
principle is untouched. Verified with `npm run build` rather than by eye —
a behaviour change would show up as a broken import or a type error, and
this project doesn't have a stats test suite to run instead.

---

## Phase 5 — Badges and awards ✅ *(the signature)*

The plate is built, and it's the only thing in the site that is one: twenty-four
on the Records badge board, a shelf of them under a player's own hero, nothing
else.

**Schema** — one migration, `migration_2026_08_season_awards.sql`. A
`season_awards` table keyed by `award_key` rather than given a Player of the
Season column, so the next hand-picked award the club invents needs a row and
not a migration. It's the second and last thing on this site an admin types in;
league standings are the other.

**Derived, no schema needed:**

- A **fixed three-rung ladder** per badge, one metal each — not the rolling
  round-number rungs the old milestone bars chased, because a badge has to be
  nameable and "the next multiple of ten" isn't. The thresholds and the
  reasoning are in `DESIGN.md`; the short version is that they're calibrated
  against a fourteen-game season so bronze lands in a first season.
- Three badges no career total can express — hat-tricks, Golden Boots and
  ever-present seasons — counted off the appearance rows in `plateTotals`.
- The season awards now carry the club's names: Golden Boot, Assist King, The
  Dependable, Most MOTM, and Player of the Season leading them.

**Done means** a player opening their own page sees what they've won and what's
within reach in the first screen, and the admin can record Player of the Season
from a phone. Both hold, measured rather than eyeballed:

- **The first screen.** At 375×667 the hero ends at 295px and the shelf runs
  from 357px, three plates across. Owen Gibbons — the most-decorated name in the
  database with five — gets all five plus the first plate he's chasing above the
  fold, with the seventh and eighth cut by it. The view selector moved below the
  shelf to make that true.
- **The admin.** One block per season in a single sheet with one save, a
  type-to-search player picker and an optional note. Clearing a season deletes
  its row, so the board goes back to "not voted yet" rather than keeping a name
  nobody picked.
- **Every route at 320 / 360 / 375 / 414 / 700 / 900 / 1400.** Records, a
  player's overview and full-stats views, a player with no appearances, the
  awards admin and Home, rendered against a fixture built from the real season
  import: nothing overflows the viewport, no text computes below 12px, nothing
  on a board resolves to paper ink or a paper ground, and every plate resolves
  both of its clip paths.
- **The metals are distinct**, checked by forcing all three into their earned
  state rather than waiting for someone to earn a silver: bronze `#a8703f`,
  silver `#9ca3aa`, gold `#c8952a`, each with its own tinted fill.

**Removed, as scheduled:** `MilestoneStrip`, `playerMilestones`,
`nextMilestone`, the rung ladder behind them, `HonourGrid`, `clubHallOfFame`,
the `.ms-*` rules, `components/honours.css` and `.grid.player-split`. The two
surfaces that kept their own bordered boxes through Phase 3 rather than adopting
`.sheet` — `.honour` and `.ms` — are both gone, so nothing paper-coloured in the
site draws a surface by hand any more.

Four judgement calls worth recording, since they're the kind that get
re-argued:

- **The honours board is not a matrix.** `DESIGN.md` said season down the left,
  award across. Five awards plus a season is six columns of names and no
  condensed face fits that at 375px — and hiding columns is ruled out. So the
  season heads its own block, and above 700px it steps into a left gutter, which
  gets the printed board's reading order back. `DESIGN.md` now says so.
- **The mark is always the plain count.** The doc specified `×5` for
  repeat-count badges. One mark format across every plate is worth more than
  per-badge phrasing, and "3 Hat-tricks" reads better than "×3 Hat-tricks"
  anyway. The tier moved onto the plate as a hallmark line instead, which is
  where the "colour alone never carries the tier" rule needed it.
- **A plate is never nested.** A plate is a box, so a plate inside a sheet is
  the box-in-a-box the system rules out. The badge board sits directly on the
  page, which is also what buys three plates across at 375px instead of two.
- **`plate.css` is a component file, not a primitive.** The one deliberate
  exception to a surface being shared vocabulary, and the reason is the
  exception: keeping the plate with the component that owns it is what stops it
  becoming a general-purpose fourth surface.

One operational note, because it bites on deploy and not in review: the
`season_awards` migration has to run in Supabase *before* this lands on `main`.
`DataContext` loads every table in one `Promise.all` and surfaces the first
error, so a missing table is a blank site rather than a missing column. That's
the same shape `league_rows` shipped in, and consistent beats clever here — a
per-table fallback would hide real errors.

---

## Phase 6 — Players: Squad and Leaderboards ✅

Two views behind one selector at the top of the page — Leaderboards and Squad —
and the nav is still five.

**Leaderboards** is the landing view, and every board is on it: goals in the
dark band, then assists, goals + assists, appearances, MOTM and clean sheets.
The row of six chips is gone. That row is what made the old page read as a
database — one board at a time, and you had to guess which one had your name on
it.

The season selector defaults to the current season and carries **All time** as
its first option, which is where the all-time boards came out of hiding: they
were three small boards at the foot of Records, and Records now links across to
`/players?season=all` for the full set. The view and the season are in the
address (`?view=squad`, `?season=…`) with the defaults left out, so `/players`
is still the canonical link and anything longer is one somebody meant to send.

**Squad** is the roster as a team sheet: monogram, name, then Apps, Goals and
Assists in fixed columns under one set of heads. That is the clunky display the
phase was called on — the old rows labelled all three figures on every row, so
"MOTM" made each row a different shape and no column lined up down the page. The
full thirteen-column table is still a tap behind it.

Phase 3 built `LeadBoard` and left it off the site waiting for this phase; it's
the fifth `.board`, and all five now render. One board per page still holds:
Players has the lead band, and the all-time set on Records has no lead because
the honours board is that page's occasion.

**Done means** the landing view is the leaderboard, not a chip row, and the
squad is one clear switch away. Both hold, and the rest was measured rather than
eyeballed:

- **Six fixtures built from the real season import**, because one season of real
  data doesn't contain the cases that break a leaderboard: the season as it
  stands, two seasons, a two-way tie at the top, an eighteen-way tie, one game
  played, and nothing played. Every route at 320 / 360 / 375 / 414 / 700 / 900 /
  1400 — **238 renders**: nothing overflows the viewport, no table side-scrolls
  outside a `.table-wrap`, no text computes below 12px, nothing on a board
  resolves to paper ink or a paper ground, every roster row clears 44px, and
  every figure column shares one right edge.
- **No name is cut.** Measured with a `Range` over the text rather than by
  `scrollWidth`, which an ellipsis hides: at 320–414px, on the boards and on the
  roster with all 47 names shown, nothing clips.
- **The controls driven, not deep-linked**, at 375 and 1400: the view selector,
  the season select (including the param dropping back off when the latest
  season is picked again), the full-table toggle, the search miss, "Show all 47
  players" and a row tap landing on the right player's page.

Ties are the part worth recording, because a fourteen-game season is nearly all
ties and the old boards said nothing about them. `statLeaders` in
`lib/players.js` ranks by competition — 1, 1, 3 — and the rules are in
`DESIGN.md`: up to three level at the top are all named in the band, past three
the band names nobody and they all drop into the list, and a cut that lands
inside a tie says what it left out ("…and 4 more level on 1"). On the season in
the database every board with names on it ends inside a tie — five of the six,
the sixth being clean sheets, which the club has none of yet — so without that
line five boards would have been quietly lying.

Four judgement calls, since these are the kind that get re-argued:

- **The squad is a list, not cards**, which is a change from what this file
  said. A grid of cards at 375px is two columns of ~170px, and the roster's job
  is scanning for a name and comparing a figure — that's a team sheet, which is
  also the object the design direction is built on. `DESIGN.md` now says so.
- **Three figures in a row, not four.** MOTM came out: a fourth column leaves a
  375px phone no room for a name, and MOTM has a board of its own one tap away.
  Apps leads, because turning up is what the site exists to reward.
- **`?stat=` is gone**, and nothing linked to it — the boards it selected are
  all on the page now. An old link lands on the leaderboards, which is what it
  was trying to show.
- **`.grid.boards` moved into `components/bar-board.css`** and
  `pages/players.css` is deleted. Two pages can't share a class that lives in
  one of their page files, and the Players route now has no page stylesheet at
  all — which is what the CSS structure rules ask for.

Two things rode along:

- The lead band took 24px of padding on a phone where every other surface takes
  16px, which `DESIGN.md` already ruled on. It went unnoticed because nothing
  rendered the component until now. It matches now, and the leader's name got
  the 16px.
- `initials()` was defined five times — `Home`, `Matchday`, `PlayerDetail`,
  `PlayersHub` and `AddResult`, one of them without the `toUpperCase()`. It's
  one export in `lib/format.js` now. Same reason `isCleanSheet` became an export
  in Phase 4: a helper copied is a helper that drifts.

---

## Phase 7 — Charts ✅

Applied the chart rules from `DESIGN.md` to both Recharts consumers —
`SeasonCharts.jsx`'s three season plots and `PlayerCareerChart.jsx`'s career
arc: `type="linear"`, no gradient fills, horizontal grid only with no axis
lines, direct series labels instead of legends, tabular figures, token
colours. Every "Show data" table is untouched — it was already the best thing
about the old charts, and nothing here needed it to change.

**Done means:** no `type="monotone"` and no `linearGradient` anywhere in the
codebase. Verified with a grep across `src/`, not by eye — both terms turn up
only in this file and in `DESIGN.md`'s account of the old behaviour.

`components/ChartEndLabel.jsx` is new: one label renderer, shared by every line
and area on the site, rather than the copy that `SeasonCharts.jsx` alone used
to carry. The judgement calls on what it labels — the focused season only on
the multi-season chart, a `dy` stagger where three series converge on one
point — are recorded in `DESIGN.md`'s *Charts* section, next to the rules they
apply.

The two dead rules Phase 1 flagged and left for this phase, `.chart-split` and
`.chart-body.auto`, are gone — neither was reachable from any component.

---

## Phase 8 — Page components ✅

Thirty-eight sections came out of eight page files. Every page is now a layout
— its sections, and the data it feeds them — and the longest is 247 lines
against 548 before.

| Page | Before | After |
| --- | --- | --- |
| `PlayerDetail.jsx` | 548 | 151 |
| `Matchday.jsx` | 425 | 135 |
| `admin/AddResult.jsx` | 423 | 247 |
| `admin/LeagueAdmin.jsx` | 298 | 231 |
| `Season.jsx` | 287 | 96 |
| `Home.jsx` | 257 | 76 |
| `Records.jsx` | 233 | 86 |
| `OpponentDetail.jsx` | 166 | 60 |

**Where they went** is the decision this phase had to make, because
`components/` was described as "shared, reusable" and thirty-eight page sections
are none of those things. It is now shared vocabulary at the top level and one
directory per page below it, named after the page file — `matchday/`,
`player-detail/`, `add-result/`. The line is what renders a component: two or
more pages keeps it at the top, one page puts it in that page's directory.
`CLAUDE.md` carries the rule.

Applying that rule moved five components that were already there:
`PlayerCareerChart`, `SeasonCharts`, `SquadList` and `HonoursBoard` each have
exactly one page, so they went down into it. It moved one the other way:
`WalkoverForm` lived in `pages/admin/` without being a route at all, and two
admin pages open it, so it went up to the top level. Leaving those five where
they were would have made the rule untrue on the day it was written, which is
how the last three rebuilds started.

**`.scoreline` is deleted**, which is the ruling Phase 3 left to this phase.
Two surfaces draw a score figure and they are deliberately different sizes —
the scoreboard's is `--t-display` because on Matchday the score *is* the page,
Home's is `--t-headline` because it's a teaser for it. A shared class would
have been a primitive plus an override at both call sites, which earns nothing.
The duplication that is real is one step below: the display face, 600 weight,
`-0.015em` and tabular figures appear together in twelve rules. That's a type
question, not a component one, and it belongs to whoever next opens
`DESIGN.md`'s *Type* section.

**Two derivations moved out of pages**, because neither was wiring. `matchday`
milestones — the "worth noting" lines — are now built inside the component that
renders them, since the phrasing is copy about one match and nothing else can
reuse it. `dropoutNames` went the other way, into `matchContext` in
`lib/matches.js`, next to the squad it's the complement of. `ordinal()` is an
export of `lib/format.js` now: two of the extracted components want it, and a
helper copied is a helper that drifts — same reason as `isCleanSheet` in Phase 4
and `initials` in Phase 6.

**Done means** every page reads as a layout and none is over ~250 lines. Both
hold, and the behaviour claim was measured rather than eyeballed:

- **158 DOM snapshots, byte-identical.** A fixture built from the real season
  import plus a second season carrying what one real season doesn't contain — a
  clean sheet, a walkover, cards, a late dropout, a report, two upcoming
  fixtures, a debutant who scores, an inactive player and a player who has
  never played. 79 route-states at 375 and 1400px, including the ones only a
  click reaches: all four wizard steps and back again, the league grid's
  add/renumber/move/remove, the match log's filters, the squad's search miss
  and full table, and the season charts with their data tables open. Every
  rendered tree came out identical to the same route rendered from a worktree
  at the previous commit. `useId` values are normalised, because extracting a
  section legitimately renumbers them — every `label[for]` is asserted to
  resolve instead.
- **`npm run build` clean.** The main chunk moved 883.40 → 885.01 kB: the cost
  of thirty-eight component functions and their props. Admin stayed in the admin
  chunks and `SeasonCharts` is byte-identical, so nothing leaked into what a
  public visitor downloads — the lazy boundary now sits inside
  `season/ChartsPanel.jsx`, which owns the `lazy()` call along with the toggle
  that needs it.

Two judgement calls worth recording:

- **A keyed inner component behind a load guard stays in the page.**
  `LineupInner`, `MatchFormInner`, `ReportInner` and `AwardsEditor` are not
  sections; they exist so a `useState` initialiser sees loaded data and resets
  on navigation. That's wiring, and `CLAUDE.md` now says so — otherwise the
  next session extracts four components that only exist to hold a `key`.
- **The two sparklines stayed two sparklines.** Both were called `Sparkline`
  and they are different objects: the player's is a cell-sized shape scaled
  from zero with a dot on the last point, Home's is a min–max normalised trend
  line that draws nothing under three games. Unifying them meant one component
  with four knobs, so each is now a private helper in the file that renders it
  and neither is a shared name any more.

One thing rode along, because the snapshot run reported it: `PlateShelf` spread
a props object containing `key`, which React warns about on every render of the
badge board. The `key` is pulled out of the spread now. No DOM change — the
warning was the whole bug.

---

## Parked

Named so they don't get lost, and not built yet.

- **About us** — club story and a team photo. Needs a photo worth showing.
- **Player photos** — real headshots on player pages. Blocked on the admin work
  of collecting 30 of them, so the design works without them.
- **Final league positions per season** — the Records season index has a
  "Position" column that stays blank; it needs standings entered per season.
- **Head-to-head pages** — the opponent page exists; a proper record against
  each club could grow from it.
- **New badge types** — attendance streaks, consecutive-scoring runs. Add once
  Phase 5's plate system is proven and there's a season of data to earn them
  against.
- **A figure recipe in the type layer** — the display face at 600 weight with
  `-0.015em` and tabular figures is written out in twelve rules, from the
  scoreboard's score to a plate's mark. Phase 8 found it while ruling on
  `.scoreline` and left it alone: it's one decision in `DESIGN.md`'s *Type*
  section, not a component question, and the twelve sizes it appears at are all
  deliberately different.

---

## Not on the list

Dark mode, a component library, a CSS framework, an animation library,
server-side aggregation of stats. See *Deliberately not doing* in `DESIGN.md`.
