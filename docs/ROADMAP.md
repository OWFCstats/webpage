# Roadmap

Living document. One phase per branch, in order. Each phase says what "done"
means so it can't quietly expand.

Phases 0–9 built the foundation: the CSS layers, the tokens, the surfaces, the
stats modules, the badge system, the charts, the page/component split, and the
fixture and checks that let the rest of it be measured. That work holds and none
of it is being undone.

Phases 9 onward are different in kind. Everything up to 8 fixed *how the site is
built*; none of it changed *what a page decides to say first*, which is why the
pages still don't work. This half is information design, and it comes out of a
page-by-page review against the real 2025/26 data — 53 players, 14 matches, 169
appearances — plus a set of decisions recorded in `DESIGN.md`.

**The badge artwork has landed** — ten drawings in `src/assets/badges/`, ahead of
Phase 10. It was the only dependency in this plan that code couldn't unblock, and
with it here phases 14 → 15 → 16 run in that order. **The crest has landed
too** — `public/crest.png`, uploaded by the club mid-Phase 10 — so all eleven
files this plan named are now in the repository. See *The artwork* below for
what arrived and what it settles.

---

## What phases 0–9 established

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
| 9 | Let the repo see itself | A committed fixture, `npm run shots`, `npm run check:layout`, unit tests, and a CI job holding all three |

The rulings from those phases that still bind are in `DESIGN.md`. Two are worth
repeating because later phases keep bumping into them: **everything is derived,
nothing is stored twice**, and **a component that gains a second page moves up
to `components/`**.

---

## What the review found

The evidence behind phases 9–22, so no phase has to re-argue its own existence.

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

**The site is emptiest when the squad is most curious.** The current season is
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

**Three pages had no owner.** Player detail carries a height budget and no phase
that meets it; the opponent page appears in no phase at all; and Season's "All
seasons" option answers the same question as Records → All-time, which is the
duplication the Players/Records split exists to kill. Phases 18 and 21 take them.

---

## The artwork

Phase 15 is the signature, and it was the one phase blocked on something outside
the repo. **It is unblocked: ten drawings landed in `src/assets/badges/` before
Phase 10**, one file per badge, named for the slug the badge page will use.

| File | Class | Tiers |
| --- | --- | --- |
| `appearances.svg` | career badge — shirt | four metals |
| `goals.svg` | career badge — football | four metals |
| `assists.svg` | career badge — target and arrow | four metals |
| `clean-sheets.svg` | career badge — keeper's glove | four metals |
| `player-of-the-season.svg` | season trophy — cup | gold only |
| `golden-boot.svg` | season trophy — boot on a plinth | gold only |
| `playmaker.svg` | season trophy — figure striking a ball | gold only |
| `the-dependable.svg` | season trophy — cap | gold only |
| `motm.svg` | event — star | gold only |
| `hat-trick.svg` | event — three footballs | gold only |

**Only the four career badges tier.** A trophy is one trophy: winning the Golden
Boot twice is the same gold boot twice, and there is no bronze Player of the
Season. The same holds for the two events — a hat-trick is a hat-trick. So the
metal ramps are read by four drawings and the other six are gold and stay gold.
An earlier draft of this section, and the artwork brief the icons arrived with,
both showed all ten in four metals; that was wrong in both.

Four of those six arrive gold in the file. **`playmaker.svg` and `hat-trick.svg`
do not** — the figure is a black silhouette and the footballs are black and
white — so those two are recoloured once, to gold, and never again. That is the
only recolouring outside Class 1.

**The brace is gone**, from the badge system and from the artwork. It never had
a drawing and it no longer needs one.

**Still eleven drawings, and a different eleven.** The list this section carried
before named a brace and forgot the hat-trick, so the count came out right by
cancelling two errors. The eleventh was `public/crest.png`, the one file this
plan couldn't unblock by writing code — **it arrived mid-Phase 10**, uploaded
by the club straight to this branch, and the masthead (`components/Layout.jsx`)
already renders it in place of the `OW` monogram fallback. Nothing was owed to
it in code: the `<img>` was always there, `onError` was always the fallback
path, and the file just had to exist. Phase 19's fixture row still owes it a
proper thumbnail rather than the empty circle it was designed around — see
Phase 19 below.

### What the drawings measure

The contrast figures `DESIGN.md` quoted were taken in a session whose files were
never committed. These are taken against the committed ones: each drawing
rendered at 256px, composited on the ground, and scored as **the share of its own
ink clearing 3:1**. The grounds are Phase 11's — `--paper #f1f3ef` and `--board
#16281f` — because the palette changes underneath this phase; against today's
values nothing moves by more than four points.

| Drawing | on paper | on board | tonal span |
| --- | --- | --- | --- |
| appearances | 11% | 90% | 0.00–0.60 |
| assists | 100% | **0%** | 0.00–0.03 |
| clean-sheets | 64% | 73% | 0.00–0.56 |
| goals | 100% | **0%** | 0.03–0.03 |
| golden-boot | 44% | 57% | 0.00–0.77 |
| hat-trick | 38% | 63% | 0.03–1.00 |
| motm | 21% | 100% | 0.18–0.84 |
| player-of-the-season | 11% | 90% | 0.10–0.77 |
| playmaker | 100% | **0%** | 0.00–0.00 |
| the-dependable | **0%** | 100% | 0.52–0.60 |

Three rulings come out of that table:

- **The ground rule survives, and now it has the club's own numbers behind it.**
  The set splits three ways. The near-black drawings — assists, goals, playmaker
  — are perfect on paper and score **0%** on green. The gold ones invert it: the
  cap scores 0% on paper and 100% on the board, the cup and the shirt 11% against
  90%. Only the four that carry both a gold and a dark mass — the glove, the
  boot, the hat-trick footballs — are middling on each and good on neither.
  Career badges on the ground, season trophies on a board, which is where the
  pages put them.
- **A ramp cannot recolour a silhouette.** Assists, goals and playmaker have a
  tonal span under 0.04: there is no range in them to map onto a metal. The
  recolour pipeline reads a drawing's own tones, so for those three it has
  nothing to read and the metal has to be a flat fill. Only appearances and
  clean-sheets carry enough span for a mapped ramp. This is the same failure
  `DESIGN.md` records as "do not normalise an icon to the full ramp", caught this
  time before it shipped rather than after.
- **The medallion is no longer parked.** A gold cup on a light page is 11%
  whatever the ramp does, because a cup is mostly highlight — that is not a band
  that can be tuned, it is the drawing. The dark medallion behind a light metal is
  the fix, it is in the brief the artwork arrived with, and it moves into Phase 15.

### What Phase 15 inherits, and what it has to fix

- **`motm.svg` is 471 KB of embedded bitmap** — a 1241×1179 raster behind a
  luminance mask — against 3–22 KB for the nine that are paths. It is the only
  drawing in the set that is not vector, and it carries 1.5 million pixels for a
  star that renders into about 2,300 of them at its 16px floor on a retina phone.
  It also carries a gradient, so `check:layout` reports it unmeasurable rather
  than measuring it. Redraw it as paths, or down-sample the raster; do not ship
  471 KB to a phone for a star.
- **`the-dependable.svg` has a stray path.** A near-white hairline
  (`fill="#f6ffff"`) floats in empty space above and right of the cap, with
  nothing joining it to the drawing. It reads as a speck of dirt on the board.
  The artwork is committed exactly as the club supplied it, so this is recorded
  rather than quietly edited — but it wants deleting before the icons ship.
- **The check measures the wrong ink on a multi-fill drawing.** `collect.js`
  reads `fill` off the root `<svg>`, which is right for the nav icons and the
  sparklines it was built for — they are one colour, set from CSS — and wrong for
  a drawing whose colour lives on up to thirty-six child paths. On these files it reads
  the initial value, black, and would pass a gold cup on green while failing it
  on paper. Phase 15 extends the invariant to composite the rendered footprint,
  which is what the table above already does.

The recolour pipeline and the ground rule described in `DESIGN.md` under *The
icons* survive intact. The numbers under them are now measured against files that
exist.

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
- A dev-only Supabase stub, **wired by a `resolve.alias` in `vite.config.js`
  rather than a flag read inside `src/`**. `lib/supabase.js` exports `null`
  when unconfigured and `DataContext` turns that into an error, so an env flag
  would mean editing both; an alias swaps the whole module for a fixture one and
  leaves `src/` untouched. `npm run dev:fixture` then serves the real pages with
  no credentials.
- `npm run shots` — every route at 320 / 360 / 375 / 414 / 700 / 1400px.
- `npm run check:layout` — the invariants, as assertions rather than prose:
  no element exceeds the viewport; **no `.table-wrap` scrolls internally**; no
  leaf element has `scrollWidth > clientWidth` (that is the clipped-name bug);
  every icon clears 3:1 against the ground it sits on.
- **An expected-failure list**, in the check itself. Records' season index stays
  knowingly red until Phase 16 rebuilds that table, and phases 10–15 have to run
  green against a check that knows it. A failure the runner can't distinguish
  from a regression is a check that gets ignored.
- **A CI job.** `.github/workflows` builds on push to `main` and nothing else,
  so nothing runs `check:layout` unless a human remembers to. Add it as a pull
  request check. This is the line that keeps the rest of the plan honest — three
  rounds of measurement drifted precisely because no job held them.

Optional, and cheap enough to argue for: a handful of unit tests over
`lib/matches.js` and `lib/awards.js`. Phase 10 changes a derivation every page
reads and Phase 15 rewrites the badge ladder; a screenshot will not catch an
off-by-one in either.

**Done means** `npm run check:layout` fails on `main` today, naming the three
known bugs, and every later phase leaves it passing; the check runs on every
pull request. No `src/` change.

### Built — what landed, and what it found

All of the above, plus the unit tests. No `src/` change: `fixtures/`, `scripts/`
and `tests/` are new directories and the only edit inside the app's own tree is
the `resolve.alias` in `vite.config.js`, which is only added when `FIXTURE` is
set. `.github/workflows/check.yml` runs the tests, the layout invariants and a
production build on every pull request; the build job greps `dist/` for a club
we have never played, so the fixture can't reach a deploy.

The harness reproduces the review's own numbers, which is the evidence that it
measures the site rather than a fixture-shaped approximation of it: Records'
season index hides **319px at 375px and 374px at 320px**, Firsts & bests hides
**122px at 375px**, "Old Cheltonians" needs **82px in 74px**, Matchday is
**1,857px** and the squad roster **1,254px** — the same figures the page-by-page
review reported by hand.

**It found two bugs the review didn't**, both at widths nobody had measured, and
neither is fixed on the way past — each is on the expected-failure list against
the phase that owns that page:

| Found | Owner |
| --- | --- |
| Season's upcoming-fixtures table hides 4–7px at 320px, and fits from 360px up | Phase 18 |
| The opponent page's home/away split hides 36px at 320px, and fits from 360px up | Phase 21 |

**And it put a number on the pre-season emptiness.** On the `pre-season`
dataset, Home is **1,430px** — inside its 1,600px budget for the first time,
because four of five sections have nothing to say. Players → Leaderboards falls
to an empty 900px, Season to 1,977px, and Records *grows* to 5,396px on the
strength of one blank 2026/27 row. A page meeting its budget by having no
content is not a page meeting its budget, and `shots/pre-season/375/home.png` is
now the thing Phase 10 has to answer to.

**The check reproduces across machines, in identity but not to the pixel.** CI
names the same six failures and the same four known ones, on the same routes and
the same elements — but the measurements move by 2–4px, because font metrics
differ between platforms ("Old Cheltonians" needs 80px on CI and 82px locally,
in the same 74px). That is why the expected-failure list matches on invariant,
route and element rather than on a number: an entry keyed to a pixel count would
go stale on a font update. It is also why the Season finding is the one to watch —
a 4px overflow is close enough to the noise floor that a font change could close
it without anyone fixing the table, and the entry says so.

Three things are worth knowing before the next phase:

- **The check is red on `main` until Phase 10.** The six failures are the three
  bugs Phase 10 owns, counted per route and per clipped name. Everything else is
  on `scripts/expected-failures.js` with a phase against it, and an entry that
  stops failing fails the run — so the phase that fixes one deletes it in the
  same commit.
- **Height budgets are reported, not asserted.** Every page but Matchday is over
  today and the phase that closes each gap is named below; a check that ran red
  for eleven phases would stop being read. `npm run shots` prints the full table.
- **Icon contrast has nothing to bite on yet.** 668 icons measured per run, all
  of them the nav and the sparklines, all passing. A bitmap is reported as
  unmeasurable rather than as a pass. The badge artwork has since landed as
  files, but nothing renders it yet and the invariant could not read it if it
  did — it takes the ink off the root `<svg>`, which is one colour for a nav icon
  and meaningless for a ten-fill drawing. Phase 15 extends it; see *The artwork*.

---

## Phase 10 — The current season, and the result row

Two small changes that unblock most of what follows, and three live bugs.

**The current season is the most recent season with a result.** A fixture for
next season stops being a context switch and becomes a card. Pages label what
they are showing (`2025/26 · final`) rather than implying it is live.

There is no `currentSeason` helper today — four places roll their own
`seasonsOf(matches)[0]`: `pages/Home.jsx`, `pages/Matchday.jsx`,
`lib/players.js` and `components/season/SeasonCharts.jsx`. So this adds the
derivation to `lib/matches.js` and moves those four onto it. `seasonsOf` itself
stays row-based, because a season picker should still list a season somebody has
entered fixtures for.

**A result becomes a row, not a sentence.** One component, one grid:

```
[W]  Old Stoics          4–1   H
[D]  Old Salopians       1–1   A
[L]  Old Worthians       3–5   H
```

Opponent, our score always first, venue as a letter, W/D/L as a chip.

`components/ResultList.jsx` exists and **is the bug** — it renders
`{homeTeam} {homeGoals}–{awayGoals} {awayTeam}`, which is the sentence the
review found. This phase rebuilds its internals; it does not reuse them. Where
`DESIGN.md` calls `ResultList` "the pattern", it means the row this phase
builds, not the component as it stands.

**Six call sites, not four.** The two extra are both tables, which makes the
phase cheaper overall rather than dearer — each one retires a table instead of
restyling it:

| Call site | Today |
| --- | --- |
| `season/ResultsTable.jsx` | `ResultList`, as a sentence |
| `records/ClubRecords.jsx` | `ResultList`, as a sentence |
| `home/RecentForm.jsx` | inline scoreline in a form list |
| `matchday/ComparisonCard.jsx` | inline scoreline in a table |
| `opponent-detail/MeetingsTable.jsx` | a table that can side-scroll |
| `player-detail/MatchLog.jsx` | a table that can side-scroll |

`player-detail/FirstsTable.jsx` renders `won 4–1` as prose and moves onto the
row too. `home/LastResult.jsx` and `matchday/Scoreboard.jsx` are scoreboards,
not rows, and keep their own treatment.

`season/ResultsTable.jsx` also loses its `narrow` prop and its `useIsNarrow`
branch: one row shape reads at every width, which is the whole point of it.

**The three bugs.** Player detail's Firsts & bests restructures into rows;
"Last 6 played" stops clipping opponent names (a two-line name beats half a
name, per `DESIGN.md`). Records' season index is the third and it is fixed in
Phase 16, where that table is rebuilt anyway — fixing it now and rebuilding it
later is waste, and Phase 9's expected-failure list names it until then.

**Done means** `check:layout` passes against its expected-failure list; the
pre-season fixture renders a Home page with no empty states; every scoreline row
on the site comes from one component; nothing computes its own current season.

### Built — what landed, and what it found

All of the above. `lib/matches.js` gained `currentSeasonOf`, the four call
sites moved onto it, and `ResultList.jsx` was rebuilt rather than reused — it
no longer needs `matchHomeAway` at all, because "our score first" is just
`goals_for`–`goals_against`; the sentence bug was in choosing to print a home
team and an away team, not in the arithmetic. It grew three props beyond the
row itself: `showOpponent` for a card that has already named the opponent,
`showMeta` for a date and competition line, and `inline` for a handful of
scorelines sitting inside another card's own row.

**`inline` is the one addition this plan didn't foresee, and it exists to
protect Phase 20's arithmetic.** `matchday/ComparisonCard.jsx`'s "earlier
against" list is three prior meetings inside a `dl.compare` value — the full
44px row (correct, and now a real touch target where the old inline links
never were one) cost Matchday 63px, which put the one page already inside its
budget over it, on the exact route Phase 20's room-to-add sums against. The
fix keeps the shared chip/score/venue markup without the row's height, so
Matchday measures 1,857px unchanged. Phase 20 still opens this file; it
inherits a card that already reads as one grammar rather than a bespoke one.

**Firsts & bests didn't move onto the row — it moved onto `dl.compare`.**
Debut / first goal / best game / best season are label-and-sentence pairs, not
scorelines, and the row's grid has no opponent-shaped hole for a sentence to
sit in. `dl.compare` already stacks a `dt` over a `dd` at any width with a
hairline between pairs — the exact shape a table forces into columns — so
this reused it rather than inventing a fourth pattern for one card.

**The crest arrived.** Partway through this phase the club uploaded the real
`public/crest.png` straight to this branch — three commits, a false start
(`public/c`, deleted), then the file. Nothing in `src/` needed to change: the
`<img>` and its `onError` fallback were always there, waiting for the file to
exist. What did need attention is that every route now renders a bitmap the
layout check had never seen render anywhere, and a bitmap's ink can't be read
for contrast — the same limitation Phase 15 already knows `motm.svg` carries.
That's on `scripts/expected-failures.js` now, owned by this phase since no
other phase claims it; `ROADMAP.md` and `DESIGN.md`'s "did not arrive" lines
are corrected in this commit rather than left describing a masthead that no
longer matches the site.

**Every measured claim in this phase's own text holds.** `currentSeasonOf`
returns `2025/26` on the pre-season fixture, matching `latestResult`, not the
`2026/27` `seasonsOf` returns; Home on that fixture renders zero `.empty`
states and carries the label `Season 2025/26 · final`; Matchday's default
route is unchanged at 1,857px. `check:layout` passes — 17 known failures
against the list (the three inherited from Phase 9, minus the two this phase
closes, plus the crest) — and all 50 unit tests pass, including a new one
that exercises `currentSeasonOf` directly rather than only the primitives
underneath it.

Two things Phase 10 leaves for later, on purpose: several pages measure taller
than they did — Home +45px, Player detail +143px — because a 44px touch
target and a second meta line cost more than the table cells they replaced.
Every page but Matchday was already over its budget before this phase; the
arithmetic belongs to the phase that owns each page (14, 16, 18, 19, 21), not
to this one, and `check:layout` reports the gap without failing on it for
exactly that reason.

---

## Phase 11 — The palette and the display face

The token layer, plus the handful of call sites that name a token being deleted.
The same shape as Phase 2, and for the same reason.

**The brand, aged.** The school's colours are `#f8d118`, `#a6d7ca`, `#f37d02`,
on black. At full strength they are three near-primaries that fight each other,
so each is aged and given exactly one job:

| Token | Value | From | Job |
| --- | --- | --- | --- |
| `--paper` | `#f1f3ef` | the mint, desaturated | the page. Cool, not cream |
| `--board` | `#16281f` | — | racing green. Leather and wealth, and warmer than black |
| `--gold` | `#c9992b` | `#f8d118` | the identity |
| `--gold-leaf` | `#e6c65f` | `#f8d118` | names on the board |
| `--verdigris` | `#8fb3a6` | `#a6d7ca` | the accent, and "this row is us" |
| `--burnt` | `#bf6a22` | `#f37d02` | rationed: competition tags only |

**`--paper` keeps its name.** An earlier draft renamed it `--ground`, which is
19 references across 10 files including two JSX components, for nothing a user
can see — and `DESIGN.md` describes the surface vocabulary as paper throughout,
so the rename would have fought the doc as well as the code. The value changes;
the name is the contract and it stays.

**Deleted:** `--tangerine`, `--tangerine-deep`, `--sky`, `--sky-deep`. The
terracotta was the strongest single tell that the palette was assembled rather
than chosen; the dark blue was never a club colour.

Deleting them is not free, and this is the part the phase has to budget for —
five files name one of the four:

- `primitives.css` — the base `.tag`, its `.board .tag` variant, and `.tag.orange`
- `pages/home.css` — a chip, and the goals-against bar fill
- `pages/matchday.css` — the card mark in a squad pill
- `admin.css` — `.admin-bar`
- (`tokens.css` itself)

Most of them become verdigris, and `.tag.orange` is the competition tag, which
is the one job burnt is kept for — so the one-job rule assigns all five without
a judgement call. It is small, but it means this phase is five CSS files, a
`package.json` swap and a visual sweep, not one file.

**The metal ramps land here.** `tokens.css` carries three flat values —
`--bronze`, `--silver`, `--gold-tier` — consumed by `plate.css`. `DESIGN.md`
specifies four four-stop ramps (`--bronze-1..4` and so on) and no phase owned
them, so they arrive with the rest of the token layer even though only Phase 15
consumes them. `plate.css` moves onto stop 2 of each ramp so the live plates
keep working until the icons replace them.

**Chart series** are reassigned off the new tokens: `--series-4` becomes green
and `--series-5` becomes plum, which is a swap of two values in `tokens.css`.
No JS change — `lib/tokens.js` maps appearances to `--series-4` by name, so the
club's most-looked-at stat stops wearing a colour with no basis in anything by
the token underneath it changing.

**One face changes.** Fraunces out, **Libre Caslon Display** in. Caslon is the
English printing letterform, which is what a school honours board is actually
painted in; Fraunces is a good serif that is also on a very large number of
sites designed in the last two years. Archivo and Archivo Narrow are untouched.
`package.json` swaps `@fontsource-variable/fraunces` for the Caslon package and
`main.jsx` swaps the import.

**Done means** no hex outside `tokens.css`; no reference to a deleted token
anywhere; every surface repainted and swept at six widths; the board is green
everywhere it was near-black; `npm run build` clean; `check:layout`'s contrast
assertion passes on both grounds.

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

**The prose goes.** All 15 explanatory blocks — they are the `card-foot` and
`page-intro` paragraphs across 11 files, including the two on the opponent page
and Player detail, which no other phase opens. Where a fact genuinely needs a
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
control switches. This extends a pattern the site already runs — `.seg` renders
on Players, Player detail and the season charts panel — adds no new nav concept,
keeps five sections, and gives every sub-page a shareable address, which matters
because WhatsApp is this club's actual distribution channel.

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

**The shims cover query strings, not just paths.** Today's views are query
params — `/players?view=squad` — and `pages/Records.jsx` links to
`/players?season=all` itself, so those addresses are already in the group chat.
`/players?view=squad` has to land on `/players/squad`, and a `?season=` on a
Players address has to survive or resolve, not be dropped on the floor.

**Done means** every sub-page has its own address; the old flat addresses and
the old query-param views both redirect; `App.jsx`'s shim list is extended
rather than replaced; the bottom bar still has exactly five entries.

---

## Phase 14 — Leaderboards

Moved ahead of Records, because Records renders this component and cannot be
built or measured before it exists.

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

**Six boards on both pages.** `LEADERBOARD_STATS` in
`components/LeaderBoards.jsx` is already one shared list of six — goals,
assists, goals + assists, appearances, MOTM, clean sheets — and both pages run
the whole list. Records shows three today; that was a workaround for the page
being 4,823px long, and the split fixes the cause. See Phase 16 for the height
arithmetic this commits it to.

**Players loses its "All time" season option.** `pages/PlayersHub.jsx` offers
one, and with Records → All-time built on the same component it is the same
board reached two ways, which is the exact duplication the Players/Records split
exists to remove. **Players is this season; Records is all time.**

**Done means** one component, two pages; six boards fit under 1,400px at 375px
against 2,714 today; no board ends on a hedge; the bars are gone; Players has no
all-time scope.

---

## Phase 15 — The badge system

The signature, and the biggest phase. Depends on Phase 13's routes and on the
artwork, which is in `src/assets/badges/` — read *The artwork* above before
starting, because it carries the measurements this phase is held to.

**Three classes, not one grid of 24.**

*Class 1 — career badges, four metals.* One badge per category showing the metal
held. Bronze is a debut, so all 47 players who have turned up own something —
against 15 of 47 today. **These four are the only badges that tier.**

| Badge | Bronze | Silver | Gold | Diamond | Holders now |
| --- | --- | --- | --- | --- | --- |
| Appearances | 1 | 10 | 25 | 50 | 47 / 3 / 0 / 0 |
| Goals | 1 | 5 | 15 | 30 | 18 / 2 / 0 / 0 |
| Assists | 1 | 4 | 12 | 25 | 15 / 1 / 0 / 0 |
| Clean sheets | 1 | 5 | 12 | 25 | 0 / 0 / 0 / 0 |

Clean sheets stays and stays empty. "The club has never kept one" is a live
target that reads as a challenge.

**Clean sheets is a team badge and the copy says so.** `lib/matches.js` awards
one to every player who appeared in a match with nothing conceded — positions
are fluid at this level, so there is no GK/DEF gating and there shouldn't be.
The consequence is that the club's first clean sheet hands bronze to eleven
people at once, which makes it the one Class 1 badge that isn't a personal
total. That is accepted rather than fixed: a clean sheet *is* a team
achievement, and the badge's own line names it as one so it doesn't read as a
participation prize.

*Class 2 — events, stackable, no tiers, gold.* Man of the Match and the
hat-trick. A hat-trick is a thing that happened, not a rung; these carry a small
multiplier (`×2`) and appear inline under a player's name. `lib/awards.js`
already counts hat-tricks on `goals >= 3` and that rule is unchanged.

*Class 3 — season honours, trophies, one per season, gold.* Player of the Season
(voted), Golden Boot, Playmaker, The Dependable. They do not tier and do not
stack into a bigger version — two Golden Boots is the same trophy twice, shown
as a year list. **The Dependable is most appearances**, not ever-present: nobody
was ever-present in 2025/26 and an award nobody can win is not an incentive.

These four are exactly the honours board's rows, so the board and the badges
cannot drift. `SEASON_AWARDS` in `lib/awards.js` carries five today: **Most MOTM
is removed** — it usually goes to the same player as Player of the Season — and
survives as the Class 2 star; **Assist King is renamed Playmaker**; and
`everPresent` and its `PLATES` family come out with it.

**The brace is not built** — see *There is no brace* in `DESIGN.md`. It leaves no
code behind: nothing in `lib/awards.js` ever counted one.

**Six of the ten drawings never tier**, so the recolour work is four badges ×
four metals plus two one-off passes to gold, not ten × four. Two of the four
career badges — assists and goals — are near-monochrome silhouettes with no
tonal span to map, so their metal is a flat stop rather than a mapped ramp. The
measurements are in *The artwork*.

**A badge has its own page.** `/records/badges/:key` lists every holder at every
tier and who is closest, so a badge is linkable into the group chat. The keys are
the artwork's filenames.

**The medallion is built here, not parked.** A dark disc behind a light metal.
The three gold-dominant drawings — cup, cap, star — score 0–21% of their own ink
against paper and 90–100% against the board, and that is the drawing rather than
the band: a cup is mostly highlight, so no ramp fixes it. Trophies and events sit
on a medallion wherever the page around them is light; career badges sit on the
ground in bronze and on a medallion above it.

**`check:layout` needs extending before it can hold this phase.** Its icon
invariant reads `fill` off the root `<svg>`, which is one colour for the nav and
the sparklines and meaningless for a drawing that carries its colour on thirty-six
child paths. It has to composite the rendered footprint and score the share of
ink clearing 3:1, which is the measurement *The artwork* reports. Until it does,
it would pass a gold cup on green and fail the same cup on paper for the same
reason: it is reading black either way.

**Two artwork defects come off *The artwork*'s list here.** `motm.svg` is 471 KB
of embedded bitmap and has to become paths or a down-sampled raster before it
ships to a phone; `the-dependable.svg` has a stray near-white hairline floating
beside the cap that has to be deleted.

**Done means** the badge board is 4 cards + 2 stackables + 4 trophies, not 24
plates; every badge has a detail page; a player's own page shows their tier icons
under their name; no icon renders below its floor (20px for trophies, 16px for
the rest); no drawing scores under 3:1 across the majority of its ink on the
ground it ships on; `motm.svg` is under 20 KB; the ladder table above matches
`lib/awards.js` exactly.

---

## Phase 16 — Records, split three ways

The worst page. 4,823px on a phone, five sections, and it opens with a set of
mismatched cards that are hard to read.

Moved after 14 and 15, because it assembles what they build. An earlier draft
had it here first, stubbing the badge board and rendering the leaderboards with
the six bar boards that are 2,714px on their own — a page built twice and a
2,000px budget that couldn't be met either time.

**Badges** (default) — Phase 15's board and the badge detail pages.

**Honours** — the honours board, which is the one surface the review found
nothing wrong with, moved onto green with its caption cut, and now carrying
Phase 15's four rows rather than five. Plus the season index, restructured from
a 10-column table into rows: that table currently hides 319px at 375px, and the
fix is the Phase 10 result row, not a narrower font. This is the third of Phase
10's known bugs and it comes off Phase 9's expected-failure list here.

**All-time** — Phase 14's six boards, plus club records. Club records stop being
five differently-sized sheets and become one ruled list on the Phase 10 result
row, so the scores line up in a column and "Old Wellingtonians 1–7 Old /
Cheltonians" stops wrapping mid-name.

The height arithmetic, because this is the sub-page the 2,000px budget binds
hardest: six boards at Phase 14's 1,400px, plus seven club-record rows at a
44px touch target and a heading (~400px), plus the segmented control, the title
and the intro (~150px) is **~1,950px**. It fits with about 50px of slack, and
where more is needed it comes from the record rows — two of them currently print
the same two matches back to back, because the longest unbeaten run and the
longest winning run are both "2 games", which reads as a bug. Where runs
coincide, one row says so, and the list is six rows rather than seven.

**Done means** no Records sub-page over 2,000px at 375px; `check:layout` clean
with an empty expected-failure list; five sections became three pages and
nothing was dropped.

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
- **Upcoming fixtures** move onto that row too, and off a table: it hides 4–7px
  at 320px, which `check:layout` found and holds against this phase. It is the
  smallest of the table findings and the cheapest to retire, because the row
  already exists by then.
- **Charts move to their own sub-page** at full width. They are currently behind
  a toggle at the bottom of a 3,530px phone page, squeezed into a corner, which
  means they effectively don't exist. The Results/Charts toggle is deleted; the
  sub-page nav replaces it.
- **"Most involved"** loses its plum bars along with the rest of the bar boards.
- **"All seasons" comes off the season picker.** `pages/Season.jsx` offers it,
  and an all-seasons Season page is Records → All-time reached from the wrong
  section — the same twice-said-thing Phase 14 takes off Players. Season owns one
  season; a link across to Records replaces the option.

**Done means** the Season page under 2,200px at 375px; the charts get the full
column width; the redundant toggle is gone; the picker offers seasons only; the
Season entries come off `scripts/expected-failures.js`.

---

## Phase 19 — Home

**Whose page it is**, decided: the squad's, on the first screen.

- **The result leads**, at full size, with the MOTM named on the same board —
  not as a 14px line 700px down the page.
- **The club's name is said once**, in the masthead. The H1 that repeats it goes.
- **The league table stays**, because "where are we" is why people open the
  site. Season leads with something else.
- **The next fixture is a compact row**, not a 280px card carrying eight words
  with a black circle where a crest should be. `public/crest.png` has since
  arrived (see *The artwork*) — the circle becomes a real crest thumbnail, not
  a state this phase still has to design around.
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

**Where the room comes from.** This is the only page inside its budget already —
1,857 against 1,900 — and this phase *adds* content: labels on 14 stepper chips
and a key for the squad pills. Both are paid for by the comparison table, which
moves onto the Phase 10 row and gets shorter, and by the pitch address leaving
the scoreboard. The budget does not rise; if it has to, that's a finding worth
recording rather than a number worth editing.

**Done means** the score reads as a scoreboard at 375px; the squad is above the
comparison; the stepper says what each chip is; Matchday still under 1,900px.

---

## Phase 21 — Player detail and the opponent page

The two pages no phase owned. Small, and last before the data centre, because
four earlier phases each shave a bit off them and this is where the result gets
measured rather than assumed.

**Player detail** is 2,941px against a 2,400px budget. Phase 10 restructures
Firsts & bests and the match log, Phase 12 cuts its prose, Phase 15 puts badge
icons under the name. What is left for this phase is the arithmetic: measure it,
and cut whichever section is still paying for itself in scroll rather than
interest.

**The opponent page** appears in no phase and has no budget. It gets one here —
**2,000px**, the same as a Records sub-page, since it is the same kind of
reference document. Phase 10 already rebuilds its meetings table; this phase
gives the head-to-head and pitch details the same once-over. The head-to-head
table hides 36px at 320px — found by `check:layout`, not by the review, and held
against this phase.

**Done means** Player detail under 2,400px at 375px; the opponent page under
2,000px; both pages' budgets recorded in `DESIGN.md`; `check:layout` clean —
which by then means the expected-failure list is empty.

---

## Phase 22 — The data centre

Players' third sub-page. Deliberately last: it serves one user well where
everything else serves the squad, and a half-filterable stats table is more
annoying than none.

Every player, every stat, filterable and sortable — goals, assists,
contributions, cards, and the per-game rates.

**One thing to record.** `appearances` has no `minutes` column, so per-90 is not
computable. Adding one means 11–16 numbers typed per match on a phone in a pub,
which is the largest data-entry burden anyone has proposed for this site, and
burden is what kills volunteer-run stats sites. So the figures are **per
appearance**, labelled per appearance, with one footnote saying we don't record
minutes. That is the club's own assumption, written down once rather than
implied.

**Done means** filters that compose; the table doesn't side-scroll on a phone or
the whole idea is wrong for mobile and it says so; the footnote exists.

---

## Page budgets

**`DESIGN.md`'s *Page length* table is the authority for the budget numbers** —
they are a design constraint, and a component author reads that file. This table
is the tracking view: where each page started, so a phase can show it moved.

*Review* is what the page-by-page review measured by hand. *Harness* is
`npm run shots` on the `mid-season` fixture at 375px, which is what every phase
from here is measured by. Where they differ, the fixture is carrying two matches
the real season doesn't have — a walkover and a clean sheet — which lengthens
anything that lists results. Matchday and the squad roster land on the same pixel
either way, which is the check that the harness measures the same thing the
review did.

| Page | Review | Harness | Budget | Phase that meets it |
| --- | --- | --- | --- | --- |
| Home | 2,091 | 2,068 | 1,600 | 19 |
| Matchday | 1,857 | 1,857 | 1,900 | 20 |
| Season | 3,530 | 3,672 | 2,200 | 18 |
| Players → Leaderboards | 2,714 | 2,997 | 1,400 | 14 |
| Players → Squad | 1,254 | 1,254 | no cap — it's a roster | 17 |
| Records → any sub-page | 4,823 (one page) | 5,071 (one page) | 2,000 | 16 |
| Player detail | 2,941 | 2,940 | 2,400 | 21 |
| Opponent detail | not measured | 1,196 | 2,000 | 21 |

Records earns length as a reference document, which is why it splits rather than
shrinks. Home does not.

The opponent page turns out to be the only one already inside its budget, along
with Matchday. That is not a reason to leave it alone — it is 1,196px because
half of what it should say isn't there yet, and Phase 21 owns both ends of that.

---

## Parked

Named so they don't get lost, and not built yet.

- **About us** — club story and a team photo. Needs a photo worth showing.
- **Player photos** — real headshots. Blocked on collecting 30 of them; the
  design works without them and the initials placeholder is fine.
- **Final league positions per season** — the Records season index has a
  Position column that stays blank; needs standings entered per season.
- **Head-to-head pages** — the opponent page exists and Phase 21 tidies it; a
  proper record against each club could grow from there.
- **New badge types** — attendance streaks, consecutive-scoring runs. Add once
  Phase 15's three classes are proven against a second season.
- **A figure recipe in the type layer** — the display face at 600 weight with
  `-0.015em` and tabular figures is written out in twelve rules. One decision in
  `DESIGN.md`'s *Type* section, not a component question.

---

## Not on the list

Dark mode, a component library, a CSS framework, an animation library,
server-side aggregation of stats, a sixth nav section. See *Deliberately not
doing* in `DESIGN.md`.
