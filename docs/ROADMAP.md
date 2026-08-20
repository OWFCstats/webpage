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

## Phase 5 — Badges and awards *(the signature)*

The core incentive mechanic. Depends on Phases 2–4.

**Schema** — one migration:

- `season_awards` table: `season`, `award_key`, `player_id`, `note`,
  `updated_at`. Homes Player of the Season now and any future hand-picked
  award without another migration.

**Derived, no schema needed:**

- Tier thresholds (bronze / silver / gold) on the existing career rungs.
- Repeat-count badges: 5 hat-tricks, 5 MOTMs, and others countable from
  appearance rows.
- Rename the derived season awards to the club's names: Golden Boot, Assist
  King, The Dependable, Most MOTM.

**UI:**

- Build the plate component (clipped corners, metal tiers, earned / not-yet).
- Player page: plates directly under the hero — earned first, then the closest
  two or three unearned.
- Records: the club plate board, and the season honours board as a ruled gilded
  table.
- **Remove** the five milestone progress bars (`MilestoneStrip`,
  `playerMilestones`, `.ms-*` CSS) and the `.honour` grid they sit above. Both
  kept their own bordered boxes through Phase 3 rather than adopting `.sheet`,
  because this phase deletes them.
- Admin: a Player of the Season field per season, alongside the League tab.

**Done means:** a player opening their own page sees what they've won and what's
within reach in the first screen, and the admin can record Player of the Season
from a phone.

---

## Phase 6 — Players: Squad and Leaderboards

Two views behind one nav entry, chosen by a selector at the top of the page.
Nav stays at five.

- **Leaderboards** — the incentive board. Current season by default, all major
  stats, names link through to player pages.
- **Squad** — the roster as cards, opening to full player pages.
- Fix the goals/assists display that reads as clunky today, and bring the
  all-time leaders board out of hiding.

**Done means:** the Players landing view is the leaderboard, not a chip row you
have to click, and the squad roster is one clear switch away.

---

## Phase 7 — Charts

Apply the chart rules from `DESIGN.md`: `type="linear"`, no gradient fills,
horizontal grid only, direct series labels instead of legends, tabular figures,
token colours. Keep every "Show data" table.

**Done means:** no `type="monotone"` and no `linearGradient` anywhere in the
codebase.

---

## Phase 8 — Page components

Extract the presentational sub-components currently defined inside page files —
`PlayerDetail.jsx` (578 lines) has `Hero`, `Honours`, `FormCard`, `RankCard`,
`MatesCard`, `SeasonCards` and `StatGrid` inline; `Matchday.jsx` is 430 lines;
`AddResult.jsx` is 426.

Also decides `.scoreline`, a dead type rule Phase 3 marked in place: this is
the phase that rewrites the components that would use it.

**Done means:** every page file reads as a layout — sections plus data wiring —
and none is over ~250 lines.

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

---

## Not on the list

Dark mode, a component library, a CSS framework, an animation library,
server-side aggregation of stats. See *Deliberately not doing* in `DESIGN.md`.
