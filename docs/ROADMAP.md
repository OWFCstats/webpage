# Roadmap

Living document. One phase per branch, in order. Each phase says what "done"
means so it can't quietly expand.

Phases 0–8 built the foundation: the CSS layers, the tokens, the surfaces, the
stats modules, the badge system, the charts and the page/component split. That
work holds and none of it is being undone.

Phases 9 onward are different in kind. Everything up to 8 fixed *how the site is
built*; none of it changed *what a page decides to say first*, which is why the
pages still don't work. This half is information design, and it comes out of a
page-by-page review against the real 2025/26 data — 53 players, 14 matches, 169
appearances — plus a set of decisions recorded in `DESIGN.md`.

---

## What phases 0–8 established

| # | Phase | What it left behind |
| --- | --- | --- |
| 0 | Write it down | `CLAUDE.md`, `DESIGN.md`, this file |
| 1 | Split the CSS | `styles/` in layers, verified pixel-identical |
| 2 | Tokens and type | One token set, seven type steps, no hex outside `tokens.css` |
| 3 | Split `.card` | `.sheet` and `.board`, and the rule for which |
| 4 | Split `lib/stats.js` | Six domain modules |
| 5 | Build the plate | Tiered badges, honours board, Player of the Season |
| 6 | Players page | Leaderboard first, squad as a team sheet |
| 7 | Charts | Linear lines, flat fills, direct labels |
| 8 | Page components | Every page reads as a layout, longest 247 lines |

The rulings from those phases that still bind are in `DESIGN.md`. Two are worth
repeating because later phases keep bumping into them: **everything is derived,
nothing is stored twice**, and **a component that gains a second page moves up
to `components/`**.

---

## What the review found

The evidence behind phases 9–21, so no phase has to re-argue its own existence.

**Every page is a stack of equal boxes.** One surface, one width, one gap, one
padding, thirty times. Nothing in the layout says what matters, because `.board`
— the one surface that breaks the rhythm — is rationed to one per page.

**A match result is written as a sentence.** `Old Wellingtonians 1–7 Old
Cheltonians` as running text. It wraps mid-name, never lines up in a column, and
prints our own club's name in all fourteen rows of the season. The most-repeated
object on the site has no structured form.

**The section-heading grammar isn't one.** Across 30 sections: 4 use eyebrow +
title, 15 eyebrow only, 7 title only, 2 neither. Home is the only page that is
internally consistent, and there the eyebrow is usually the title again
(`UPCOMING` over "Next fixture").

**There are 15 blocks of explanatory prose** across 11 files, 5 on Records
alone, including a five-line paragraph on the honours board longer than the five
awards it explains.

**Two tables side-scroll on every phone.** Page-level overflow is clean, but the
earlier checks tested "no table scrolls *outside* a `.table-wrap`" while
`DESIGN.md` says a table that side-scrolls is a bug. Records' season index hides
**319px** at 375px and 374px at 320px — including Position and Top scorer, the
two interesting columns. Player detail's Firsts & bests hides **122px** and
clips text mid-word. "Last 6 played" clips opponent names: "Old Cheltonians"
needs 82px in 74px.

**Pages are 2,000–4,800px tall on a phone.** Records 4,823 · Season 3,530 ·
Player detail 2,941 · Players 2,714 · Home 2,091 · Matchday 1,857.

**The badge ladder excludes most of the squad.** 32 of the 47 players who have
turned up hold nothing at all, and 19 of them played exactly once. The board
prints 24 plates of which 19 say "Nobody yet", and unearned silver is
pixel-identical to unearned gold, so the tier is carried by a word rather than
by the metal.

**Five of six leaderboards end with a hedge** — "…and N more level on X". With
14 games and a rotating squad the boards are mostly ties, so the format is
fighting the data. The Squad view, the cleanest thing on the site, is truncated
at 12 of 47 names with three separate "see more" affordances.

**The site is emptiest when the squad is most curious.** `currentSeason` is
derived as the most recent season with *any* match row, and fixtures count as
rows — so entering a single 2026/27 fixture abandons 2025/26 and every current
season figure drops to zero. Four of five sections on Home become empty states,
including the dark board, which is the loudest object on the page. A completed
season sits in the database and the site hides it, in the month a newcomer is
most likely to be sent the link.

**The palette had drifted onto a generated-design default.** Warm cream ground,
high-contrast serif, terracotta accent, hairline rules. `--tangerine #e07a2f`
had no basis in the club's colours and `--sky-deep #2f6f8f` was a dark blue
where the brand has a pale aqua.

---

## Phase 9 — Let the repo see itself

**Why first.** Every phase from here judges a page, and there is currently no
way to render one: no fixture, no seed, no screenshot harness. Phases 5, 6 and 8
each describe building a throwaway one. That is also how two tables came to
side-scroll on every phone while passing three rounds of "measured, not
eyeballed" checks — each harness was written to a slightly different invariant,
and the one `DESIGN.md` actually states was never the one tested.

**Build.** A committed fixture and a script that renders it.

- `fixtures/` — the 2025/26 import parsed to JSON, plus the states one real
  season doesn't contain: a clean sheet, a walkover, cards, a late dropout, two
  upcoming fixtures, a debutant who scores, a player who has never played. Two
  named datasets: `mid-season` and `pre-season` (results finished, next season's
  fixtures entered, nothing played).
- A dev-only Supabase stub behind an env flag, so `npm run dev:fixture` serves
  the real pages with no credentials.
- `npm run shots` — every route at 320 / 360 / 375 / 414 / 700 / 1400px.
- `npm run check:layout` — the invariants, as assertions rather than prose:
  no element exceeds the viewport; **no `.table-wrap` scrolls internally**; no
  leaf element has `scrollWidth > clientWidth` (that is the clipped-name bug);
  every icon clears 3:1 against the ground it sits on.

**Done means** `npm run check:layout` fails on `main` today, naming the three
known bugs, and every later phase leaves it passing. No `src/` change.

---

## Phase 10 — The current season, and the result row

Two small changes that unblock most of what follows, and three live bugs.

**The current season is the most recent season with a result.** A fixture for
next season stops being a context switch and becomes a card. Pages label what
they are showing (`2025/26 · final`) rather than implying it is live. One
derivation in `lib/matches.js`; every page inherits it.

**A result becomes a row, not a sentence.** One component, one grid:

```
[W]  Old Stoics          4–1   H
[D]  Old Salopians       1–1   A
[L]  Old Worthians       3–5   H
```

Opponent, our score always first, venue as a letter, W/D/L as a chip. It
replaces the running text on Season's results, Home's form list, the club
records and Matchday's comparison — four call sites, one primitive.

**The three bugs.** Player detail's Firsts & bests restructures into rows;
"Last 6 played" stops clipping opponent names (a two-line name beats half a
name, per `DESIGN.md`). Records' season index is the third and it is fixed in
Phase 14, where that table is rebuilt anyway — fixing it now and rebuilding it
later is waste, and Phase 9's check names it until then.

**Done means** `check:layout` passes except the one bug it is told to expect;
the pre-season fixture renders a Home page with no empty states; every scoreline
on the site comes from one component.

---

## Phase 11 — The palette and the display face

Tokens only. No component edits, so the diff is one file and a visual sweep —
the same shape as Phase 2, and for the same reason.

**The brand, aged.** The school's colours are `#f8d118`, `#a6d7ca`, `#f37d02`,
on black. At full strength they are three near-primaries that fight each other,
so each is aged and given exactly one job:

| Token | Value | From | Job |
| --- | --- | --- | --- |
| `--ground` | `#f1f3ef` | the mint, desaturated | the page. Cool, not cream |
| `--board` | `#16281f` | — | racing green. Leather and wealth, and warmer than black |
| `--gold` | `#c9992b` | `#f8d118` | the identity |
| `--gold-leaf` | `#e6c65f` | `#f8d118` | names on the board |
| `--verdigris` | `#8fb3a6` | `#a6d7ca` | the accent, and "this row is us" |
| `--burnt` | `#bf6a22` | `#f37d02` | rationed: competition tags only |

**Deleted:** `--tangerine`, `--tangerine-deep`, `--sky`, `--sky-deep`. The
terracotta was the strongest single tell that the palette was assembled rather
than chosen; the dark blue was never a club colour.

**One face changes.** Fraunces out, **Libre Caslon Display** in. Caslon is the
English printing letterform, which is what a school honours board is actually
painted in; Fraunces is a good serif that is also on a very large number of
sites designed in the last two years. Archivo and Archivo Narrow are untouched.

**Chart series** are reassigned off the new tokens. Plum for appearances goes.

**Done means** no hex outside `tokens.css`; every surface repainted and swept at
six widths; the board is green everywhere it was near-black; `npm run build`
clean; `check:layout`'s contrast assertion passes on both grounds.

---

## Phase 12 — The label device, and cutting the prose

Component-level, no new colours. This is the phase that makes every page phase
after it smaller, because it settles the heading grammar once.

**The block replaces the eyebrow.** The school's own brand device is bold text
on a solid field of colour. One `.block` primitive, in four variants (board,
gold, verdigris, burnt), replaces the tiny uppercase eyebrow. A section head
becomes legible at a glance instead of a 12px grey whisper, and the 15 near-
identical label rules collapse to one.

**One grammar for all 30 sections.** A section has a block *or* a title, never
both saying the same word. `UPCOMING` over "Next fixture" becomes one of them.

**The prose goes.** All 15 explanatory blocks. Where a fact genuinely needs a
note it becomes one short line, not a paragraph. Empty states stay — they are
content, per `CLAUDE.md` — but they say what to do, not why the design is the
way it is.

**Done means** every section head resolves to `.block` or a heading and never
both; `grep` finds no `card-foot` paragraph over 20 words; page heights drop
measurably in `npm run shots` and the numbers are recorded here.

---

## Phase 13 — Sub-navigation

**The mechanism**, decided: real routes, plus a segmented control at the top of
the section. Tapping a bottom tab lands on that section's default sub-page; the
control switches. This extends a pattern the site already runs twice
(Leaderboards/Squad, Overview/Full stats), adds no new nav concept, keeps five
sections, and gives every sub-page a shareable address — which matters, because
WhatsApp is this club's actual distribution channel.

A dropdown on a five-item bottom bar was considered and rejected: a tap that
opens a menu instead of navigating is the thing people hate about mobile nav.

**The map.**

| Section | Sub-pages | Default |
| --- | --- | --- |
| Home | — | — |
| Matchday | — | — |
| Season | Season · Charts | Season |
| Players | Leaderboards · Squad · Data centre | Leaderboards |
| Records | Badges · Honours · All-time | Badges |

**Done means** every sub-page has its own address; the old flat addresses
redirect (`/records` → `/records/badges` and so on); `App.jsx`'s shim list is
extended rather than replaced; the bottom bar still has exactly five entries.

---

## Phase 14 — Records, split three ways

The worst page. 4,823px on a phone, five sections, and it opens with a set of
mismatched cards that are hard to read.

**Badges** (default) — Phase 15's job, stubbed here.

**Honours** — the honours board, which is the one surface the review found
nothing wrong with, moved onto green with its caption cut. Plus the season
index, restructured from a 10-column table into rows: that table currently hides
319px at 375px, and the fix is the `ResultList` pattern `DESIGN.md` already
names, not a narrower font.

**All-time** — the all-time leaderboards (Phase 16's component) and club
records. Club records stop being five differently-sized sheets and become one
ruled list on the Phase 10 result row, so the scores line up in a column and
"Old Wellingtonians 1–7 Old / Cheltonians" stops wrapping mid-name.

Two records currently print the same two matches back to back — longest
unbeaten run and longest winning run are both "2 games" — which reads as a bug.
Where runs coincide, one row says so.

**Done means** no Records sub-page over 2,000px at 375px; `check:layout` clean;
five sections became three pages and nothing was dropped.

---

## Phase 15 — The badge system

The signature, and the biggest phase. Depends on Phase 13's routes.

**Three classes, not one grid of 24.**

*Class 1 — career badges, four metals.* One badge per category showing the metal
held. Bronze is a debut, so all 47 players who have turned up own something —
against 15 of 47 today.

| Badge | Bronze | Silver | Gold | Diamond | Holders now |
| --- | --- | --- | --- | --- | --- |
| Appearances | 1 | 10 | 25 | 50 | 47 / 3 / 0 / 0 |
| Goals | 1 | 5 | 15 | 30 | 18 / 2 / 0 / 0 |
| Assists | 1 | 4 | 12 | 25 | 15 / 1 / 0 / 0 |
| Clean sheets | 1 | 5 | 12 | 25 | 0 / 0 / 0 / 0 |

Clean sheets stays and stays empty. "The club has never kept one" is a live
target that reads as a challenge.

*Class 2 — events, stackable, no tiers.* Man of the Match, hat-trick, brace. A
hat-trick is a thing that happened, not a rung; these carry a small multiplier
(`×2`) and appear inline under a player's name.

*Class 3 — season honours, trophies, one per season.* Player of the Season
(voted), Golden Boot, Playmaker, The Dependable. They do not tier and do not
stack into a bigger version — two Golden Boots is the same trophy twice, shown
as a year list. **The Dependable is most appearances**, not ever-present: nobody
was ever-present in 2025/26 and an award nobody can win is not an incentive.

These four are exactly the honours board's rows, so the board and the badges
cannot drift. **Most MOTM is removed** as a season honour — it usually goes to
the same player as Player of the Season — and survives as the Class 2 star.

**A badge has its own page.** `/records/badges/:key` lists every holder at every
tier and who is closest, so a badge is linkable into the group chat.

**The icons are the club's own artwork**, recoloured by a ramp rather than
hand-tinted: read each drawing's tonal range, map it onto a metal. Two findings
are baked into the pipeline and belong in `DESIGN.md`: the band depends on the
ground (paper metals sit low on the ramp, board metals high, or large light
shapes bleach out — the cup measured 10% of its own footprint above 3:1 before
this), and **bronze belongs on paper while the light metals belong on the
board** (bronze on green measured 0%).

**Blocked on two drawings:** there is no Man of the Match star in the set, and
no brace — the brace can be the club's own ball placed twice, but the star needs
drawing. Phase 15 ships with a placeholder star and a note if they aren't ready.

**Done means** the badge board is 4 cards + 3 stackables + 4 trophies, not 24
plates; every badge has a detail page; a player's own page shows their tier
icons under their name; no icon renders below its floor (20px for trophies, 16px
for the rest); the ladder table above matches `lib/awards.js` exactly.

---

## Phase 16 — Leaderboards

**The format**, decided from the Premier League reference: a grid of cards, one
per stat, each capped at **top 5**, the leader given the dark row and the
display face, initials where a photo would go, and the card heading linking to
the full list.

This keeps every board visible — which is why `DESIGN.md` argued against a
single stat behind a selector — while cutting each to a fifth of its height. A
real rank column handles ties natively, so the "…and N more level on 2" line
that currently ends five of six boards disappears.

**"Where am I" is answered directly.** A footer line — `You're 18th of 47 · 2
apps` — instead of making a player scan six boards of six names for their own.

The same component draws Players → Leaderboards (this season) and Records →
All-time, so the two cannot drift. That is the ownership split settled in the
review: **Players is this season, Records is all time.**

**Done means** one component, two pages; six boards fit under 1,400px at 375px
against 2,714 today; no board ends on a hedge; the bars are gone.

---

## Phase 17 — The squad view

The cleanest thing on the site, spoiled by truncation.

- **All 47 names**, not 12. This is the page people come to to find their own.
- **List or cards**, a toggle. The list is the current team sheet; cards give
  each player a tile with their badge icons, which is the view that makes the
  badges visible without opening a profile.
- **One "see more" affordance**, not three. Search stays; "Full table" and "Show
  all 47" go.

**Done means** no name is behind a tap; the monogram still drops below 360px per
`DESIGN.md`; both views share one row-shape definition.

---

## Phase 18 — Season

The top of this page already works — the league table and the season summary are
a good pair and they stay together.

- **Results** use the Phase 10 row, so a season reads as a column of scores.
- **Charts move to their own sub-page** at full width. They are currently behind
  a toggle at the bottom of a 3,530px phone page, squeezed into a corner, which
  means they effectively don't exist. The Results/Charts toggle is deleted; the
  sub-page nav replaces it.
- **"Most involved"** loses its plum bars along with the rest of the bar boards.

**Done means** the Season page under 2,200px at 375px; the charts get the full
column width; the redundant toggle is gone.

---

## Phase 19 — Home

**Whose page it is**, decided: the squad's, on the first screen.

- **The result leads**, at full size, with the MOTM named on the same board —
  not as a 14px line 700px down the page.
- **The club's name is said once**, in the masthead. The H1 that repeats it goes.
- **The league table stays**, because "where are we" is why people open the
  site. Season leads with something else.
- **The next fixture is a compact row**, not a 280px card carrying eight words
  with a black circle where a crest should be.
- **The pre-season state is a real design**, not four stacked empty states —
  Phase 10 makes that possible and this phase makes it look intentional.

"A stranger should see a real, competitive team" stays true, but it stops being
a first-screen requirement: a stranger who scrolls one screen gets it anyway.

**Done means** Home under 1,600px at 375px against 2,091 today; a result, a
name and a league position above the fold at 375px; both fixture datasets look
deliberate.

---

## Phase 20 — The Matchday scoreboard

Not a rebuild. The scoreboard is the best surface on the site and two things
about it are wrong.

- **Nothing attaches either number to either team.** `2–3` floats between two
  columns that aren't even mirror images: ours carries a badge, a name and "8 in
  the squad", theirs carries a badge, a name, a date and a five-line pitch
  address. The address is logistics in the trophy case — it belongs with the
  fixture, not the result.
- **The squad is the last thing on the page**, under a comparison table. For a
  site whose first job is making people want to turn up, the list of who turned
  up cannot be the footer.

Also: the matchday stepper is 14 unlabelled colour chips plus two dotted
mysteries, and the pill colours in the squad list are never explained.

**Done means** the score reads as a scoreboard at 375px; the squad is above the
comparison; the stepper says what each chip is.

---

## Phase 21 — The data centre

Players' third sub-page. Deliberately last: it serves one user well where
everything else serves the squad, and a half-filterable stats table is more
annoying than none.

Every player, every stat, filterable and sortable — goals, assists,
contributions, cards, and the per-game rates.

**One thing to record.** `appearances` has no `minutes` column, so per-90 is not
computable. Adding one means 11–16 numbers typed per match on a phone in a pub,
which is the largest data-entry burden anyone has proposed for this site, and
burden is what kills volunteer-run stats sites. So the figures are **per
appearance**, labelled per 90, with one footnote saying we don't record minutes
and every appearance counts as 90. That is the club's own assumption, written
down once rather than implied.

**Done means** filters that compose; the table doesn't side-scroll on a phone or
the whole idea is wrong for mobile and it says so; the footnote exists.

---

## Page budgets

Per page, so it's checkable rather than a vibe. Measured at 375px by
`npm run shots`.

| Page | Today | Budget |
| --- | --- | --- |
| Home | 2,091 | 1,600 |
| Matchday | 1,857 | 1,900 |
| Season | 3,530 | 2,200 |
| Players → Leaderboards | 2,714 | 1,400 |
| Players → Squad | 1,254 | no cap — it's a roster |
| Records → any sub-page | 4,823 (one page) | 2,000 |
| Player detail | 2,941 | 2,400 |

Records earns length as a reference document, which is why it splits rather than
shrinks. Home does not.

---

## Parked

Named so they don't get lost, and not built yet.

- **About us** — club story and a team photo. Needs a photo worth showing.
- **Player photos** — real headshots. Blocked on collecting 30 of them; the
  design works without them and the initials placeholder is fine.
- **A dark medallion for badge icons** — the one thing that makes silver, gold
  and diamond sing on a light page, and it makes them read as actual medals.
  Measured and drawn; not needed for the layouts in phases 14–17.
- **Final league positions per season** — the Records season index has a
  Position column that stays blank; needs standings entered per season.
- **Head-to-head pages** — the opponent page exists; a proper record against
  each club could grow from it.
- **New badge types** — attendance streaks, consecutive-scoring runs. Add once
  Phase 15's three classes are proven against a second season.
- **A figure recipe in the type layer** — the display face at 600 weight with
  `-0.015em` and tabular figures is written out in twelve rules. One decision in
  `DESIGN.md`'s *Type* section, not a component question.
- **Re-export two icons as paths** — `appearances` and `the-dependable` are
  embedded bitmaps. The recolour pipeline handles them and the files are small
  now (585KB → 66KB, 134KB → 16KB), but real paths would scale better.

---

## Not on the list

Dark mode, a component library, a CSS framework, an animation library,
server-side aggregation of stats, a sixth nav section. See *Deliberately not
doing* in `DESIGN.md`.
