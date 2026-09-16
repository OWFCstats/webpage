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

## Now — the release

**Deadline: Friday 4 September 2026 — and the squad has it.** They played the
first game of 2026/27 on 5 September and reported a bug on the honours the same
weekend, which is Phase 55 and is now in *Done*. Phases 42 to 48 are done — 48
was the first row of *Next* and was taken early, before the checklist rather
than after it, because it ships in the same build and its own end-to-end check
belongs in the list below. What is left of the launch checklist is not a phase:
it is done on the live site, in order.

**A bug the squad has hit outranks everything under *Next*.** That is what
Phase 55 was, and it is the rule from here: the list below is what to do when
nothing is broken.

The three steps that belong to the club rather than the code are all in.
**Self-signup is off** in the Supabase dashboard, and so is anonymous sign-in —
that second one matters as much, because RLS grants writes to any
`authenticated` role and an anonymous sign-in creates one. **The domain is
live** at `oldwellingtoniansfc.com`, which was Phase 47. **A GoatCounter account
exists**, and everything else about the counter landed in Phase 45; setting its
two values as repository variables is step 1 below, and the only one of the
three still worth checking rather than assuming.

### Launch — a checklist, not a phase

42–48 are in. Do these in order and stop at the first one that fails.

1. Set `VITE_ANALYTICS_SRC` and `VITE_ANALYTICS_ATTR` as repository variables
   from the club's GoatCounter account — README → *Counting usage* has both
   values. The code is done; these are the switch.
2. Deploy from `main`; the Actions run is green.
3. Paste `https://oldwellingtoniansfc.com` into a chat with yourself; the card
   renders with the crest. CI holds the origin the card is fetched from now, so
   what this is checking is the image itself and the certificate.
4. Open the site cold; GoatCounter shows **one** view of `/` — two means
   `no_onload` isn't taking. Open a player page from the leaderboard; it shows
   `/players/:playerId` and a `player-page` event, and no UUID anywhere.
5. Pick your own name on Home, reload, and it is still there; open your page
   from it and the event is `my-page`, not `player-page`. That is Phase 48 end
   to end — the cookie, the card and the split it exists to make countable.
6. Add to Home Screen, open it from there, then turn wifi off and open it again.
7. Enter a result through the wizard on a real phone; it lands on Matchday.
8. Send it to the squad.

---

## Next — after launch, in this order

One line each. A phase gets written out in full when it is picked up, not
before — that is what keeps this file short.

1. **Phase 36 — Losing a form on a phone.** Nothing on the write side warns
   before it drops what you typed. The wizard holds four steps in memory and
   writes on the last one, so a stray tap on the bottom bar loses the lot; the
   lineup editor, the league grid and the report editor are the same.
   `beforeunload` covers a reload and a closed tab, not the tap that actually
   does it — in-app navigation needs `useBlocker`, which React Router only gives
   a data router, and this app is on `<HashRouter>`. A routing change first and a
   dialogue second, which is why Phase 35 left it. **Done means** leaving a
   half-filled form asks first, at 375px, on every write page — or an argument
   here for saving a draft instead.
2. **Phase 49 — Sharing a link from inside the app.** `navigator.share` on a
   match, a player and a badge. The site's whole distribution model is being
   pasted into the group chat, it has an `og:image` built for that, and
   installed to a home screen there is no address bar to copy from.
3. **Phase 50 — A season's fixtures in one screen.** `MatchForm` takes one match
   at a time at six fields each, so a sixteen-game season is about a hundred
   fields on a phone. Wanted before next season, not this one.
4. **Phase 51 — The cleanup pass.** Dead CSS (`.milestones`, `.show-all`,
   `.badge-num`, `.admin-bar`, `.fixture-location`, `.scored-row`);
   `owfchomedashboard.patch`, 1,093 lines at the repo root patching a
   `src/styles.css` that Phase 1 deleted; the ranking line duplicated between
   `league.js` and `LeagueTable.jsx`; four `lib/` exports used only inside their
   own module; `SeasonCharts.jsx` at 374 lines and `AddResult.jsx` at 295
   against the ~250 guideline; `starts` coming off the player page, per
   `DESIGN.md` → *A figure that cannot differ is not a figure*; and the one
   route left with no `<h1>` — `/matchday` with a match open, where the nearest
   line to promote sits in `.sb-head`'s flex row and needs a margin reset,
   which is why Phase 44 left it (`DESIGN.md` → *One `<h1>` a page*).
5. **Phase 52 — The budgets, settled.** Home, Matchday and Season are all over,
   and two of the three have been open since Phase 27. Decide
   each one: move the number with an argument the way Phase 25 did, or cut a
   section. See *Decisions* → *Open*, which this phase closes.
6. **Phase 30 — The cosmetic review: Players and Records.** Partly answered —
   Phase 33 was the badge half. What is left is everything on those two pages
   that isn't a badge. Screenshot at 375px and 1400px, list the findings, one
   branch per page. **Done means** two short phases appended with real findings,
   or a line saying a page had none.
7. **Phase 53 — Availability for the next fixture.** The one genuinely missing
   feature, and the only thing on this list that would make the site a tool
   rather than a record. Needs a public write path, which the current
   "every write requires an admin login" model has no room for, so it is a
   schema and RLS decision before it is a UI one. Do not start it as a UI job.
8. **Phase 54 — About, and how to join.** A paragraph and a way to get in touch.
   Parked for a year on "needs a photo worth showing"; that was the wrong test,
   because words with no photo beat the nothing that is there now, and this is
   the only thing serving the community third of the vision.

**The redesign below comes before all eight of these.** It is the one piece of
work with an agreed design behind it rather than a paragraph, and four of its
phases close budget rows that Phase 52 would otherwise have to argue from
nothing.

---

## The redesign — phases 59 to 64, in order (56, 57 and 58 are done)

Agreed against a reference site (the Northern Premier League's club pages) and
signed off as a working mock-up: **Draft D**, two pages at two widths, real
2025/26 figures throughout. The mock-up is the specification. Where this file
and the mock-up disagree, the mock-up is a picture and this file is the contract.

**What the redesign is for.** Home currently opens with a result a reader has
already seen and buries the fixture that decides whether they turn up. The
redesign puts the next match at the top with a countdown against it, folds the
result into a bar beneath, and turns Season's two chart-shaped sub-pages into one.
It does not add a section, a colour, or a stored column.

**Three findings from the data model bind every phase below.** They were checked
against `supabase/schema.sql` and the committed fixture, not assumed:

1. ~~**`venue` is nullable and is null on all fourteen 2025/26 rows.**~~ **Closed
   by Phase 56**, and it was half wrong when it was written: the fixture's venues
   were null, but the live database's were not — they had been filled in from the
   club's records some time before, and checking the fixture alone missed it. The
   column is `not null` now, the club's real H/A is in the import SQL and so in
   the fixture, and every write path requires one. Home and away is safe to build
   on: the fixture card's team order, the H/A letter in any list, and the goals
   split. **Check a claim about the data against `backups/` as well as the
   fixture** — the fixture is a frozen parse and the backup is the club.
2. **`league_rows` holds totals, not results.** Played, won, drawn, lost, goals
   for, goals against, per club per season. There is no way to derive another
   club's last five, so a form column across the whole table is not buildable.
   Phase 60 decides between our own row only and no column at all.
3. **The `--series-*` tokens fail colour-blind separation when four are used at
   once.** `--series-2` against `--series-4` is ΔE 4.9 under protanopia and
   `--series-2` against `--series-1` is 12.5 for normal vision, against a floor of
   15. Phase 64 re-steps them. `DESIGN.md` → *Chart series* carries the finding.

**Reading the model column.** Effort is the reasoning-effort setting, not a
separate model: `xhigh` is Claude Code's default for coding and the right setting
for anything with a derivation or a route in it; `high` is the sweet spot for
work whose shape is already decided and where the risk is typos rather than
judgement; `medium` is for mechanical edits. Raise it, never lower it, if a phase
turns out to be load-bearing. Sonnet 5 is named where the work is CSS and markup
against a mock-up that already answers the design questions; Opus 5 where getting
it wrong is silent (a derivation, a redirect, a schema change, a chart scale).

---

**Phase 59 — Match outlook, and Home's grid.** Recent results and upcoming
fixtures become one card: the last three and the next three, with `TBC` rows
filling the gap so the card keeps its height when the diary is short. *Your
season* moves directly under the band, above everything else. Below it, a
two-column grid on desktop: outlook on the left spanning both rows, the league
snapshot and *Season so far* stacked on the right, the three ending on one line.
Reuse `ResultList`'s compact variant rather than adding a seventh scoreline
shape. **Files:** `components/home/MatchOutlook.jsx` (new, replacing
`RecentForm.jsx`), `pages/Home.jsx`, `styles/pages/home.css`. **Done means** the
outlook card is the same height with one fixture in the diary as with three, and
Home's three budget rows are re-measured into the table below. **Docs:**
`ROADMAP.md` → *Page budgets*. **Model:** Sonnet 5 · high.

**Phase 60 — The league snapshot's form column.** Small, and mostly a decision.
The mock-up shows five coloured chips on every row; finding 2 above says only our
own row can have them. Either show the column with our row filled and the rest
blank, which is honest and looks broken, or drop the column and keep the chips on
the form card alone, which is the recommendation. Whichever wins, the snapshot
stays a snapshot: the rows around us and a link out, with the full table on
Season. **Files:** `components/LeagueTable.jsx`, `styles/components/league-table.css`.
**Done means** the decision is written into `DESIGN.md` with the reason, so the
next session does not re-derive it from the mock-up. **Model:** Sonnet 5 · medium.

**Phase 61 — Charts becomes Stats.** `/season/charts` merges into `/season/stats`
and Season has two sub-pages rather than three chart-shaped ones. The season
filter lifts above the segmented control so it holds across both, and gains *All
seasons*. **The overlap with Records is the real decision here**: Records →
All-time exists to be the one place every season combines, so *All seasons* on
Season must mean season-by-season comparison, not all-time totals, or the two
pages say the same thing twice. That is the same trap the Players/Records split
was built to avoid, and `CLAUDE.md` says so. `/season/charts` needs a redirect
shim; `App.jsx` already carries seven. **Files:** `App.jsx`, `pages/Season.jsx`,
`components/season/SeasonCharts.jsx`, `scripts/site-map.js`. **Done means** the
old address still lands somewhere sensible, the filter survives a tab change, and
no figure appears on both Season and Records → All-time meaning different things.
**Docs:** `CLAUDE.md` → *Sections* table, `DESIGN.md` → *Sections do not grow*.
**Model:** Opus 5 · xhigh — routing, a redirect, and an information-architecture
call that is expensive to reverse.

**Phase 62 — The season's own numbers.** Six per-game tiles (played, scored per
game, conceded per game, both teams scored, clean sheets, players used), a W/D/L
donut, the most frequent scorelines, and the winning and losing margins. All of
it derives from `matches` alone, the goals home/away split included — Phase 56
landed, so that card is in rather than conditional. W/D/L keeps `--win`, `--draw` and `--loss` in
every chart on the page and is never themed. **Files:** `components/season/`,
`lib/matches.js`, `styles/components/charts.css`. **Done means** every figure is
derived at load time with no new column, and the page holds at 375px. **Model:**
Sonnet 5 · high.

**Phase 63 — The division, ranked.** Attack and defence across every club in the
division, from `league_rows`: goals for over played, and goals against over
played, sorted best first with our own row picked out in gold and the division
average marked. Free from standings an admin already types in each week, which is
the whole argument for it. One season at a time, because `league_rows` is scoped
that way. **Files:** `lib/league.js`, `components/season/DivisionRatios.jsx` (new).
**Done means** a division with a club on a different number of played games still
ranks correctly, since the ratio is per game and the table is not always square.
**Model:** Opus 5 · xhigh — it is a derivation over other clubs' data and a wrong
divisor is invisible.

**Phase 64 — The charts, and the series palette.** Three charts under the
division table: the golden boot race (cumulative goals by matchday, one line a
player, direct labels at the line ends), games against contributions (a scatter,
dots sized by how many players share a spot, a dashed one-a-game reference), and
the appearance distribution (how many players played how many games). Also
re-step `--series-1` to `--series-5` per finding 3 and re-validate. A chart is
drawn once at a canvas that fits 375px and scales up, never a wide canvas scaled
down: that was the bug in the mock-up's first cut, where a 700-unit canvas put
its labels at 5px on a phone. No horizontal scroll, on the chart or the page.
**Files:** `components/season/`, `styles/components/charts.css`, `tokens.css`,
`lib/tokens.js`. **Done means** the palette passes a colour-blind separation check
before it ships, every chart fits 375px with no sideways scroll, and chart labels
and the card's own headings are the same size as each other on a phone. **Docs:**
`DESIGN.md` → *Chart series* and *Charts*. **Model:** Opus 5 · xhigh — SVG
geometry, a scale that has to be right, and a palette that has to be measured
rather than judged.

---

**One branch a phase, in this order.** 56 blocked 57 and still blocks 62. 57
and 58 are one screen between them and should be reviewed together even though
they land separately. 61 blocks nothing but should come before 62 to 64, so
those three land on the page that is going to keep them.

**Each phase condenses to one *Done* row in the commit that closes it**, per the
rule at the top of this file, and writes its own ruling into `DESIGN.md` in the
same commit as the code.

---

## Page budgets

`DESIGN.md`'s *Page length* table is the authority for the numbers — they are a
design constraint and a component author reads that file. This is the tracking
view. *Now* is `npm run shots` on the `mid-season` fixture at 375px.

| Page | Now | Budget | Owner |
| --- | --- | --- | --- |
| Home — unpicked / a name picked / picked, no apps this season | 2,413 / 2,499 / 2,487 | 1,600 | **Phase 52** — measured after Phase 58 added the form card to the club band. Losing the last-result board (folded into `LastGameBar`'s paper bar) gave some of that back, but the band now carries two plates rather than one, and the net is still well over budget. The pre-57 drift between this table's old figures and `DESIGN.md`'s was never reconciled and neither 57 nor 58 touches that question. **Phase 52 re-measures all three before it decides anything**, since a budget argued from a stale figure is the thing this table exists to prevent. Three rows because they are three states of one page, and only the first is what a stranger sees |
| Matchday — latest | 2,456 | 2,300 | **Phase 52** — 156 over; head to head's tape, real content the old card didn't carry. The rail doesn't move this: the budget is stated at 375px and the rail is a >=900px-only change |
| Matchday — clean sheet (12 named, a report, clamped / open) | 2,746 / 3,150 | 2,300 | **Phase 52** — 446 over clamped; the clamp bounds it, it doesn't fit it. Same as above, untouched by 28 or 31 |
| Matchday — walkover (no team sheet) | 1,533 | 2,300 | within |
| Season | 2,494 | 2,200 | **Phase 52** — 290 over; Phase 29's `SeasonLadder` reuse took 734px back, see *Decisions* → *Open* |
| Season → charts | 1,909 | 2,200 | met (18) |
| Players → Leaderboards | 1,296 | 1,400 | met (14, 24) |
| Records → badges / honours / all-time | 1,729 / 1,069 / 1,807 | 2,000 | met (16); badges +62 for the bigger trophies (32–34). Honours was 1,155 and is 1,069 because Phase 55 leaves the season being played with no winners under its four trophies — 1,626 on `pre-season`, which is the same page with two seasons on the shelf and both published, and the taller of the two states |
| Player detail | 2,287 | 2,400 | met (21); +38 for the 40px shelf (33) and +8 for Phase 48's *This is me*, which used to cost 54 and now sits in the hero's top-right corner rather than a row of its own |
| Opponent detail | 1,259 | 2,000 | met (21) |
| Players → Squad | 2,057 cards (default) / 1,671 list | no cap — it's a roster | measured, not capped (17, 24, 33); the tiles lost 81px to the medallion coming off, despite the drawings growing |
| Players → Data centre | 2,584 | no cap — it's the reference table | measured, not capped (22, 24) |

Home had no phase against it for eleven phases. **Phase 52 owns all four rows**,
and it owns them as a decision rather than a shave: `LeagueTable` and
`RecentForm` alone are most of Home and neither shrinks without breaking a rule,
so closing that gap means cutting a section or moving the number. Same for the
other three.

Phase 48 made Home's row worse on purpose and the phase said so rather than
finding a shave to hide it: `DESIGN.md` → *Home, addressed to the reader* is the
argument for that cost — the figure itself is one of the three Phase 52 has to
re-measure, per the row above — and the two states are listed separately because they
are not the same page — the reader who costs the most is the one this site is
for, and the stranger the budget was written for still sees a single row. That
does not settle anything. **It is now the strongest reason Phase 52 has to cut a
section rather than move a number**, and *Season stats* is the section to look
at first: it is the club's season in figures, at the bottom of the page, under
*Recent form*, which is the club's season in results, on a page whose own `<h1>`
already names the season and which links to *Full season* three times.

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
   **Phase 52 owns this**, and taking it means choosing between the two rather
   than leaving it open a twelfth time.

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

3. **Score order.** Phase 23 made Home read home-first (`1–4` when we are away),
   with a badge marking which side is us, because the last result staged itself
   as a scoreboard and a scoreboard reads by venue. Phase 58 removed the reason:
   folded into a paper bar, it is a result row like any other now, so it reads
   goals-for–goals-against, ours first, the same as every other scoreline on the
   site (`components/home/LastGameBar.jsx`). The site is uniform on this now —
   nothing left open to decide.

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

---

## Not on the list

Dark mode, a component library, a CSS framework, an animation library,
server-side aggregation, a sixth nav section. See *Deliberately not doing* in
`DESIGN.md`.
