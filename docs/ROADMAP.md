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
| 8 | Page components | Every page reads as a layout; `CLAUDE.md`'s ~250-line guideline dates from here. Two files have since passed it — see Phase 51 |
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
| 23 | Home, the cosmetic pass | The last result reads by venue with a badge marking which side is us; the momentum chart gained gridlines, value labels and a flat fill, plus a *Charts* button |
| 24 | Players, the second pass | `seasonPools`, the closed archive banner, five small tables became one wide reference table |
| 25 | Matchday: the season ladder | `seasonLadder` + `SeasonLadder.jsx`: the stepper, jump strip, form chips and next-fixture card became one ladder, a rung a game with its running goal difference; the budget moved to 2,300 |
| 26 | Matchday: the match panel | `MotmPlate.jsx` and `TeamSheet.jsx` replaced the monogram card and squad pills; a scorer's drawn ball and a gold star are the only two marks a name carries; `WorthNoting` deleted |
| 27 | Matchday: head to head, and the report | `HeadToHead.jsx` replaced `ComparisonCard.jsx`, with a six-row mirrored-bar tape where the opponent has a league row; `MatchReport` clamps to ~300 characters behind one control |
| 28 | Matchday: the desktop rail | Above 900px the ladder became a rail with the match beside it — **superseded by Phase 31**, which is where the mechanism is written down now |
| 29 | Season, the ladder | `SeasonLadder` moved to `components/` and replaced `ResultsTable` and `UpcomingFixtures` on Season; 3,224px → 2,494px, still short of the 2,200 budget |
| 31 | Matchday: the rail, corrected | Phase 28's `display: contents` stretched the open rung to the whole panel's height; the rail and the match are two ordinary boxes placed by `useIsNarrow` now, and above 1200px the match splits into two columns |
| 32 | The new badge art | Twenty-two drawings, one per badge per tier, served as `<img>`; out went `recolour`, the four metal ramps as paint and the medallion. `npm run badges -- <dir>` ingests a drop: 1.8 MB → 807 KB |
| 33 | The cosmetic pass the art paid for | Every badge drawn bigger now the art carries a frame — 24→34 in the hero, 30→40 on the shelf, 21→26 on a squad tile, 40→64 for a trophy — and the roster opens on cards, with `?layout=list` for the team sheet |
| 35 | The admin review | The write side, page by page: `fixtureFor` stops a result inserting beside the fixture it belongs to, `AdminList` replaced three tables that hid their own actions at 375px, MOTM became one a game in the lineup editor, and the admin routes went into `site-map.js` |
| 34 | The trophy cabinet | `/records/honours` became a cabinet: one green band, a shelf a season, four trophies at 72px with the winner and their mark under each, 2×2 on a phone and four across from 520px |
| 37 | The motion pass | Every transition rewritten onto motion tokens; press feedback, which the site had none of; all 30 `:hover` rules gated behind `(hover: hover) and (pointer: fine)`; and two animations that had never once run, fixed |
| 38 | The gild | Hover became what happens to printed matter: three edge treatments — a rule drawn, a tick in the margin, an edge firming up — and the gild, one sweep of light across a board as it arrives |
| 39 | The second copy | `scripts/backup.mjs` + `backup.yml`: all six tables to `backups/` daily, JSON plus a `restore.sql` that upserts them back. Also the keepalive and the site's only alerting. Paged at 1,000 rows, which Phase 43 taught the site itself |
| 40 | The link, and the icon | `npm run og` renders the share card and the home-screen icons in Chromium against `tokens.css`; `manifest.webmanifest` makes *Add to Home Screen* open Home full-screen; `%SITE_URL%` is the build's one absolute URL |
| 41 | Counting who turns up | `lib/analytics.js` — a cookieless counter named by two build-time variables rather than by a vendor, compiling to nothing when they are unset. Phase 45 fixed what it counts |
| 42 | The docs, reconciled | `CLAUDE.md`, `DESIGN.md` and this file had drifted from the code and from each other — four `> **Phase N.**` markers naming closed phases among them. Corrected, and the release sequence written in as the plan of record |
| 43 | The appearances ceiling | `lib/paging.js`: every read `DataContext` makes pages to exhaustion with a total order, so the site stops truncating at PostgREST's 1,000 rows around season six. The fixture stub answers `.range()` now, and eight tests hold it |
| 44 | The front door | Home's scorers and MOTM link to their player pages — the last component of eleven that rendered a name without one — and the season line it already carried is its `<h1>`. Both rules are now general: `DESIGN.md` → *A name is a link* and *One `<h1>` a page* |
| 45 | What the counter counts | The site files every view and the script none (`no_onload`): the script's own view was `/` on every route of a hash-routed site, which inflated Home and lost the arrival that matters, a player page pasted into the group chat. UUID routes collapse to `/players/:playerId`, readable keys don't, a player page and a badge page fire named events, and views taken before the deferred script lands are held rather than dropped. `Boolean(src)` had been quietly defeating the "nothing in the bundle" promise since Phase 41 — esbuild won't fold a call to a global — so `check.yml` greps `dist/` for a vendor name now, beside the grep that keeps the fixture out |
| 46 | The offline shell | `public/sw.js` — network-first, shell only, same-origin GETs. An installed app on a dead signal used to get the browser's own offline page, with no address bar to escape it; it opens to its own frame and a "no connection" note now. A changed `index.html` empties the cache, so a deploy replaces the previous build rather than stacking on it, and `DataContext` re-reads on `online` because a home-screen app has no reload |
| 47 | The address | `oldwellingtoniansfc.com` at Porkbun: four apex `A` records, four `AAAA`, `www` at `owfcstats.github.io`, the domain in Pages with Enforce HTTPS. `public/CNAME` became the one place it is written down — `vite.config.js` reads it for `%SITE_URL%`, so the `SITE_URL` repository variable that used to hold the same domain a second time is gone. The trap was that the two could disagree in silence: every page loaded and only the link preview and the canonical were wrong. `check.yml` asserts the file reaches `dist/`, that the built `og:image` and canonical are on that domain, and that no placeholder survived |
| 48 | This is me | One cookie, `owfc.me`, holding one player id, and Home's second section becomes the reader's own: this season's apps, goals and assists, and the nearest career badge with what it costs. A preference and not a session — no account, no row, nothing sent anywhere — which is the distinction `DESIGN.md` → *What the site remembers* exists to keep. The offer is made twice, on Home and as *This is me* on a player's own page, and it is what finally lets the counter tell a reader's own page from somebody else's (`my-page` against `player-page`, plus `me-pick`), which Phase 45 wrote down as unanswerable until this landed. It costs Home 74px unpicked and 222px picked, and Phase 52 owns what comes off in exchange |
| 55 | Honours wait for the season to end | Found by the squad on the first Saturday of 2026/27: one friendly in, all eleven who turned up held The Dependable, because three of the four honours are derived and so have a leader from the first whistle. `honoursSettled` publishes a season on 1 July once its diary is empty, `season_status` overrides that either way, and an unsettled season's awards arrive with nobody on them — one line, all six surfaces. Plus the repeats rule: `×n` where a badge is drawn small, the seasons where there is a column for them |
| 56 | Venue, actually recorded | `matches.venue` is `not null`. It went in nullable with nothing to fill it from, and a null venue is not "no answer" but a wrong one: `matchHomeAway()` read `venue !== 'A'`, so every unrecorded row claimed we were at home, and `venueTeam()` gave the fixture no pitch. The roadmap's own finding said the live rows were null; they were not — the fixture's were, and checking the frozen parse instead of `backups/` is what made a closed question look open. The club's real H/A is in `import_2025_26.sql` now, so it reaches the fixture through the parser rather than being invented as an alternating run; the wizard, the match form and the walkover form all refuse to submit without one; and the migration stops and names the count rather than backfilling a venue nobody recorded. `matchHomeAway()` returns `known` — false for a neutral ground as well as an unrecorded one — so an ordering is never read as a claim about a pitch. Unblocks phases 57–64 |
| 57 | The club band and the fixture card | `components/home/ClubBand.jsx` — a dark band directly under the masthead, reusing the masthead's own `--board` tokens rather than the `.board` surface class, so nesting a paper plate inside it isn't the box-in-a-box that surface rules out (`DESIGN.md` → *The club band, under the masthead*). Holds one plate today, the rewritten `NextFixture.jsx`: home side first and away second by venue, kick-off and the ground between them, the date on its own ruled line, a live days/hours/minutes countdown, *Add to calendar* (`lib/ics.js`, a dependency-free `.ics` writer with its own tests) and *Match details*. Phase 58's form card takes the band's other slot |
| 58 | The form card, and the last game as a bar | `FormCard.jsx` fills the club band's second slot: league position over five result-coloured squares, each carrying its scoreline, nothing else. `LastResult.jsx` is now `LastGameBar.jsx` — a full-width paper bar built from the same `.result-row` every other scoreline uses, goalscorers and the MOTM linked underneath — which took Home from five named boards to four (`DESIGN.md` → *Board*) and closed the score-order split: the bar reads ours-first like every other row now that it isn't staging a scoreboard |
| 59 | Match outlook, and Home's grid | `MatchOutlook.jsx` replaces `RecentForm.jsx`: the last three results and the next three fixtures, each group on `ResultList`'s own compact inline variant — extended with `showOpponent` and a `tbc` empty-slot chip rather than a seventh scoreline shape — padded with `TBC` chips so the card holds its height with a short diary. Below *Your season*, Home becomes a two-column grid past 860px: the outlook on the left spans *Division 5* and *Season so far* stacked on the right; one column below that. `DESIGN.md` → *Match outlook, and the grid below the band* has the reasoning, including where this deliberately simplifies Draft D's richer row |
| 60 | The league snapshot keeps no form column | The mock-up's five coloured chips per row can't be built — `league_rows` holds only our own totals, not results, so no other club has a form to show. No column ships, on the snapshot or the full table; the chips stay where Phase 58 put them, on the form card alone. `DESIGN.md` → *Match outlook, and the grid below the band* has the ruling |
| 61 | Charts becomes Stats | `/season/charts` is `/season/stats`, and Season is Season · Stats — one page for the numbers, which is where phases 62 to 64 add theirs rather than each earning a sub-page. The season filter gains *All seasons*, and the decision the phase was really for is what it means: **season against season, never the seasons added up**, since combining every season into one board is Records' and saying it twice is the trap the Players/Records split exists to avoid. So the mode is the "Points accumulated" chart with every line lit, labelled and in its own colour; the scoring race and the goals-per-match line don't draw there, because across every season they stop comparing and start totalling. Stats' alone, too — the Season sub-page is one season as a whole, so its tab drops the filter and an old `?season=all` link lands on the comparison. `SeasonCharts.jsx` split on the way across: one file per card, `SeasonStats.jsx` the stack of them, `ChartCard.jsx` and `chart-bits.jsx` the frame — 374 lines became six files, none over 141. Single-season Stats measures 1,909px, unchanged; *All seasons* 1,056px |
| 62 | The season's own numbers | `SeasonPerGameTiles`, `ResultSplit`, `ScorelineFrequency` and `MatchMargins` join the Golden Boot race, points accumulated and goals trend on `/season/stats`: six per-game tiles (played, scored/conceded a game, both teams scored, clean sheets, players used), a W/D/L donut in `--win`/`--draw`/`--loss`, the most frequent scorelines and the winning/losing margins. `lib/matches.js` gained `perGameStats`, `playersUsedCount`, `scorelineFrequency`, `marginBuckets` and `extremeMargins`, every figure derived at load time with no new column. Single-season only, the same reasoning as the two carried-over charts: combined across every season these become a career board, and that's Records'. `ChartCard` gained an optional `bodyClassName` for the donut, which has no line end to label so its counts sit in a caption row under the plot instead. 1,909px became 3,676px, well past the 2,200 budget — reported, not asserted, and not this phase's to close |
| 63 | The division, ranked | `divisionRatios` in `lib/league.js` and `components/season/DivisionRatios.jsx`: every club in the division ranked on goals for over played and goals against over played, best first, our row in gold, each list crossed by a hairline at the division average. Free — it reads the standings an admin already types in each week, and stores nothing. The whole risk was the divisor, and it is invisible when wrong: a club that has played nothing has no rate rather than a rate of zero (which would top the defence table), it is outside the averages as well as the ranking and is named underneath, and the average is the ratio of the totals rather than the mean of the ratios, because a table with clubs on different numbers of games is not a table you can take a flat mean of. The fixture division was square — every club on twelve — which is the one shape that hides all of that, so Old Stoics have two games in hand there now and rank above a club that has scored more goals; `tests/fixtures.test.js` asserts the division stays uneven. Not a Recharts plot: a ranked list with each figure washed behind its own row, which is what leaves a club name the full width of a phone (`DESIGN.md` → *A ranked list is not a plot*). It says "League games only", because the per-game tiles directly above it count friendlies and cup ties in the same figure. 3,676px became 4,546px |
| 64 | The charts, and the series palette | `GamesAgainstContributions` and `AppearanceSpread` join the Golden Boot race under the division table, the three player cards together because that group is why a player opens the page: a scatter of games against goals + assists, one dot a *spot* sized by area rather than one a player — twenty of the forty-eight played a single game and fifteen of those scored nothing, which is one point carrying the largest fact on the plot — with a dashed one-a-game diagonal labelled on itself, and a distribution of who played how many, empty buckets drawn rather than closed up. `contributionScatter` and `appearanceSpread` in `lib/charts.js`, thirteen tests. **The palette was the phase.** The old five had been checked for contrast on the ground and never against each other: seven of the ten pairs were under the ΔE 15 floor and `--series-1` against `--series-3` measured **0.2 under deuteranopia** — the same colour, not a near miss — which is worse than the note recording the finding said, and its figures don't reproduce. Re-stepping found a limit rather than a fix: 4.5:1 on paper caps a series at L* 46, protanopia takes the red-green axis inside that band and tritanopia takes the blue-yellow one, so there are three usable hues and not five. The answer is **three pigments at reading depth and two of them again at half the lightness** — brass, verdigris, plum, then deep brass and deep plum — worst pair ΔE 18.1, and the first three are three hues so any chart with three series or fewer never repeats one. Measured, not judged: `scripts/colour.js` (CIEDE2000 + Viénot–Brettel–Mollon) and `tests/palette.test.js`, which holds the floors against `tokens.css` and the ΔE maths against the Sharma, Wu & Dalal reference pairs. `check:layout` gained a seventh invariant, `chart-text-below-floor`, so "drawn at a canvas that fits 375px" is asserted rather than claimed. 4,546px → 5,501px, reported not asserted — the page's shape is final now and the cut belongs to a phase that takes it deliberately |

**Phases 57 to 64 are in this table because they shipped, not because they are
right.** Each one is in `main`, green, and built to a prose description of a
mock that was never committed; the pages they made do not match it. *Now*
below is the fix, and *The redesign — what went wrong* is why. Their rows
stay as the record of what each commit did.

**The detail behind any closed phase is in its commit** — `git log --grep="Phase
20"` finds it, because every phase commit names its phase in its own subject.
That is what makes condensing this table safe rather than lossy. A count used to
sit here instead of that sentence, and it was wrong by fourteen, which is the
argument for writing down the mechanism rather than a tally.

Phases 32–34 are the one exception to one-phase-one-commit: they arrived as a
single drop of artwork and landed together, because 33 and 34 are decisions
about drawings that only exist after 32 — sizes, a greyed placeholder, a shelf
of trophies. One commit names all three, so the grep still finds each of them.

**Phases 25–41 were condensed late, not as they landed.** Sixteen rows
were still carrying their full instructions, 13,000 characters where the rule
says one line each, which is the cost this file exists to avoid. Condense a
phase in the commit that closes it.

Two rulings from that half still bind everywhere: **everything is derived,
nothing is stored twice**, and **a component that gains a second page moves up to
`components/`**.

---

---

## The redesign, phase by phase — done

**Phases 57 to 64 shipped, and the pages they built did not look like Draft D.**
The mock was signed off, described in prose in this file, and never committed —
so every phase was built from the description and mapped each drawn element
onto the nearest primitive the site already had. Home and Season → Stats had
the mock's *contents* and almost none of its *shape or colour*. *The redesign —
what went wrong* below has the findings; phases 65 to 74, kept here in full as
the record of the fix, closed every one of them.

**Two rules for every phase here, because they are the two the first pass
lacked.**

1. **The mock is the specification, and it is in the repo:**
   `docs/mocks/home-stats-draft-d.html`. Open it at both widths before writing
   anything. Where this file and the mock disagree, **the mock wins**, unless
   the phase names the rule that stops it — and then the phase says what is
   drawn instead. "The mock is a picture and this file is the contract" is
   retired: it is how a form card drawn with 62px squares shipped with 26px
   ones, and how a bar of results shipped as a sheet with a heading.
2. **Done means side by side.** `npm run shots` for the route at 375 and 1400,
   beside the mock at 375px and Desktop, in the pull request: the same cards in
   the same places in the same colours. The commit message lists every
   remaining difference and the rule behind each. `check:layout` green is
   necessary and was never sufficient — it was green on all eight phases that
   got this wrong, because it measures heights and invariants, not likeness.
   **The owner looks at the pair before the next phase starts.**

Model and effort per phase follow the convention the first pass set (Sonnet 5
where the mock has answered the design questions, Opus 5 where a wrong answer
is silent). The lesson of that pass is that the column matters less than the
mock being open: a strong model reading prose reused primitives too.

---

**Phase 65 — The mock in the repo, and the contract.** Done, in the commit that
wrote this section. `docs/mocks/home-stats-draft-d.html` is the artifact byte
for byte; `docs/mocks/README.md` says what a flat does that the app must not
copy; `CLAUDE.md` → *The redesign* says the mock is the specification and
nothing else; `DESIGN.md` → *Draft D is the specification* lists what the mock
decides, marked with the phases that build it, and the sections describing
the first pass carry markers pointing there. Nothing under `src/` changed.

**Phase 66 — Two pigments, one head, and the block.** Done. `tokens.css` gained
`--chart-1` (`var(--gold)`) and `--chart-2` (`var(--board-soft)`) — aliases, so
a bar, a wash or a split never reaches for the five-series line palette again,
the mistake that put appearances in `#4a3a18` and the scorelines in teal
(`DESIGN.md` → *Chart series*). `primitives.css` gained `.tile` (promoted from
Home's own `.home-stat-tile` — the mock's `.tile`) and `.head` (the mock's card
head: an `h2` with a `.more` link on the right and an optional `.label` above
it), replacing `.home-stat-tile`, `.home-widget-head` and `.chart-head`
everywhere. `StatTile` lost its `plain` prop with it — every call site already
passed it, so `.tile` is the only shape left. Home's two `.block`s (*Next up*,
*League position*) are gold now, not burnt — burnt stays competition tags alone
(`DESIGN.md` → *Accents*). `tests/palette.test.js` unchanged and green;
`check:layout` green.

**Phase 67 — The band, as drawn.** Done. `main.page:has(> .home)` drops the
page's own padding and column for Home; `.home-column` (`home.css`) re-applies
1400px and the page's own gutters to everything under the band, and
`.club-band-inner` does the same inside the band's own full-bleed ground —
flush under the masthead, edge to edge below 700px and spanning the viewport
above it, the site's first full-bleed section. `.club-plate` takes a 1px gold
border all round in place of the old 3px top edge, and is a flex column now so
`.nm-actions`'s `margin-top: auto` sits it on the plate's own floor — with the
band's grid stretched to match, that's what lines both plates' bottom edges up
without either needing to know the other's height. `NextFixture.jsx` is
redrawn to the mock's own class names — `.nm-head`, `.nm-teams`, `.nm-team`,
`.nm-badge` (46px, the crest inside the gold disc), `.nm-mid`, `.nm-count` (the
countdown, still `.tile` per Phase 66, lifted onto the display face at
`--t-headline` and zero-padded) — plus a `.nm-said` line once *Add to
calendar* is used. `FormCard.jsx` takes Home's old `<h1>` as its own first
line — *Season 2026/27 · Division 5*, the one-`h1` rule kept by moving it, not
doubling it — the position at `--t-display` with a `sup` ordinal and *of N · P
points*, and `.form-strip` of 62px `.form-run` squares capped at 78px, the
latest ringed gold. `scripts/expected-failures.js`'s crest entry moved with
the markup, from `fixture-team.us > img` to `nm-badge.us > img`. `tests/
ics.test.js` untouched and green; `npm test` green (216). Home's three budget
rows: 2,413px → 2,329px unpicked, 2,499px → 2,423px picked, 2,487px → 2,403px
picked-with-no-apps — `DESIGN.md` → *Page budgets*.

**Phase 68 — The last game as a bar, and Your season's head.** Done.
`LastGameBar` becomes the mock's `.last-bar`: a strip on `--sheet` directly
under the band — the site's second full-bleed section, `.last-bar-inner`
re-applying the 1400px column the way `.club-band-inner` does — `2px solid
var(--gold)` on top and `1px var(--rule)` under, no heading and no rule
inside. One row that wraps: `.lb-score` (the pill, the score in the display
face at `--t-title`, *v Old Stoics · Sat 14 Mar* muted); `.lb-facts` — *Goals*
and *Man of the match*, each a `.label` over linked names; `.lb-more` *Full
match →* on the right. It reads ours-first like every row on the site —
Phase 58's ruling stands. *Your season* takes `.head`: `h2` *Your season*,
the reader's name as the `.more` link on the right, *Not you?* beside it as
a small secondary; its figures are `.tile`s, unchanged — apps, goals and
assists. The roadmap's own brief for this phase said the card also carried
"the nearest badge", following `DESIGN.md` → *Home, addressed to the
reader*; the badge chase was actually dropped from the card weeks earlier
(`git log --grep="Drop the next-badge chase"`) because nearly every reader
was shown the same uninformative "1 to clean sheet", and that doc section
never caught up. Corrected here rather than carried forward: the section
now says three figures and no badge, and *A name is a link* no longer claims
the reader's own name is the card's heading. `lib/format.js` gained
`weekdayDayMonth` ("Sat 14 Mar") for the bar's own date line. `npm test`
green (216); Home's three budget rows fell rather than grew from dropping
the old sheet-card chrome: 2,329px → 2,283px unpicked, 2,423px → 2,366px
picked, 2,403px → 2,346px picked-with-no-apps.

**Phase 69 — The outlook rows, the snapshot, and Season so far.** Done.
`ResultList` gained an `outlook` variant — the mock's `.ol-row`: date bold
over competition in `--font-data`, a score chip on `--sheet` with a 3px W/D/L
edge (`.ol-score`), the kick-off in `--gold-deep` for a fixture, the opponent
at 600 with the scorers (`scorerLine`, new in `lib/matches.js` — surnames
only, "Simeon 2, Pugh, Wray") or the ground (`venueTeam(m,
teams)?.pitch_name`) as a small second line, H/A on the right. The caller
computes that line and hands it over as `m.note`, the same way `m.tbc` already
worked for a padded empty slot — whose own placeholder text was cut from the
mock's "Fixture to be confirmed" to "Fixture TBC", the first `text-clipped` at
320–375px `check:layout` has caught since Phase 64 gave it the invariant.
`MatchOutlook.jsx` keeps the group headers, now `.ol-head` on a `--sheet`
strip. `LeagueTable` gained a `compact` shape for Home: `#` · Club · P · Pts,
headed by the division's own name rather than the generic *League table*, our
row washed gold with a 3px gold inset on its first cell (`.lt-compact tr.lt-us
td:first-child`); Phase 73 added the *Form* column beside it, and the full
ten-column table on Season is untouched. `components/home/SeasonStats.jsx`
became `SeasonSoFar.jsx`: `.record` — Won / Drawn / Lost as three cells, the
figure in the display face at `--t-headline` in `--win`/`--ink-soft`/`--loss`,
a percentage under; then *For*/*Against* bars, corrected from a leftover
`--verdigris-deep` to `--chart-1`/`--chart-2` per Phase 66's own ruling.
Played, clean sheets and win rate came off with it — Stats' tiles now — and so
did the card's link back to Season, which the mock doesn't carry. The grid
past 900px (the mock's own breakpoint, not the club band's 860) is `1.06fr
1fr`, outlook spanning both rows on `.g-outlook`/`.g-league`/`.g-season`.
`npm test` green (219, three new: `surname`, `scorerLine` twice); `check:layout`
green (40 known failures, nothing new). Home's three budget rows rose with the
richer outlook row, net of what the shorter season card gave back: 2,283px →
2,447px unpicked, 2,366px → 2,530px picked, 2,346px → 2,509px
picked-with-no-apps.

**Phase 70 — Stats, as drawn: the frame and the four small cards.** Done.
`Season.jsx`'s old `SeasonSelect` gave way to a `.chip-row` of `.chip-btn`s
above the `.seg`, the mock's own `.season-filter` built from a primitive
rather than a new class — *All seasons* is a chip on Stats only, and dropped
96px off the shared header every sub-page carries in the same move.
`SeasonPerGameTiles` lost its sheet, heading and finding sentence for a bare
`.tiles.six` — two decimals for a rate, a percentage for both-teams-scored,
the new `.tiles`/`.tiles.six` primitives in `primitives.css`. `ResultSplit`,
`ScorelineFrequency` and `MatchMargins` came off `ChartCard` onto a `.sheet`
with a `.label.ruled` head and nothing else: the donut keeps its 128px
Recharts pie but trades the caption row for a `.donut-key` beside it; the
scorelines and margins are `.hbars` now, not Recharts bar charts, margins
gaining a `Draw` row and the win/loss split moving into each row's `title`.
`VenueGoalsSplit.jsx` is new — a 32px `.split` bar, `--chart-1` home against
`--chart-2` away, off `venueSummary`, which already had each side's
`goalsFor` once Phase 56 closed the venue gap Phase 62 was waiting on.
`GoalsTrend.jsx` is deleted and `PointsAccumulated` draws under *All seasons*
only now, both off the single-season page entirely — the mock has no
goals-per-match line, and points accumulated compares seasons, so a single
one drawing alone was never answering anything. `ChartCard` is down to the
division (Phase 71), the three player charts and Points accumulated;
`DESIGN.md` → *Charts* is rewritten for the four cards that left it. `npm
test` unchanged and green (219); `check:layout` PASS, 40 known failures,
nothing new. Season → Stats: 5,501px → **3,814px, 1,614px over** — about
two-thirds of the old number rather than the half estimated going in, because
the division's ranked lists and the three player charts are untouched here
and are most of what's left. Season itself: 2,494px → 2,398px from the
chip-row alone.

**Phase 71 — The division, one list at a time.** Done. `DivisionRatios` came
off `ChartCard` onto a plain `.sheet` with the shared `.head` — `.label` *The
division* over `h2` *Attack and defence*, a `.seg` toggling **one** ranked
list, and no data table, because every figure on this card is printed on its
own row (Phase 70's rule). Rows are the mock's `.ratio-row`: rank faint, club
at 600, a 15px track on `--sheet` filled solid `--chart-2` — ours `--chart-1`
with the row washed gold — and the figure to two decimals. The average is an
`.avg-note` under the list, a dashed mark and *Division average 2.55 scored
per game*, in place of the hairline that used to cross every row; *League
games only · entered by hand, updated …* stays as the foot, and now draws only
when the list does. `divisionRatios` in `lib/league.js` is untouched, so both
rankings still share one scale and the toggle moves a bar for a reason.
**The one place the mock is not followed is the club column**, and it is
measured rather than argued: Draft D draws 8.4rem with an ellipsis, and "Old
Merchant Taylors II" — a real club in the 2026/27 division, which
`backups/league_rows.json` has and the fixture's 2025/26 division does not, so
`check:layout` could not have caught it — needs 127px at `--t-micro` and 148px
at `--t-small`. The column is `minmax(0, 8.25rem)` below 520px and
`minmax(0, 9.6rem)` above with the track taking what is left down to a 48px
floor, which puts every real club name in the division on one line from 320px
up; the mock's own render clips at both steps. `npm test` unchanged and green
(219); `check:layout` PASS, 40 known failures, nothing new. The card is 854px
→ **408px** at 375px, and Season → Stats **3,814px → 3,377px, 1,177px over**.

**Phase 72 — The three player charts, and the pigments on them.** Done. All
three came off `ChartCard` onto `ChartSheet`, new in `chart-bits.jsx`: the
mock's `.head` — a `.label` over the `h2` — no finding sentence, the drawing in
a `.chart-hold` capped at 760px and centred, and the data table behind a quiet
*Data* link in the foot that swaps for the chart rather than opening under it.
`.chart-plot` carries Draft D's proportion as an `aspect-ratio` instead of a
fixed height, **without a height floor**: an aspect-ratio box transfers a
height minimum back through the ratio into a *width* minimum, and the 240px one
this started with became a 404px minimum width that pushed every section on
Stats — tiles, division, all four small cards — 71px off the right of a 375px
screen. *The golden boot race* gained the mock's `.legend` above the plot
(inside the same cap, so the key sits over the plot it names), end labels of
surname and total (*Gibbons 5*) and a dot where each line stops, and its x axis
is now five dates evenly across the season rather than sixteen matchday
numbers, which took its axis caption with it. *Games against contributions* and
*How often people played* sit in a `.stats-two` past 900px; the scatter's pile
is `--verdigris-deep` at 0.75 alpha and its leaders `--chart-1` with a surname
beside each, the spread's bars `--chart-1` with the far bar's player named over
it in `--gold-deep`. Both axes on the scatter round up to four even intervals,
because Recharts divides a raw maximum four ways and rounds each tick
separately — 0/3/6/10.

**Two places this does not follow the roadmap's own description of the phase,
both measured rather than judged.** The mock's burnt `#a83a17` does not replace
`--series-4`: it clears contrast (5.73:1) and chroma (61.7) and then measures
**ΔE 2.0 against `--series-1` under tritanopia**, thirteen short of the floor
and the same collapse Phase 64 threw the old palette out for, so deep brass
stays. And the scatter gilds **the five leading contributors**, which is what
the mock draws, not "players at one a game or better", which is what this
file said: they are different sets, and in the club's own 2025/26 five players
were at one a game or better and three of them had played a single game, while
the mock's five gold dots are the top five by goals + assists exactly. A card
about turning up cannot headline a one-game cameo. A dot is a pile, so only a
dot holding one player wears a name. `contributionScatter` marks the leaders
and `appearanceSpread` returns the ever-present; three new tests (222 total,
all green). `check:layout` PASS, 40 known failures, nothing new. Season →
Stats: **3,377px → 3,107px, 907px over**.

**Phase 73 — Form, typed in.** Done. `league_rows` gained a `form text check
(form is null or form ~ '^[WDL]{0,5}$')` — `migration_2026_09_league_form.sql`,
`schema.sql` to match — and the mock's fifth column is on Home's snapshot:
`.chips` of 17px `.chip` squares, oldest first. **The fourth stored fact, and
the first one again rather than a new kind**: `league_rows` already stores other
clubs' results, a W/D/L total carries no order, so a rival's last five is typed
into the same grid on the same night as the rest of their row. **Our own row
never is.** `leagueStandings` takes `matches` as a fourth argument and hands
every row a `form` array — `formOf` over our league games for us, the typed
string parsed for everyone else — so each row has one source and nothing can
drift; the admin grid shows our chips read-only and the save sends `null` for
that row. Ours counts league games only, so it differs from the band's form
card after a cup tie (D·L·D·W·L against L·W·D·W·L in the committed fixture, a
test), and the foot says *form: league only*. A bad string is refused three
times: the check constraint, the input (`cleanForm` drops anything that isn't
W/D/L as it is pressed — `pattern` alone validates nothing outside a `<form>`),
and `parseForm`, which draws no chips at all rather than the legible part of
one. Nine new tests, 231 total, all green.

**The mock's own snapshot does not fit a phone, so the metrics here are ours.**
Measured before building around it: at 375px the mock's league card wants 385px
inside a 309px hold and hides 76px of itself, which is the rule `CLAUDE.md`
names as a bug *including inside a `.table-wrap`* — and adding the column took
the real table from 344px to the same 385. The fix is the narrow-width
treatment the full table has had since Phase 2, with its `:not(.lt-compact)`
scope lifted: the club name wraps, cell padding goes to `0.5rem 0.25rem`, the
end cells keep their inset. That left 320px still 18px short, so below 360 —
and only there — the snapshot gives its own card padding back to the table the
way the full one already did. 286/294/309/348px of 286/294/309/348 available.
At 375 it still sits inside its padding, which is how the mock draws it.
`check:layout` PASS, 41 known failures, nothing new. Home: 2,469px → 2,483px
at 375, the fourteen being the club names now wrapping.

**Phase 74 — The docs, condensed; then Phase 52.** Done. `DESIGN.md` → *Page
length* is the table and two short paragraphs now; the phase-by-phase log of
measurements came out, because the numbers already live in *Page budgets*
below and tracking them twice is how a doc drifts. `Draft D is the
specification` lost its `> **Phase 74.**` marker, folded into plain prose —
the sections it points at (*The club band*, *Match outlook*, *A ranked list is
not a plot*, *Charts*) were already rewritten to describe what 66–73 built as
each phase landed, so there was nothing stale left under them. `README.md` →
*How stats work* and *League standings* were checked against the same
question and were already current. Then **Phase 52**: all four budget rows
re-measured against `main` rather than the last phase that touched each page,
and each decided rather than left open a further time — *Decisions* →
*Settled* has the arguments, *Page budgets* the numbers they were decided
against. Home moves to 2,600px, Matchday to 2,800px with the clean-sheet
report's open state uncapped, Season to 2,450px, and Season → Stats becomes
its own row at 3,200px rather than sharing Season's number.

---

**66 to 74 have landed.** The redesign that started at Phase 56 is built,
documented and measured against real numbers rather than a prose brief. What's
next is the *Launch* checklist, then the *Next* list below, in that order —
unless the squad has hit something first, which still outranks both.

---

## Launch — what's left on the live site

The three steps that belong to the club rather than the code are in:
self-signup and anonymous sign-in are off in the Supabase dashboard, the domain
is live at `oldwellingtoniansfc.com` (Phase 47), and a GoatCounter account
exists. What remains is done on the live site, in order, and stops at the first
step that fails:

1. Set `VITE_ANALYTICS_SRC` and `VITE_ANALYTICS_ATTR` as repository variables
   from the club's GoatCounter account — README → *Counting usage* has both
   values. The code is done; these are the switch.
2. Deploy from `main`; the Actions run is green.
3. Paste `https://oldwellingtoniansfc.com` into a chat with yourself; the card
   renders with the crest.
4. Open the site cold; GoatCounter shows **one** view of `/`. Open a player
   page from the leaderboard; it shows `/players/:playerId` and a `player-page`
   event, and no UUID anywhere.
5. Pick your own name on Home, reload, and it is still there; open your page
   from it and the event is `my-page`, not `player-page`.
6. Add to Home Screen, open it from there, then turn wifi off and open it again.
7. Enter a result through the wizard on a real phone; it lands on Matchday.

---

## Next — after the redesign, in this order

One line each. A phase gets written out in full when it is picked up, not
before — that is what keeps this file short. Phase 52 isn't on this list
because Phase 74 already took it.

1. **Phase 36 — Losing a form on a phone.** Nothing on the write side warns
   before it drops what you typed. The wizard holds four steps in memory and
   writes on the last one, so a stray tap on the bottom bar loses the lot; the
   lineup editor, the league grid and the report editor are the same.
   `beforeunload` covers a reload and a closed tab, not the tap that actually
   does it — in-app navigation needs `useBlocker`, which React Router only gives
   a data router, and this app is on `<HashRouter>`. A routing change first and a
   dialogue second. **Done means** leaving a half-filled form asks first, at
   375px, on every write page — or an argument here for saving a draft instead.
2. **Phase 49 — Sharing a link from inside the app.** `navigator.share` on a
   match, a player and a badge. The site's whole distribution model is being
   pasted into the group chat, it has an `og:image` built for that, and
   installed to a home screen there is no address bar to copy from.
3. **Phase 50 — A season's fixtures in one screen.** `MatchForm` takes one match
   at a time at six fields each, so a sixteen-game season is about a hundred
   fields on a phone. Wanted before next season, not this one.
4. **Phase 51 — The cleanup pass.** Dead CSS (`.milestones`, `.show-all`,
   `.badge-num`, `.admin-bar`, `.fixture-location`, `.scored-row`, and whatever
   66–72 leave behind — `.home-form-*` and `.home-spark-*` are already
   unreferenced); `owfchomedashboard.patch`, 33 KB at the repo root patching a
   `src/styles.css` that Phase 1 deleted; the ranking line duplicated between
   `league.js` and `LeagueTable.jsx`; four `lib/` exports used only inside their
   own module; `AddResult.jsx` at 295 against the ~250 guideline; `starts`
   coming off the player page, per `DESIGN.md` → *A figure that cannot differ
   is not a figure*; and the one route left with no `<h1>` — `/matchday` with a
   match open (`DESIGN.md` → *One `<h1>` a page*).
5. **Phase 30 — The cosmetic review: Players and Records.** Partly answered —
   Phase 33 was the badge half. What is left is everything on those two pages
   that isn't a badge. Screenshot at 375px and 1400px, list the findings, one
   branch per page. **Done means** two short phases appended with real
   findings, or a line saying a page had none.
6. **Phase 53 — Availability for the next fixture.** The one genuinely missing
   feature, and the only thing on this list that would make the site a tool
   rather than a record. Needs a public write path, which the current "every
   write requires an admin login" model has no room for, so it is a schema and
   RLS decision before it is a UI one. Do not start it as a UI job.
7. **Phase 54 — About, and how to join.** A paragraph and a way to get in
   touch. Parked for a year on "needs a photo worth showing"; that was the
   wrong test, because words with no photo beat the nothing that is there now.

---

## The redesign — what went wrong

Phases 56 to 64 were agreed against a reference site (the Northern Premier
League's club pages) and signed off as a working mock-up, **Draft D**. They
shipped between 16 and 17 September 2026, every one with `check:layout` green
and its `DESIGN.md` paragraph written, and the result looks nothing like the
mock. Seven findings, kept so none is re-argued; the first is the cause and the
rest are how it propagated.

1. **The mock was never committed.** The planning commit (`0a16c74`) touched
   three markdown files and no HTML. `docs/mocks/` held three Matchday flats
   and a README saying flats exist "so the next session doesn't re-argue a
   decision that was already made" — and Draft D wasn't among them. Eight
   sessions built two pages from a prose description of a picture none of them
   could open. It is in the repo now (Phase 65).
2. **The contract clause licensed every divergence.** This file said, in one
   paragraph, "the mock-up is the specification" and "where this file and the
   mock-up disagree, the mock-up is a picture and this file is the contract".
   Builders took the second sentence. Phase 59's commit says so in as many
   words — "Draft D draws the outlook's rows richer than this … ROADMAP.md's
   own Phase 59 brief calls for reusing the existing primitive" — and
   `DESIGN.md` → *Match outlook* wrote the trade down as a ruling. The clause
   is retired.
3. **The briefs were written to reuse pre-redesign primitives, and the
   pre-redesign rules were never revised.** "Reuse `ResultList`'s compact
   variant rather than adding a seventh scoreline shape"; `.club-plate` with a
   gold *hairline* (read as a top edge); `.block.burnt` because the block
   variants existed; `ChartCard` and Recharts because `DESIGN.md` → *Charts*
   said every chart keeps its *Show data* table at a 320px body; a `<select>`
   because `SeasonSelect` existed. Each builder followed the doc over the
   picture, which is exactly what `CLAUDE.md` told them to do. The mock changed
   those rules and nobody wrote the change down first.
4. **The wrong palette was applied to the wrong things.** Draft D's chart
   colour is **two pigments** — gold and racing green (`--chart-1`,
   `--chart-2`) — plus W/D/L, and its multi-hue series palette appears on one
   chart, the golden boot race. Phase 64 re-stepped the five-series palette
   for lines that label themselves (correctly: the mock's gold is 2.33:1 on
   paper and its teal 3.87:1, both under the 4.5:1 text floor, though its four
   do clear ΔE 15 separation — worst pair 16.8) and then applied that palette
   to every bar, dot and wash on the page. Appearances went dark brown
   (`#4a3a18`), scorelines teal, the scatter plum, the division a pale mint
   wash. A bar carries its figure in ink beside it and never needed a
   self-labelling colour. On Home, `.block.burnt` broke `DESIGN.md`'s own
   "burnt: competition tags, nothing else".
5. **Each element was mapped onto the nearest existing component instead of
   built as drawn.** The last-game *bar* is a `.sheet` with a heading and a
   ruled foot, three times the mock's height. The outlook rows are inline
   chips. The stats cards are full-width `ChartCard`s with `h2`, finding
   sentence and a button, one column, where the mock draws compact
   `.label.ruled` cards two across with CSS bars. The six tiles are
   display-face `StatTile`s inside a card. The division shows both lists at
   once where the mock toggles one. The band sits inside the padded column
   with 50px of paper above it where the mock is flush under the masthead.
   The league snapshot kept ten columns where the mock has five.
6. **Nobody looked.** Every phase's *done means* was a measurement —
   `check:layout` green, budgets re-measured, tests passing — and every one was
   met. None said "matches the mock side by side", and the harness cannot say
   it. Phase 52 (the budgets) was deferred until "the shape is final", so the
   page grew from 1,909px to 5,501px with a note at each step and nobody
   stopped; the mock's compact cards *were* the budget answer and were never
   built.
7. **The docs then declared it done.** This file's *The redesign — done*,
   `CLAUDE.md`'s "The redesign is done — phases 56 to 64", `DESIGN.md`'s
   sections describing each wrong page as a ruling — a fresh session would
   have built the *Next* list on top. The stale *Now — the release* still
   carried a 4 September deadline two weeks after it passed.

**Three findings about the data stand**, and bind phases 66–73 as they bound
56–64:

- **`league_rows` holds totals, not results**, so no other club's form is
  derivable. Phase 60 read that as "no form column"; Phase 73 read it as
  "typed in" — the same class of fact `league_rows` already is — and built it
  that way, with our own row still derived.
- **Five separable hues do not exist for a self-labelling line** inside 4.5:1
  on paper and ΔE 15 under every dichromacy; the series palette is three
  pigments at two depths because of it (`DESIGN.md` → *Chart series*). That
  finding is true and it governs *lines*. It was over-applied — finding 4.
- **`venue` was said to be null on every row and was not** — the fixture's
  were, the live rows had been filled in from the club's records all along.
  **A claim about the club's data is checked against `backups/` as well as
  the fixture.** Phase 56 made the column `not null`.

---

## Page budgets

`DESIGN.md`'s *Page length* table is the authority for the numbers — they are a
design constraint and a component author reads that file. This is the tracking
view. *Now* is `npm run shots` on the `mid-season` fixture at 375px, re-measured
against Phase 52's decisions below.

| Page | Now | Budget | Owner |
| --- | --- | --- | --- |
| Home — unpicked / a name picked / picked, no apps this season | 2,483 / 2,566 / 2,546 | 2,600 | met (52) — moved from 1,600, the pre-redesign figure for a page the mock made a hub rather than a summary |
| Matchday — latest / clean sheet, clamped | 2,468 / 2,758 | 2,800 | met (52) — moved from 2,300, the second move this number has taken; see *Decisions* → *Settled* |
| Matchday — clean sheet, report open | 3,162 | no cap — the clamp bounds the default route, not this one | measured, not capped (52), the same treatment Squad's *Show all* gets |
| Matchday — walkover (no team sheet) | 1,533 | 2,800 | within |
| Season | 2,398 | 2,450 | met (52) — 198 over 2,200; a full league table and an aside are Season's own job, not a shave |
| Season → Stats | 3,107 | 3,200 | met (52) — its own row now, split from Season; a reference page earns length the way Records does |
| Season → Stats, all seasons | 998 | 3,200 | within |
| Players → Leaderboards | 1,296 | 1,400 | met (14, 24) |
| Records → badges / honours / all-time | 1,729 / 1,069 / 1,807 | 2,000 | met (16); badges +62 for the bigger trophies (32–34). Honours is 1,626 on `pre-season`, the taller of its two states |
| Player detail | 2,287 | 2,400 | met (21); +38 for the 40px shelf (33), +8 for *This is me* (48) |
| Opponent detail | 1,259 | 2,000 | met (21) |
| Players → Squad | 2,017 cards (default) / 1,671 list | no cap — it's a roster | measured, not capped (17, 24, 33) |
| Players → Data centre | 2,584 | no cap — it's the reference table | measured, not capped (22, 24) |

---

## Decisions

**Open.** None — Phase 52 closed the last two.

**Settled, and worth knowing before you touch a scoreline.**

1. **Matchday's budget moves to 2,800px; the clean-sheet report's open state
   is uncapped** (Phase 52). The tape (Phase 27) put the default route 156px
   over 2,300 and the clamped clean-sheet route 458px over; both are real
   content the 2,300 figure never priced in, so the number moves the way it
   did in Phase 25 rather than asking the tape to shrink. The report's own
   *open* state (3,162px) gets no budget at all — the clamp already bounds
   what a reader lands on by default, and an admin choosing to read the whole
   report is the same kind of choice as Squad's *Show all*.

2. **Season moves to 2,450px; Season → Stats gets its own row at 3,200px,
   split from Season** (Phase 52). Season's 198px over 2,200 is the full
   league table and the aside (season at a glance, the appearances
   leaderboard) — both Season's own job, not a shave. Stats absorbed Charts
   in Phase 61 and, built to the mock, carries nine cards: the golden boot
   race, six per-game tiles, the W/D/L donut, the venue split, scorelines,
   margins, the division's ranked list and the two player charts. A season's
   whole numeric record earns the length Records earns for the same reason —
   it's a reference a reader consults, not a summary a stranger scrolls past
   — so it stopped sharing Season's number rather than shrinking to fit it.

3. **Matchday's budget moves to 2,300px; the ladder does not collapse**
   (Phase 25). Decided before the ladder was built. `DESIGN.md` → *Page
   length* has the argument; the short version is that 1,900 was set for a
   page that was one match plus a stepper, the page now carries the season's
   archive, and 1,900 + ~730px of rungs − ~330px of what they replaced is
   ~2,300.

4. **The rail doesn't move the 375px budget.** Measured at Phase 28: the
   default and clean-sheet routes are 2,456 / 2,746 / 3,150px at 375px, the
   same three figures Phase 27 left, because the rail is a `min-width: 900px`
   change and the budget is stated at 375px.

5. **Score order.** Every scoreline on the site reads goals-for–goals-against,
   ours first. Phase 58 closed the one exception (Home's last result read by
   venue while it staged a scoreboard) and Phase 68 keeps it closed.

6. **The mock wins.** Where `ROADMAP.md`'s description of a phase and the
   committed mock disagree, the mock does, unless the phase names the rule
   that stops it and says what is drawn instead. Settled by Phase 65 after
   eight phases of the opposite reading — see *The redesign — what went
   wrong*, finding 2.

---

## Parked

Named so they don't get lost.

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
- **Form on the full league table** — Phase 73 put it on Home's five-column
  snapshot only; the ten-column table has no room for an eleventh at 375px.
  Above 700px it could carry one. Phase 52's call, with the measurement.

---

## Not on the list

Dark mode, a component library, a CSS framework, an animation library,
server-side aggregation, a sixth nav section. See *Deliberately not doing* in
`DESIGN.md`.
