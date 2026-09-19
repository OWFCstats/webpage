# Design system

Read this before changing anything visual. If a change needs something this
doc doesn't cover, add it here in the same commit.

**Where a section carries a blockquote naming a phase, that part is decided but
not built yet** — a component written against it will look wrong on `main` until
that phase lands. Everything without a marker is live. The markers come out as
each phase closes; `docs/ROADMAP.md` has the order and what "done" means. A doc
that quietly describes a site that doesn't exist is worse than no doc, which is
why the plan is marked rather than merged in silently.

## Direction

**The honours board and the team sheet.**

The club's own world supplies the vocabulary: names painted in gold on a dark
board in a school hall, a fixture card, a team sheet pinned up in a changing
room, a league table printed in a local paper. Those are objects built for
exactly the two things this site does — making people want their name on
something, and keeping a record that lasts.

Not skeuomorphism. No wood grain, no paper textures, no faux-vintage filters —
that's how a retro reference becomes a dated website. Take the *structure* of
those objects instead: a gilded name on a dark ground, engraved hairline rules,
tabular precision, a nameplate you either have or don't.

Warmth comes from the type, the copy and the badge board. It does not come from
softening the palette or from photography we don't have yet.

Two things sharpen that direction, decided after a page-by-page review:

- **The dark ground is racing green, not near-black.** `#16281f`. Leather,
  wealth, a board in a school hall — and it answers the objection to black,
  which is that a near-black surface makes a small club's site feel like a void.
  It warms the dark rather than removing it, and gold sits better on it.
- **The label device comes from the school's own brand**, which is bold text on
  a solid field of colour. That replaces the tiny uppercase eyebrow, and it is
  the one place the design is allowed to be loud.

### What this replaces

The site read as templated for four specific reasons, and the system below
exists to fix each one. All four are done.

| Problem | Fix | |
| --- | --- | --- |
| One typeface (Manrope) at weight 800 doing every job | A display face, a text face, and a condensed face for data | done |
| Twelve near-identical tiny-uppercase label styles (0.62–0.75rem) | One label style. 0.75rem is the floor | done |
| Three overlapping palettes (CSS tokens, a chart `SERIES` array, per-component hex props) | One token set. No hex literals in components, ever | done |
| One `.card` class on all ~40 surfaces equally, whatever the section is | Two surfaces with a rule about when each is used, and a third for badges | done |

Those four were about *how the site is built*. A later review found four more
that are about *what a page says*, and the system below now covers them too.

| Problem | Fix | Phase |
| --- | --- | --- |
| Warm cream ground, high-contrast serif, terracotta accent — the current generated-design default, arrived at by assembling tokens rather than choosing them | The brand's own three colours, aged, on a cool ground; Caslon for the display face | 11 |
| A match result written as running text, so it wraps mid-name and never lines up: 14 rows of Season, 5 club records, Home's form list | One result row on a shared grid | 10 |
| Four heading treatments across 30 sections, and 15 blocks of explanatory prose | One block device, one grammar, no essays | 12 |
| 24 badge plates of which 19 said "Nobody yet", with unearned silver identical to unearned gold | Three classes of badge; only one is tiered | 15 |
| Ten drawings recoloured into forty badges through four metal ramps, with a dark disc behind the light ones | Twenty-two drawings, one per badge per tier, served as images | 32 |

`.card` is gone. Most surfaces in the site are `.sheet` and a handful are
`.board`, and the judgement that split them is the rule under *Surfaces* below.
The exact tally is deliberately not written down here: it was "fifty and five"
for three phases after it had stopped being true, and a number no one updates is
worse than no number. **There is no
third surface.** The plate was one — a box every badge was cut from — and
Phase 15 replaced it with a drawing that needs no box at all, which is what lets
the same badge sit in a hero band, in a card and in a list.

One invariant is worth keeping, because it is what stops a fourth surface
arriving by accident: **no class whose name contains `card` draws a surface.**
Several survive as names for objects and layouts — `.card-foot` is the footnote
at the foot of a surface, `.card-mark` is a yellow or a red card, `.lead-card`,
`.chart-card` and `.season-card` name components, and `.season-cards` and
`.player-cards` are grids. Every one of them either sets
padding on an element that already carries `.sheet`, or lays out a row. The only
one that touches colour is `.season-card.best`, and it re-tints a sheet rather
than defining one.

So if a rule named `…card…` ever grows a `background`, a `border` and a
`border-radius` together, that's the system drifting back, not a special
case.

## Structure

Three decisions about what a page shows, before any decision about how it looks.

### Sections do not grow; they gain depth

Five sections, and that does not change. What changes is that a section may have
**sub-pages**, reached by a segmented control at the top of it, each with a real
address. Tapping a bottom tab lands on the section's default sub-page.

| Section | Sub-pages | Default |
| --- | --- | --- |
| Home | — | — |
| Matchday | — | — |
| Season | Season · Stats | Season |
| Players | Leaderboards · Squad · Data centre | Leaderboards |
| Records | Badges · Honours · All-time | Badges |

This extends a pattern the site already runs twice rather than inventing one. A
dropdown on the bottom bar was rejected: a tap that opens a menu instead of
navigating is the thing people dislike most about mobile nav. Sub-pages get real
addresses because links into a group chat are how this club actually shares
things.

**Who owns what**, since three sections used to overlap: Home is the landing
page and answers "what's happening". Season owns one season's detail. **Players
is this season's leaderboards; Records is all time.** Records also owns
everything above a single season — badges, honours, club records — and its three
sub-pages are that split made visible: **Badges** is the signature and the way
into a badge's own page, **Honours** is who won what season by season, and
**All-time** is every season's numbers together.

**Season's filter sits above the segmented control, and *All seasons* is Stats'
alone.** Above, because it scopes the section rather than the sub-page: the year
a reader picked survives the tab they switch to. *All seasons* stops at Stats
because the Season sub-page is one season as a whole, and every all-seasons
answer it could give — career appearances, every result on record — is already
Records'. On Stats the option means **season against season**: one line a
season, side by side on a shared matchday axis. It never means the seasons
added up, which is the distinction the Players/Records split exists to hold,
and it is why the scoring race and the goals-per-match line don't draw in that
mode — run across every season they stop comparing and start totalling. The
Season tab drops `?season=all` rather than bouncing a reader back to Stats, and
`/season?season=all` — the shape of a link from before the option moved — lands
on the comparison.

### The frame outlives the page

The masthead, the tab bar and the footer belong to the site, not to whichever
route is open, so **nothing a page does may unmount them**. Waiting and failing
are both states of the page column: the spinner goes where the page would have
been, and so does the message when it doesn't arrive.

Stated because the site broke it in the ordinary case, not the exotic one. The
admin section is fetched on demand — that is the point of splitting it out — and
the Suspense boundary those routes need sat around the whole router, outside
`Layout`. So tapping **Add result** on a phone unmounted the entire document
while the chunk downloaded: a spinner alone on empty paper, for as long as the
signal took. And if the chunk never came — a dropped connection in a pub car
park, or a tab left open across a deploy that renamed it — the import rejected,
nothing caught it, and React emptied `#root` for good. A white page with no
crest, no nav and no way back but knowing to pull down and refresh, on the one
flow the club uses standing up on a Saturday night.

So `components/Layout.jsx` holds both boundaries, inside `<main>` and therefore
inside its pathname key: a `<Suspense>` for the wait and a `<ErrorBoundary>` for
the failure, the second clearing itself on the next navigation because the key
remounts it. A page that fails says what to do next — reload — and the frame
around it still works.

The rule the fix is really an instance of: **a page reports its own trouble.**
Every public page renders `ErrorNote` when the load failed; the admin pages did
not, so a failed fetch opened the wizard over empty arrays — a diary with no
fixtures in it and a squad with nobody in it, and no clue why. Add result reads
the error now. The rest of the write side is still to do.

**Reporting trouble is the last resort, not the first.** `DataContext` retries a
failed load twice — 600ms, then 1.5s — before it sets `error` at all, because
most first-load failures are a second old: a phone waking on a bad signal, or a
token the API briefly refused. Saved to a home screen the site has no address
bar, so an error note there is not a prompt to reload, it is the end of the
visit.

### An installed app has to open with no signal

`public/manifest.webmanifest` sets `display: standalone`, so the site installs
to a home screen and opens with no browser chrome. That is the shortest route
the squad has to it, and it used to be a promise the site couldn't keep: with no
service worker, an installed app on a bad signal showed the browser's own
offline page. Inside a standalone window that page has no address bar, no back
button and no reload the reader can find. The section above worries about an
error note being the end of the visit; this was worse, because the frame the
section is about never rendered at all.

So the site caches its own shell — the document, the bundle, the CSS, the fonts,
the crest, the badge drawings — and serves that when the network fails, with the
"no connection" note in the page column where the spinner and `ErrorNote`
already go. The frame outliving the page is the same rule, one layer down.
`public/sw.js` is the whole of it and its header is the design; `lib/offline.js`
registers it, in a production build only.

**Network-first, and this is not a preference.** A cache-first worker on a
static host with no server is how a squad ends up pinned to a build from three
weeks ago, and the club has no channel for telling thirty people to clear a
site's storage. Every request tries the network and only falls back to the
cache; a response that arrives refreshes the cache on the way past. The cache
fills as the reader passes through it rather than from a list built at deploy
time, so the visit that can open with no signal is the second one — which
installing to a home screen and opening it already is.

**Same-origin GETs only, and that is the whole exclusion rule.** Every read and
write of club data, and the login behind them, is a cross-origin request to
Supabase, so no row, no token and no session can reach the cache — not because a
list of paths says so, but because those requests are never handled. A shared
phone in a pub is a realistic way for this site to be read.

**A new deploy evicts the old one.** `index.html` names its assets by content
hash, so a document that differs from the cached one *is* a new build, and the
worker empties the cache before storing it. Without that the cache keeps a copy
of every build the club has ever pushed; nothing breaks, but the site's storage
grows by itself on every push to `main`.

**And the error note is no longer a dead end.** `DataContext` listens for
`online` while it is showing one, and re-reads when the signal comes back. There
is no reload on a home-screen app, so before that the only way out of a failed
load was killing the app.

### What the site remembers, and what it doesn't

Two kinds of state, and conflating them is the mistake this section exists to
prevent.

**The admin session is authentication.** A Supabase login, a token, and write
access to every table enforced by RLS. It lives in cookies rather than
`localStorage` (see `lib/cookieStorage.js`) and it is the only thing on the site
that grants anybody the right to change anything.

**A reader's own name is a preference.** A player taps their name once and the
site keeps that player's id on their phone — one cookie, `owfc.me`, written
through the same adapter (`lib/me.js`). No account, no password, no row in the
database, and nothing sent to the server. Home then leads with their own
figures — apps this season, the next badge and how far off it — which is what
turns the front page from a club noticeboard into something addressed to the
person holding the phone. See *Home, addressed to the reader* below for what it
says and *A name is a link* for where the tap is offered.

It is worth being blunt about what that preference is not. It is not secure and
does not need to be: every figure on this site is already public and read-only,
so the worst case is picking the wrong name and seeing the wrong stats
highlighted, which is fixed by picking again. It is per-device, so the same
player on a phone and a laptop picks twice. Clearing site data loses it. All
three are acceptable, because the alternative is thirty accounts and thirty
forgotten passwords for a read-only stats site, and that is the version of this
feature that never gets used.

**No `localStorage`, no `sessionStorage`, anywhere.** Cookies only, through the
adapter in `lib/cookieStorage.js`. The rule predates this section and existed
only as a comment in that file, which is how it nearly got broken by the
feature above. A "me" pick is a cookie for the same reason a session is.

The service worker's cache is the one other thing the browser holds for this
site, and it is not an exception to any of the above: it holds files the site
serves — the document, the bundle, the fonts, the artwork — and not one thing
about the reader. See *An installed app has to open with no signal*.

### Draft D is the specification

`docs/mocks/home-stats-draft-d.html` — two pages at two widths — is the
specification for Home and Season → Stats, and everything it decides is built.
Phases 57–64 built both pages from a prose description of that mock instead of
the mock itself, and the pages didn't match it; phases 66–73 rebuilt them
against the mock directly, and the sections below describe what actually
shipped. `docs/ROADMAP.md` → *The redesign — what went wrong* has the seven
findings from the first pass. Where a paragraph below and the mock still
disagree, the mock wins unless the paragraph names the rule that stops it and
says what is drawn instead.

What the mock decided, as rules rather than as a picture:

- **Two pigments for every bar, wash and split: `--chart-1` (gold) and
  `--chart-2` (racing green, `--board-soft`).** W/D/L keeps its three. The
  five-series palette under *Chart series* is for a line that labels itself
  and appears on one chart, the golden boot race. A bar carries its figure in
  ink beside it and never needed a 4.5:1 colour. (Phase 66)
- **The band is flush under the masthead** and, with the last-game bar under
  it, runs edge to edge below 700px and spans the viewport above it, contents
  in the 1400px column. These two strips are the site's only full-bleed
  sections. **The plates carry a 1px gold border all round**, not a top edge.
  (Phase 67)
- **`.block` on Home is gold.** Burnt stays what *Accents* says it is —
  competition tags — and the mock's competition mark is `.tag`. (Phase 66)
- **A card head is `h2` in the display face at `--t-subtitle` with a `.more`
  link on the right** (`.head`), and a `.label` above the `h2` only where it
  says something the heading doesn't. *Standings* over *League table* is the
  eyebrow *The block* ruled out in Phase 12; *The division* over *Attack and
  defence* is not. The compact stats cards take `.label.ruled` and nothing
  else. (Phase 66)
- **A tile is a `.tile`**: `--sheet` ground, the figure in `--font-data` at
  `--t-subtitle`, a label under — Home's stat tiles, Your season's, Stats' six,
  and the countdown cells with the figure in the display face. Never a
  display-face `StatTile` inside a sheet. (Phase 66)
- **The form card**: the season and division as its `.label` (Home's `h1`),
  the position at `--t-display`, *of N · P points*, then five 62px squares with
  14px corners in a capped strip, the latest ringed gold, the scoreline under
  each. (Phase 67)
- **The fixture card**: 46px round badges with *Home* / *Away* under the
  names, kick-off in the display face at `--t-title`, the ground balanced
  under it, the date ruled, three display-face countdown cells, two equal
  buttons. (Phase 67)
- **The last game is a bar**: one wrapping row on `--sheet` with a 2px gold top
  — pill, score, *v Opponent · date*, *Goals* and *Man of the match* as labels
  over linked names, *Full match →*. No heading, no rule inside. (Phase 68)
- **The outlook is rows, not chips**: date over competition, a score chip with
  a W/D/L edge, the opponent with the scorers or the ground under, H/A —
  `ResultList`'s `outlook` variant. (Phase 69)
- **The league snapshot is five columns**: position, club, played, points,
  form. The form column is typed for every other club and derived for ours;
  the ten-column table stays on Season. The mock's own snapshot needs 385px
  at 375 and hides 76px of itself, so the metrics are ours: the club name
  wraps and the cell padding tightens below 480, and below 360 the card gives
  its padding back the way the full table already did. (Phases 69, 73)
- **Season so far is the record**: won, drawn, lost as three display-face
  figures coloured by result with a percentage under, then *For* / *Against*
  bars. Played, clean sheets and win rate are Stats' tiles. (Phase 69)
- **Stats is compact.** A chip filter over the segmented control; six bare
  `.tile`s; four small `.label.ruled` cards two across — donut with a ruled
  key, home/away goals split, scorelines and margins as CSS bars; the division
  as **one** ranked list behind an *Attack | Defence* toggle with the average as
  a note under it; the golden boot race full width with a legend above and end
  labels; the scatter and the spread two across. **A card whose every figure is
  printed on it needs no data table**; the three plots keep theirs behind a
  quiet *Data* link in the foot. The goals-per-match line comes off; *Points
  accumulated* draws under *All seasons* only. (Phases 70–72)
- **The scatter's dots are `--verdigris-deep` at 0.75 alpha and the leaders
  gold with a surname beside them; the spread's bars are gold.** The leaders
  are the top five by goals + assists, which is what the mock draws — not the
  players above its own diagonal, which is what Phase 72's description said and
  is a different five (*Charts*). (Phase 72)
- **The mock's burnt `#a83a17` is not a series colour.** It was measured
  against the palette and collapses into the brass under tritanopia at ΔE 2.0,
  so the fourth line stays deep brass (*Chart series*). (Phase 72)
- **The drawings are made at the width they are shown at, not scaled down from
  a wide canvas.** Draft D's charts are one `viewBox` each and compensate for a
  phone by drawing their type larger; at 375px that still lands at about 10px,
  under the site's 12px floor, which `check:layout` asserts. So the mock's
  shape and proportion are followed and its technique is not. (Phase 72)

### The club band, under the masthead

The first thing on Home, flush under the masthead and full-bleed
(`main.page:has(> .home)` drops the page's own padding and column for Home;
`.club-band-inner` re-applies the same 1400px column and gutters inside the
band's own dark ground, the way `.home-column` does for everything under it).
Two paper plates on a 1px gold border all round, stretched to one height past
860px. The first is the next fixture: home side first and away second by
venue, 46px round badges with the crest inside the gold one, kick-off in the
display face between them with the ground under it, the date on its own ruled
line, a live countdown in days, hours and minutes, then *Add to calendar* (an
`.ics` written from the fixture alone, `lib/ics.js`, with a confirmation line
once it's used) and *Match details* — both pinned to the plate's own floor
(`margin-top: auto`), which is what lines the two plates' bottom edges up
without either needing to know the other's height. The second, added in Phase
58 and redrawn to the mock in Phase 67, is the form card: the season and
division as its own first line — Home's one `<h1>`, moved here rather than
dropped — league position in the display face with an ordinal superscript and
the points beside it, then the last five results as a capped strip of 62px
squares, the latest ringed gold — and nothing else: no sentence, no button,
because the fixture plate beside it and the league table two sections down
already carry both.

**The last-game bar is the site's second full-bleed strip.** Redrawn to the
mock in Phase 68: `.last-bar` on `--sheet`, a 2px gold rule on top and a
hairline under, directly beneath the band rather than a card inside
`.home-column` — `.last-bar-inner` re-applies the 1400px column the same way
`.club-band-inner` does. One row that wraps rather than a heading over a
scoreline: the W/D/L pill, the score in the display face, then *v Old Stoics ·
Sat 14 Mar* muted for context, the goalscorers and the Man of the match as
linked names, and *Full match →* on the right. It still reads ours-first —
the pill and our score lead, the opponent and date follow — which is Phase
58's ruling and is unchanged by drawing it as a strip instead of a card.

**The band is chrome, not a fourth surface.** It reuses the masthead's own
`--board` tokens — the same register as the header and the tab bar — rather
than the `.board` surface class, and that distinction is load-bearing: `.board`
is one of the three the system names, its own count of occasions is tracked
(*Board* below), and Phase 58 took Home from five boards to four only because
the band was never a sixth. A paper plate nested inside `.board` is the
box-in-a-box that surface rules out; nested inside chrome that carries no such
rule, it isn't. `.club-plate` composes with `.sheet` and resets `color` back to
`--ink` for exactly this reason — `.club-band` sets `--on-board` for its own
direct text, and without the reset every plain string on the plate would
inherit that pale ink onto paper.

The band's ground runs to the edge of the viewport; nothing else on the site
does, and Draft D is the decision that these two strips are the exception
(Phase 67, *Draft D is the specification*) — everywhere else, `main.page`'s own
column still holds.

### Home, addressed to the reader

Home's second section is the reader's own, under the last result and above the
standings — first screen, no navigating, which is the whole point of it.

**It has three states and shows one.** Unpicked it is a single row asking one
question, because most of the people who ever see it have never played for the
club and a card of blanks is worse than a question; tapping it swaps in the
player search. Picked it takes `.head` — the same primitive every other card's
head does, `h2` *Your season* with the reader's own name as the `.more` link on
the right and *Not you?* beside it as a small secondary — and its figures are
`.tile`s: this season's apps, goals and assists, the ones a player opens the
site to check on a Sunday morning without navigating to find them.

**It used to carry a fourth thing: the nearest career badge, and what it
cost.** Early in a season nearly every player has zero of most things, so the
badge was showing most readers the same grey clean-sheet badge and the same
uninformative "1 to clean sheet" — not the incentive it was meant to be. It
was dropped rather than fixed, because the fix (a badge worth chasing this
early would have to look past the reader's own next rung to find one, which is
a different and more complicated promise than "here's what's next"). Career
totals and the full badge shelf stay one tap away, through the name.

**Three figures and no more.** The obvious next thing is a rank, or a career
total beside the season one, or the club's average to compare against — and
all three are on the reader's own page, one tap away through the name. Home's
job here is to say "you, this season" in one screen of a page that is already
over its height budget — real height, which `ROADMAP.md` → *Page budgets*
tracks.

**The offer is made twice: here, and on the player's own page.** The hero
carries *This is me* in its top-right corner — gold, because it is an offer,
and in the corner because a row of its own put it between the badge shelf and
the career line, which are the two things a player came for — and once it is
taken the name gains a gold *You* tag and the button becomes *Not me?*. A
single toggle labelled *This is me* was tried first and abandoned: on a site
where a gold button *is* the thing to press, no styling of that label reliably
reads as "already claimed". The label says what the tap does; the tag says what
is true.

### Match outlook, and the grid below the band

Phase 59 put the grid below *Your season*: past 900px — the mock's own
breakpoint, not the club band's 860 (Draft D switches the two independently,
`.g-outlook`/`.g-league`/`.g-season` the grid-area hooks) — a two-column grid
puts *Match outlook* on the left, spanning the full height of the league
snapshot and *Season so far* stacked on the right, 1.06fr against the right
column's 1fr. Below 900px all three stack in that same order, one column.

**The outlook is rows, not chips (Phase 69).** `ResultList` gained an
`outlook` variant — the mock's `.ol-row`: date over competition on the left in
`--font-data`, a score chip with a 3px W/D/L edge (or the kick-off time, in
`--gold-deep`, for a fixture), the opponent at 600 weight with a small second
line under it — the scorers for a result, surnames only ("Simeon 2, Pugh,
Wray", from `scorerLine`), the ground for a fixture (`venueTeam(m,
teams)?.pitch_name`) — and H/A on the right. The caller computes that second
line and hands it over as `m.note`; `ResultList` only renders what it's given,
the same way `m.tbc` already worked for a padded empty slot. The last three
results and the next three fixtures each run through it inside their own
`.ol-group`, headed by `.ol-head` — a label on a `--sheet` strip, in place of
the plain `.label` the two groups took under the chips this replaces. **A
short diary still pads out with `TBC` chips instead of shrinking the group**,
so the card is the same height whether the next three fixtures are all in the
book or the season has none left to show.

This replaces the compact **inline** chips Phase 59 shipped instead of the
mock's own row — a trade its own entry defended as "the mock-up is a picture
and this file is the contract" (`ROADMAP.md` → *The redesign — what went
wrong* is the record of what that reading cost across the whole redesign, and
the retired sentence itself). The row above is what the old paragraph here
already asked a future phase to build: an extension of `ResultList` rather
than a seventh scoreline shape.

**The league snapshot is five columns, headed by the division.** `LeagueTable`
gained a `compact` shape for Home: `#` · Club · P · Pts · Form, headed by the
division's own name (*Division 5*) rather than the generic *League table* the
full standings keep, with *Full table →* on the right. Our own row washes gold
with a 3px gold inset on its first cell (`.lt-compact tr.lt-us
td:first-child`) rather than the hover-only tick every other `table.data` row
carries — the wash alone doesn't read as "us" at five columns wide. The full
ten-column table on Season is untouched by any of this and takes no *Form*
column: ten columns is already 309px of the 341 a phone gives it (*Mobile*),
so there is no eleventh.

**The chips are 17px, and the fifth column is what made the snapshot measure
itself.** `.chips` / `.chip` in `components/league-table.css` — the mock's own
size, not the 26px `.form-badge` the form card draws, because five of them a
row across five rows is a different object from one run on a card. Adding the
column took the table from 344px to 385, which is 76px more than a 375px
phone gives it, and the mock is no help: its own snapshot side-scrolls at that
width. So the narrow-width treatment the full table has had since Phase 2 —
the club name wrapping, cell padding at `0.5rem 0.25rem`, the end cells
keeping their inset — stops being scoped to the full shape and covers both;
and below 360, where that still leaves the snapshot 18px short, the card gives
its own padding back to the table the way `:not(.g-league)` already did.
Measured at four widths: 286/294/309/348px of 286/294/309/348 available. At
375 the snapshot still sits inside its card padding, which is how the mock
draws it.

**Season so far is the record.** `SeasonStats` becomes `SeasonSoFar`: won,
drawn and lost as three display-face figures coloured by result
(`--win`/`--ink-soft`/`--loss`) with a percentage under each, then *For* /
*Against* as the same bars the old card drew. Played, clean sheets and win
rate come off — they're Stats' own tiles now (Phase 70), not this card's job
— and so does the *Full season →* link the old card carried: the mock gives
this one no way back to Season beyond the nav.

**Form is stored for the other clubs and derived for us, and that is one
source per row, not two.** Phase 60 read `league_rows` holding totals and not
results as "no form column": only our own row could ever carry the chips, and
one filled row above four blank ones reads as broken data. The constraint was
real and the conclusion wasn't — it was about what `league_rows` *stored*, and
the answer to a fact our rows cannot hold is the one this table already is.
Phase 73 types it in, in the same grid on the same night as the rest of the
row, which is the move Phase 56 made for `venue`.

What keeps it from being a stored aggregate is the split. `leagueStandings`
hands every row a `form` array: for a rival, `league_rows.form` parsed; for
us, `formOf` over our own league results. Our own row's column is never
written — the admin grid shows it read-only, and the save sends `null` for it
— so no row has two sources and nothing can drift. Ours counts league games
only, so it parts company with the form card (*The club band*) the week after
a cup tie, and the table's foot says *form: league only* rather than leaving a
reader to find the two disagree.

The string is up to five of `W`, `D` and `L`, oldest first, so it reads left to
right the way the chips are drawn. A check constraint on the column says so,
the admin input drops anything else as it is typed, and `parseForm` applies
the same rule a third time on the way out: a malformed string draws no chips
at all rather than the part of it that happens to be legible.

### A result is a row, not a sentence

```
[W]  Old Stoics          4–1   H
[D]  Old Salopians       1–1   A
```

Opponent, our score always first, venue as a letter, W/D/L as a chip, all on one
`grid-template-columns` shared by every row. This is a primitive, not a page
style, built as `components/ResultList.jsx`: every scoreline that is a list row
reads from it, plus a compact inline variant for the ones that sit inside
another card's own row rather than a list of their own. Written as prose
it wraps mid-name and puts our own club's name in every row of the season.

### A scoreboard attaches the score to the team

```
[OW] Old Wellingtonians          2
[OS] Old Stoics                  3
       FULL TIME · LEAGUE · [L]
```

Two mirrored rows, not three columns with the score floating between them. The
scoreboard is the one place a result isn't the row above — `components/matchday/
Scoreboard.jsx` keeps its own treatment rather than reusing `ResultList` — but
it had the row's own bug: `2–3` sat in a column of its own, equidistant from
both names and attached to neither, and on a phone it reordered above both
sides into a full-width band, which put more distance between the number and
the team it belonged to, not less. Each row now carries its own score, at
every width, so nothing has to reorder or restack below 700px — the shape that
used to need a `@media (max-width: 700px)` grid swap is now just how the two
rows always lay out.

The pitch address left the scoreboard with it. It only ever repeated the
address already on the opponent's own page (`components/opponent-detail/
PitchDetails.jsx`) and on the "Next up" fixture card that used to sit on the
same page — a result that's already in the book doesn't need directions to the
ground it was played on. Logistics belongs with the fixture, not the trophy
case. That card is gone with Phase 25, and the address it carried now lives
only on the two pages above.

### Matchday is a ladder with one match open on it

The section owns one match at a time, and the archive across the season. Those
used to be two objects stacked on one page — a scoreboard on top, a stepper and a
strip of coloured chips under it, a form strip repeating the chips and a
next-fixture card repeating Home. They become one: **every game of the season is
a rung on a ladder, newest first, and the match being read is a highlighted rung
with its own panel opening off it.**

The ladder carries what a list of games is for — date, opponent, venue, score,
W/D/L — plus the running goal difference after each game, which is what makes it
a season rather than an index. Fixtures sit at the top with no score and no
result. Above 900px the ladder becomes a rail and the match reads beside it: the
first two-column page on the site, and the one thing a stacked page could never
do, which is show the whole season while one match is being read (Phase 28,
corrected in Phase 31).

**A rung is a rung at every width.** The rail is a 344px box holding the whole
ladder, the match is a box beside it, and each keeps its own flow — so the
season runs unbroken down the left however tall the match is, and the open
rung is the same 40px as the fifteen above and below it. Phase 28 built this
as one grid with `display: contents` on `SeasonLadder`'s two wrapping
elements, so a single tree could serve both layouts. It cost more than it
saved: promoting every rung to a grid item put the panel in the open rung's
own *row*, which made that rung stretch a thousand pixels to meet it — the
match a reader picked turned into a gold slab down the rail — and pushed the
rest of the season below the whole panel rather than letting it continue
under the rung. Reparenting is the one thing CSS cannot do to a box, so
Matchday reads the breakpoint in JS (`useIsNarrow`, the hook the charts
already use) and places the match panel in the ladder below 900px and in the
detail column above it. One instance either way; two ordinary boxes.

**Above 1200px the match splits in two**: the squad on the left — the man of
the match and the team sheet, what a player opened the page for — and the
comparison and the write-up on the right. Below that the detail column is one
stack, because half of it is narrower than a team sheet. A walkover has no
squad and no man of the match, which would leave one half empty, so the split
only happens when both sides have something in them.

**The ladder is scoped to one season — the season of the match being read.** It
is that season's archive, so next season's fixtures are not on it, which is the
one thing the next-fixture card used to do that the top rung does not: between
seasons it showed a fixture belonging to a season the rest of the page wasn't
about. Home carries the next fixture across seasons and always did.

**A rung shows the club's own `short_name` below 900px and the full name above
it** — both rendered, one shown, switched in CSS with no JS and no measuring.
`short_name` is a column the schema already has, so this is a name the club
chose rather than a truncation we invent; a club without one keeps its full
name at every width. Below 400px the venue mark comes off the rung as well, the
same single narrow-width exception the league table owns: the scoreboard above
says where this match was played, and every other rung links to a page that
says it.

The panel is, in order: the result on a board, the man of the match gilded on a
plate, the team sheet, head to head, the report. On a phone the team sheet comes
**before** head to head — the squad is what a player opens the page for. Three
things the old page carried are gone rather than moved: the form strip (the
ladder says it), the next-fixture card (the ladder's top rung says it), and
"Worth noting" (its appearance ordinals are a column on the team sheet).

Two marks a name can carry on a team sheet, and no more: a **drawn football** for
a scorer, alongside the goal count rather than instead of it, and a **gold star**
for the man of the match. Drawn, not emoji — every other mark here is engraved or
gilded, and an emoji renders in whatever the phone feels like.

**A report shows its first ~300 characters with the rest behind one control.**
Reports run from two lines to a thousand characters; the long ones used to set the
length of the whole page, which is a page structure decided by whoever wrote it up
on the Sunday.

### A list of records is a ledger

The same idea as the result row, for rows that aren't matches: one grid shared
by every row in the list, hairlines between them, and the figures in a column
down the right so they can be read against each other. Two lists on Records are
this — the club records (`components/records/ClubRecords.jsx`, on `dl.compare`
with the mark beside the record's name and the result row beneath it) and the
season index (`components/records/SeasonIndex.jsx`, one season a row with its
W-D-L and its goals under a head of labels).

Both replaced something that wasn't. Club records were six sheets sized to their
own contents, which put six scorelines in six different places; the index was a
ten-column table hiding 319px of itself. **Reach for a ledger when a table would
need more than about four columns on a phone**, and cut the columns that a
neighbouring section already answers before restructuring the ones that are
left. Past a phone the rows stop stretching rather than spreading a scoreline a
thousand pixels from the name it belongs to; the hairlines still run the full
width, because they are what makes it a ledger.

### The current season is the most recent season with a result

Not the most recent season with a *row*. Fixtures are rows, so entering one
fixture for next season used to abandon the last one and take every derived
figure to zero — four of Home's five sections became empty states in the month a
newcomer is most likely to be sent the link. A season being over is a thing to
label (`2025/26 · final`), not a reason to show nothing.

### A name is a link

Every player's name the site renders links to their player page. No exceptions,
and it is not a decoration: a name is the one thing on the site a player is
looking for, and the badges, the totals and the ranks that make turning up worth
something all live one tap behind it. Ten components got this right and
Home's last result (`LastGameBar`, `LastResult` before Phase 58) didn't — on
the first screen, where `CLAUDE.md` says what the squad is owed is the last
result *and a name*. A name that can't be tapped is half of that.

Two names are deliberately not links, because the page they would go to is the
page you are on: the club's own row in the league table, and the player whose
page is already open.

The reader's own name on Home is a link like any other — the `.more` link on
*Your season*'s own `.head` since Phase 68 — and it is the one place on the
front page that leads to the reader's own page, which is where everything the
card has room for one line of is written out in full.

### One `<h1>` a page, and it names the page

A route has one, and it says what the page is. Home had none — three `<h2>`s
under nothing, on the page that gets pasted into the group chat and indexed —
because the line that had always been its title was marked up as a `<p>`.
Promoting that line was the whole fix.

Home's `<h1>` names the **season**, not the club, and that is the general rule
rather than an exception: the masthead says the club on every route, so a page
heading that says it again is the eyebrow problem in a different font (see *The
block*). Phase 19 settled this once already — *Home leads with the result, not a
repeated club name* — which is why the fix was promoting that line and not
adding a heading above it. Where a page has no season to name,
`Old Wellingtonians FC` is the fallback, as on Matchday before a season starts.

A heading is not obliged to be the display face. Home's takes `.label` and drops
`h1::after`'s gilded rule, because marking up a heading correctly should not
move the page: the first screen belongs to the result underneath it, and Home is
the page furthest over its length budget.

**One route still doesn't meet this: `/matchday` with a match open.** Its two
empty branches both have an `<h1>`, but `Scoreboard` carries no heading at all,
so the played-match page — what Home's own result links to, and every row of
every result list — has none.
It is not the same one-line fix Home's was: the nearest line is the `.label`
inside `.sb-head`'s flex row, which needs a margin reset to be promoted without
shifting the row, on the page 156px over its own budget. That is a Matchday
decision rather than a front-door one, so it is listed under *Next* in the
roadmap instead of being taken here.

## Colour

Every colour lives in `styles/tokens.css` as a custom property. A hex literal in
a component or passed as a prop is a bug.

Two things follow from that, because a token can't be written down twice:

- **A tint is `color-mix()` off a token**, never a second literal —
  `color-mix(in srgb, var(--gold) 12%, transparent)` for the gold wash on a
  highlighted row. Change the gold and every wash follows.
- **JavaScript reads tokens, it doesn't hold them.** Recharts and the
  sparklines put colours in SVG attributes, where `var()` is invalid, so
  `lib/tokens.js` reads the computed value off `:root`. It also owns the one
  place that says which token a stat wears, so goals are the same brass on a
  leaderboard bar, a sparkline and a chart line.
- **`index.html` is the one file that writes a hex down.** `<meta
  name="theme-color">` paints the browser's own chrome, which is outside the
  document and can't read a custom property, and the manifest is JSON that CSS
  never sees. Both carry `--board`. It is the same exception `lib/tokens.js`
  is, and it is spelled out here so the next person doesn't quietly add a
  third: the share card and the home-screen icons are *rendered against*
  `tokens.css` by `npm run og` rather than drawn with colours typed into a
  script.

### Ground and ink

```
--paper        #f1f3ef   page background. Cool off-white, pulled from the brand mint
--sheet        #e6e9e2   recessed and inset areas, table stripes
--board        #16281f   dark sections. Racing green
--board-soft   #1d3227   raised areas inside a dark section

--ink          #20221f   body text
--ink-soft     #6a6a63   secondary text, labels           (5.2:1 on paper)
--ink-faint    #9b9a92   disabled, placeholder — never for text that matters
--on-board     #ece9df   text on a dark ground
--on-board-soft #96958c  secondary text on a dark ground
```

`--paper` is the load-bearing one. Warm cream plus a high-contrast serif plus a
terracotta accent is the look every generated site has right now, and the old
`#faf8f4` was squarely in it; going cool takes the site out of that family in one
move, and the hue comes from the brand's own mint rather than from nowhere.

It is called `--paper` and not `--ground` on purpose. A draft of Phase 11 renamed
it: 19 references across 10 files, two of them JSX, for nothing a reader of the
site can see — and this document calls the light surface paper throughout, so the
rename would have fought the doc as well as the code. **A token name is the
contract every other file depends on.** Change a value freely; change a name only
when the name is wrong.

`--board` is racing green rather than near-black. Green is not one of the three
brand colours — it is the ground they sit on, the way black was on the school's
own site, and it is what makes the dark surfaces read as leather instead of as UI
chrome.

### Identity

Gold and black are Wellington College's, and they're the kit. They carry
identity, and they mark what matters — never used just to fill space.

```
--gold        #c9992b   brass. Borders, accents, the active state
--gold-leaf   #e6c65f   gold on a dark ground only
--gold-deep   #8c6716   gold as text on the ground
```

Brass is `#f8d118` — the school's yellow — aged. The school uses it at full
strength on black; at full strength on a light ground it is a highlighter.

### Accents

The school's other two colours, aged, each with exactly one job — so gold stays
scarce enough to mean something and no page is a splash of all three.

```
--verdigris      #8fb3a6   the accent, and the "this row is us" wash
--verdigris-deep #3f6b5c   links and text on the ground
--burnt          #bf6a22   rationed: competition tags. Nothing else
```

Verdigris is `#a6d7ca` aged. That pale aqua is what the tokens used to call
"sky"; the `#2f6f8f` dark blue that was actually in use is not a club colour at
all, and verdigris takes over every job it had.

Burnt is `#f37d02` aged, and it is deliberately kept to one use. Three
near-primaries all shouting is the reason the school's own palette needs
discipline rather than enthusiasm.

### Results

W/D/L is a convention people read instantly. Keep the colours, tuned to sit
with the rest.

```
--win   #2f7d4f      --draw  #8a8b83      --loss  #b3392f
```

### Metals

Badge tiers. See *Badges* below.

A metal is a four-stop ramp, not a single value, because a flat fill does not
read as metal. Darkest to lightest, and CSS is the only thing that reads them
now — see below:

```
--bronze-1..4   #6b3a1a  #a9612c  #d18f57  #f0c8a0
--silver-1..4   #3d4449  #79838a  #a9b2b9  #d4dbdf
--gold-1..4     #4d3606  #a87d18  #dcb143  #f9ecb8
--diamond-1..4  #24505f  #528799  #8ec2d3  #c8e7f1
```

Four tiers, not three: diamond is the fourth, and it is icy rather than another
warm metal so it cannot be mistaken for gold.

**Nothing recolours a drawing any more.** The ramps existed because there were
ten drawings and forty badges, so a tier was a metal mapped onto a drawing's own
tones. The club has since drawn all twenty-two — four tiers of each career badge
and the six that don't tier — so a tier *is* a drawing, and the whole pipeline
came out with it: `metalRamp`, the ramp bands, the flat-stop rule for
silhouettes and the medallion. What the ramps still do is the tier beads on the
Records badge board, where a bead is a swatch of a metal rather than a recolour
of a picture — stops 1 and 3 of each, in CSS, in `components/badge.css`.

Bronze is deliberately coppery rather than dark brown. Bronze and gold are
adjacent hues, and separating them by lightness fails the moment either sits on
a ground that isn't white — so they are separated by hue instead.

**A metal is never text.** Silver is 2.4:1 on the ground. Metals are beads and
engraved marks; every word beside a badge is `--ink` or `--ink-soft`.

### Chart series

The palette below governs *lines that label themselves* — one chart, the golden
boot race. It used to be applied to every bar, dot and wash on Stats, which is
how appearances came to be drawn in `#4a3a18`; Phase 66 gave a bar, a wash or a
split its own two-token palette instead (below), so nothing else reaches for
these five.

Fixed order, assigned in sequence, never cycled. **Three pigments at reading
depth, then two of them again at half the lightness.**

```
--series-1  #8c6716  brass        --series-2  #16796a  verdigris
--series-3  #7361a8  plum         --series-4  #4a3a18  brass, deep
--series-5  #423659  plum, deep
```

The first three are three different hues, so a chart with three series or fewer
— which is every chart on the site except the scoring race and *All seasons* —
never repeats a pigment. Depth is what the fourth and fifth are for, and it is
the fallback rather than the first answer.

**A bar, a wash or a split never draws from the five above.** They aren't a line
labelling itself, so the 4.5:1 contrast floor never applied to them, and reaching
for a series colour anyway is how appearances came to be drawn in `#4a3a18` and
the scorelines in teal. Their whole palette is two aliases, declared once in
`tokens.css` rather than written down a second time: `--chart-1` (`var(--gold)`)
and `--chart-2` (`var(--board-soft)`).

**Five separable hues do not exist inside the constraints, which is why depth
carries what hue can't.** A series colour has to clear 4.5:1 on paper so it can
label its own line, and that caps it at L\* 46. Under protanopia and
deuteranopia the red-green axis collapses, so within that band only yellow,
green-teal and violet stay apart; under tritanopia the blue-yellow axis
collapses instead, which is what takes green-teal and slate-blue down to ΔE 0.9.
Between the two there are three usable hue regions, not five. The remaining
dimension is lightness, and a fifth colour needs the bottom of it: measured,
nothing above L\* 31 reaches the floor below, and L\* 27 is where a full set
starts to fit.

**Three floors, and a palette meets all three or it is not the palette.**

| | floor | why |
| --- | --- | --- |
| Contrast on `--paper` | 4.5:1 | a direct end label on a line is text |
| Chroma (C\*) | 20 | under about 15 a colour reads as a grey of some lightness, not as a hue |
| Separation (ΔE2000) | 15 | two lines a reader cannot tell apart are one line |

Separation is measured between **every pair**, under normal vision and under all
three dichromacies — protanopia, deuteranopia and tritanopia. Tritanopia is by
far the rarest and it is still required: dropping it was tried, it bought
nothing the eye could see in the palette that came back, and a carve-out for the
rare reader is the kind of thing this rule exists to stop. The worst pair in the
set above is `--series-2` against `--series-3` at **ΔE 18.1** under tritanopia,
three clear of the floor.

**A categorical palette is validated by measurement, never by eye, and the
measurement is a test** — `tests/palette.test.js`, over the values in
`tokens.css`, with the maths in `scripts/colour.js` (CIEDE2000, and the Viénot,
Brettel & Mollon dichromat model). Nothing the site ships imports either. The ΔE
implementation is itself held against the Sharma, Wu & Dalal reference pairs,
because a difference formula that is quietly wrong passes every other assertion
while measuring nothing.

**What the old set got wrong, and it was worse than the note that recorded it.**
Until Phase 64 the five were brass, verdigris, burnt, green and plum, and they
had been checked for contrast on the ground and never against each other. Seven
of the ten pairs were under the floor. `--series-1` against `--series-3` — the
brass and the burnt — measured **ΔE 0.2 under deuteranopia**: not close, the
same colour, and 13.8 for normal vision as well. `--series-2` against
`--series-4`, the two greens, measured 1.9 under tritanopia and 7.8 for normal
vision. The figures the earlier note carried (4.9 and 12.5) do not reproduce
against either palette and appear to have been estimates; the re-measurement is
the record now, and the lesson is the one already written above — a palette
nobody has run the numbers on has not been checked, however carefully it was
chosen.

**Draft D's burnt was tested against `--series-4` and did not go in.** The mock
draws its fourth line in `#a83a17`, which clears the first two floors
comfortably — 5.73:1 on paper and chroma 61.7, against `#4a3a18`'s 9.85:1 and
23.5 — and fails the third outright: against `--series-1`, the brass, it
measures **ΔE 2.0 under tritanopia**, thirteen short of the floor and the same
failure mode as the palette Phase 64 threw out. Under tritanopia the
blue-yellow axis collapses, and brass and burnt are two points on it. Deep
brass stays. The general lesson is the one below and it survived a second
attempt to talk round it: a colour picked in a drawing is not a colour that has
been measured, and the drawing is not where the argument is settled.

**A direct label on the line is what makes a marginal pair legal**, not an
excuse for one. It is also why no series colour is ever drawn on the board: the
floors above are all stated against `--paper`, and a chart sits on a `.sheet`.

`lib/tokens.js` maps a stat to a slot by name, so a token can move underneath
one without any JS changing — that is how plum left `--series-4` in an earlier
pass and how appearances came to wear deep brass in this one. Goals and MOTM
take `--series-1`, assists and clean sheets `--series-2`, goal involvements
`--series-3`, appearances and starts `--series-4`. Goals and appearances sitting
side by side on a player's page as the same pigment light and deep is the
intent, not a collision: they are the club's two headline figures and they read
as a pair.

## Type

Two families, three roles.

```css
--font-display: 'Libre Caslon Display', Georgia, serif;
--font-text:    'Archivo Variable', Archivo, system-ui, sans-serif;
--font-data:    'Archivo Narrow', 'Archivo Variable', Archivo, system-ui, sans-serif;
```

Self-hosted through `@fontsource`, imported in `main.jsx`, so the type doesn't
depend on a third-party CDN staying up. Fontsource ships the variable faces under
their own family names — `'Archivo Variable'` — which is why both spellings are
in the Archivo stacks; the `Variable` one is what loads. Caslon Display has one
weight, which is the point: a display face used at three sizes does not need a
weight axis.

**Libre Caslon Display** (display) — page titles, player names, scores, the
figure on a badge. Caslon is the English printing letterform, which is what a
school honours board is actually painted in: squarer serifs, less contrast in the
thins, no stylistic wobble. Mixed case, always. Tracking `-0.015em` at large
sizes.

It replaces **Fraunces**, which was a good serif doing an honest job and is also
on a very large number of sites designed in the last two years. The reason for
the swap is not that Fraunces is bad type; it is that a club trading on
permanence should not be set in the face of the moment. Caslon has a reason
behind it, which is the whole test.

**Archivo** (text) — body copy, buttons, labels, navigation. A grotesque with
enough width to read at 16px on a phone.

**Archivo Narrow** (data) — every table, every league standing, every stat cell,
every figure, with `font-variant-numeric: tabular-nums`. This is functional, not
stylistic: condensed figures are half of why the ten-column league table fits a
375px phone at all. The other half is the surface getting out of its way — see
*Mobile*.

**No all-caps headings.** Uppercase appears in exactly two places: `.label`
below, and `.block` — the label device under *Structure* — which is uppercase
because it is text on a field of colour, where mixed case reads as a button.

### Scale

Seven steps. Nothing outside this list, and **0.75rem is the floor** — the old
CSS used forty-nine distinct sizes, twelve of them below the floor and all
doing the same job, which is how a label ended up smaller than the caption
beside it.

| Token | Size | Face | Use |
| --- | --- | --- | --- |
| `--t-display` | 2.75rem / 2rem phone | Caslon | Page title, big score |
| `--t-headline` | 2rem / 1.6rem phone | Caslon | Player name, hero figure |
| `--t-title` | 1.5rem | Caslon | Section heading |
| `--t-subtitle` | 1.125rem | Archivo 600 | Card heading |
| `--t-body` | 1rem | Archivo 400 | Body copy |
| `--t-small` | 0.875rem | Archivo 400 | Secondary, captions |
| `--t-micro` | 0.75rem | Archivo 600 | Labels, and the smallest marks. The floor |

### The block

The school's brand device: bold uppercase on a solid field of colour. `.block`,
in four variants — board, gold, verdigris, burnt.

It replaces the eyebrow, and the reason is arithmetic. Across 30 sections the
site used four different heading treatments: 4 with eyebrow + title, 15 eyebrow
only, 7 title only, 2 neither — and on Home the eyebrow was usually the title
again (`UPCOMING` over "Next fixture"). One device, one grammar:

**A section has a block or a heading, never both saying the same word.** A block
names what kind of thing follows; a heading names the thing. If both would say
"Next fixture", only one of them appears.

Spend it sparingly. A page with six blocks on it is the eyebrow problem again in
a louder font.

`.label` — the single label style, and, alongside `.block`, one of the two
uppercase treatments in the site. `--t-micro`, weight 600, tracking `0.08em`,
uppercase, `--ink-soft`. Column headers and field captions — a section's own
head is `.block`'s job now, not `.label`'s. `.label.ruled` adds the hairline
that closes off a heading. On a dark ground it takes `--on-board-soft` — one
`.board .label` rule, where it used to take a list of all five dark sections
by name.

`table.data th`, `.field > span` and `dl.compare dt` are in the same rule
rather than carrying the class, since they are labels by virtue of being what
they are. One caveat learned the hard way: the rule can't set `display: block`
across that group — a `th` that is `display: block` stops being a table cell
and the whole row lays out vertically. Block belongs on `.label` alone.

`--t-micro` also carries the smallest non-label marks, where there is no step
below it to fall to: the W/D/L badge, the H/A venue mark, a tag, an avatar's
initials, the "of 34" beside a placing, the "vs squad avg" caption in a stat
cell. Those are set in `--font-data`, not the text face.

Form inputs stay at 16px minimum so iOS doesn't zoom the page on focus. This is
already right in the admin CSS — keep it.

## Surfaces

Three. Each has a rule. A fourth surface means the system is wrong, not that
this case is special.

### Board — green, gilded

For occasions and honours: the matchday scoreboard, a player's hero, the
honours board — plus one per leaderboard card, since Phase 14 gave every stat
its own leader row rather than promoting a single one. The last result on Home
used to be a fourth named occasion; Phase 58 turned it into a full-width paper
bar instead (`LastGameBar`, `styles/pages/home.css` → *last game bar*) — a
scoreline, two linked names and a date don't need racing green to read as
worth stopping for, and a page that opens on the club band no longer needed a
second dark section right underneath it to say so again.
`components/LeaderBoards.jsx` renders those now, on every page that shows one —
Season included, since Phase 18. See *Leaderboards and the squad* below for
the card format.

`--board` ground, `--on-board` text, display face, gold accents, 1px `--gold`
bottom border. No radius above 4px. Sparingly — if half the page is board, none
of it feels like an occasion. Measured at 375px, since "sparingly" invites
argument: a board runs from 4% of its page's height to 40%, and **the one page
allowed to go past thirty is the one whose content is the board.** That is
Records → Honours, where the trophy cabinet is 40% of 1,155px: the page is the
cabinet plus a season index, so a board taking most of it is the page working
rather than a section shouting. Everything else sits low — Matchday's scoreboard
at 8% and its MOTM plate at 4% (the two boards one page carries), the trophy
strip on Records → Badges at 14%. Matchday's scoreboard used to hold the top end
at 29%, wide enough that the scoreboard *was* the page; Phase 20 brought it down
by attaching each score to its own team row instead of spreading a floating one
across a three-column grid, and by moving the pitch address off the result
entirely (see *Structure* below).

The `.board` class carries all of that, including the ink for labels, links,
`.muted`, tags and tables sitting on it. That matters more than saving five
declarations: before, each dark section restated the ground and its ink for
itself, so the rule that made a label legible on one had to name all five by
hand. A new board now arrives correct, and getting it wrong takes effort.

Two things a board does *not* do:

- **No paper box inside one.** A nested sheet on a dark ground is the
  box-in-a-box this system rules out, and it breaks contrast as well as taste.
- **A board used as a band inside a sheet squares its corners.** The leaderboard
  leader is one: `.lead-hero` sets `border-radius: 0`, and the board's own gold
  bottom border becomes the line between the leader and the chasers.

A board also clips (`overflow: hidden`) and is its own positioning context,
because the gild — see *Motion* — is a pseudo-element swept across it and has
to be cut off at the edges. So nothing on a board may hang outside one. Nothing
did before this: forcing `overflow: visible` back on changes page height by 0px
at 375px on Home, Players and Records, and no descendant of a board overflows
one. Every board has vertical padding of its own, so nothing could ever have
margin-collapsed through it either.

The gold edge is 1px, not the 3px the scoreboard used to carry. With four named
kinds of board in the site rather than one dark section — five until Phase 58
folded Home's last result into a paper bar — a 3px rule on each would read as
so many underlines; the masthead keeps its 3px because it is the frame, not an
occasion.

**The board is no longer rationed to one per page.** That rule existed to stop a
near-black surface swallowing a page. Racing green does not swallow a page, and
"every section weighs the same" turned out to be the single most consistent
complaint about every screen — a stack of forty identical sheets with one dark
moment is not a hierarchy. A page may now carry more than one board where it has
more than one occasion; what it may not do is alternate them, which reads as
stripes rather than emphasis.

### Sheet — paper, ruled

The default, and where most data lives: tables, lists, squad rows, stat cells,
fixtures.

`--paper` ground, `1px solid var(--rule)` border, `--r` (4px) radius, **no
shadow**. Separation inside a sheet is a hairline rule, not a nested box.

Dropping the shadow and taking the radius from 12px to 4px is most of what
stops this reading as a SaaS dashboard. The border is `--rule`, not the firmer
`--rule-firm` `.card` used: a sheet is the default surface, so its edge should
be the quietest line in the system, and `--rule-firm` is reserved for a divider
that has to be seen.

A sheet is also how any paper surface is drawn, not just the ones that used to
be cards. `.season-card` and `.stat-cell` each hand-rolled the same ground,
border and radius; both now carry `.sheet` and set only their own padding. The
two that were still drawing their own box on the way to being deleted —
`.honour` and `.ms` — are gone with the badge rebuild, so nothing paper-coloured
in the site draws a surface by hand any more. `.tile` is the one exception and
it is permanent: it uses `--sheet`, the recessed ground, because it sits
*inside* a surface. (Phase 66 promoted it from Home's own `.home-stat-tile` to
a shared primitive — every stat strip on the site is one now.)

### Badge — a drawing

The plate — a rectangle with two clipped corners, one shape for every badge —
did its job as a system and failed as a signature. Twenty-four of them, nineteen
saying "Nobody yet", with unearned silver and unearned gold identical because the
tier was carried by a word rather than by the metal. It is gone, and it left no
fourth surface behind.

A badge is **a drawing**, one per badge per tier, and it needs no box: it sits
directly on whatever is behind it. That is what lets a badge appear inline under
a player's name, in a leaderboard row and on a board, which a boxed plate never
could.

**The medallion is gone, and so is the whole idea of a ground.** For one
release a badge had to know what it had landed on: a metal was a four-stop ramp,
an icon's own tones mapped onto stops 1–2 on paper and 3–4 on a board, and the
three light metals took a dark disc with a gold rim behind them because a
recoloured gold cup put 11% of its own ink above 3:1 on a light page. Every one
of those was a fix for a drawing that had been tinted rather than painted. The
club's own artwork carries a frame, an inner field and its own dark rim, so it
clears the bar on `--paper` and on `--board` from the same file — measured, the
way the medallion was. Nothing in the site now asks a badge where it is.

**A badge sits in a square slot.** The drawings are not one shape: a crest is
about 0.9 wide for its height, a diamond 1.17, the hat-trick's three footballs
1.57. Each is contained in a square slot at the size the call site asks for and
centred in it, which is what keeps a shelf's labels starting at the same place
down the page — sizing each drawing to its own width is what used to push them
about. The consequence, and it is accepted: a wide drawing is shorter than its
neighbours in the same slot, so the hat-trick reads smallest of the twenty-two
at any given size.

**An unearned badge is its own drawing, drained** — greyed and lightened by one
CSS filter, not replaced by a silhouette and not dimmed. Drained rather than
faded because `brightness` lands every drawing on the same mid grey whatever its
own colours are, so one rule reads as absence on paper and on the board; an
opacity would sink it into whichever of the two was behind it. A career badge
nobody holds borrows **bronze's** drawing, because bronze is one — one
appearance, one goal, one assist — so the placeholder is the rung the reader is
next in line for rather than a prize three rungs away. A badge you can't see is
not an incentive; that part hasn't changed.

### Rules and radius

```
--rule       #e2ded2   hairlines, borders, table dividers
--rule-firm  #c9c4b4   a divider that needs to be seen
--r-sm  2px      --r  4px      --r-pill  999px
```

Shadows are for things that genuinely float above the page — a dropdown, a
picker list. Nothing else gets one. `--shadow-pop: 0 6px 20px rgba(26,28,25,.14)`.

### Spacing

A 4px scale: `--s1` 4, `--s2` 8, `--s3` 12, `--s4` 16, `--s5` 24, `--s6` 32,
`--s7` 48. Sections are `--s6` apart, `--s5` on a phone. Surface padding is
`--s5`, dropping to `--s4` on a phone — a sheet and a board take the same,
because an occasion earns its emphasis from the ground and the type, not from
extra room.

Where the scale stops, and why it isn't everywhere yet:

- **Anything that positions a block is a token.** Surface padding, section
  rhythm, grid gaps, the space above and below a control group.
- **Anything inside a control or a row is not.** A pill's `0.1rem 0.4rem`, a
  chip's `0.32rem 0.85rem`, a table cell's `0.5rem 0.6rem`, a list row's
  `0.45rem 0`. These are optical, tuned against a specific glyph height, and
  rounding them to 4px would cost more than it buys.
- **The frame keeps its own measurements.** `layout.css` — masthead, main
  column, footer, tab bar — is untouched, because moving the page gutter moves
  every width measurement in *Mobile* below with it. It belongs to whichever
  phase next has a reason to open that file.

## Badges and awards

**This is the signature.** It's the mechanic the whole site exists for, so it
gets the boldness and everything else stays quiet.

`lib/awards.js` is the single source for the numbers, and a test asserts the
table below against it: if the two ever disagree, this table is wrong.

### Why the old ladder failed

Not because the numbers were badly chosen — because of who they excluded.
Measured against the real season: **32 of the 47 players who have turned up hold
nothing at all**, and 19 of them played exactly once. A bottom rung of 5
appearances is out of reach for 70% of the squad, and the site's first stated job
is making people want to turn up. A ladder whose first rung excludes the people
you are trying to convert is decoration.

Showing all three rungs as separate objects made it worse: 24 plates carrying 8
categories, printing each category name three times and "Nobody yet" nineteen
times. The third rung is empty for every badge and will be for years, which is
correct for a young club and awful as a layout.

### Three classes, and only one is tiered

They are not interchangeable and they do not share a shape.

**Class 1 — career badges.** Four categories, four metals. One badge per
category, showing the metal held and progress to the next. **These four are the
only badges that tier**, and each tier is its own drawing — sixteen files, on a
frame that changes shape with the metal as well as colour.

| Badge | Icon | Bronze | Silver | Gold | Diamond |
| --- | --- | --- | --- | --- | --- |
| Appearances | shirt on a crest | 1 | 10 | 25 | 50 |
| Goals | football on a crest | 1 | 5 | 15 | 30 |
| Assists | boot on a crest | 1 | 4 | 12 | 25 |
| Clean sheets | keeper's glove on a crest | 1 | 5 | 12 | 25 |

**Bronze is one.** A debut is a badge, so every player who has ever been picked
owns something and has a shelf to add to. Diamond is roughly four seasons at
fourteen games — a mark that takes years, which is what a top rung is for.

Clean sheets stays, and stays empty: the club has never kept one. "Nobody has
this yet" is a live target when it's one badge among four. It was noise when it
was three plates among twenty-four.

**Clean sheets is a team badge, and its copy says so.** `lib/matches.js` gives
one to every player who appeared in a match with nothing conceded — positions
are fluid at this level, so there is no GK/DEF gating and there shouldn't be.
The consequence is that the club's first clean sheet hands bronze to eleven
people at once, which makes it the only Class 1 badge that isn't a personal
total. That is accepted, not fixed: a clean sheet *is* a team achievement, and
naming it as one on the badge stops it reading as a participation prize.

**Class 2 — events, stackable, no tiers, gold.** Man of the Match — a star —
and the hat-trick, three footballs. A hat-trick is a thing that happened, not a rung on a ladder — "3
hat-tricks" as a tier reads oddly where "hat-trick ×3" doesn't. These carry a
small multiplier and appear inline under a player's name. `lib/awards.js` counts
a hat-trick on `goals >= 3` and that is the whole rule.

**There is no brace.** An earlier version of this section carried one as a third
event on `goals === 2`. It is out: two goals is a good afternoon, not a thing
with a name, and a badge for it cheapens the one beside it. Nothing in
`lib/awards.js` ever counted one, so it leaves no code behind.

**Class 3 — season honours, trophies, one per season, gold.** Four, and they are
exactly the cabinet's four shelf positions, so the cabinet and the badges cannot
drift.

| Award | Icon | Source |
| --- | --- | --- |
| **Player of the Season** | cup on a plinth | **voted by the players, entered by an admin** |
| Golden Boot | boot on a plinth | most goals — derived |
| Playmaker | figure striking a ball, on a plinth | most assists — derived |
| The Dependable | cap on a plinth | most appearances — derived |

**The cabinet marks the voted award with a hairline, not a caption.** Player of
the Season's plinth line is ruled in gold and the other three are not; that is
the whole device. The line of prose explaining it was longer than the four rows
it sat under, so Phase 16 cut it — the one surface the review had found nothing
wrong with still didn't need a paragraph.

**A mark carries its own unit.** Under a boot, "9" is a shirt number until it
says "9 goals", which is why each derived award declares a `unit` in
`lib/awards.js`. The voted one says `voted` instead of a figure: printing one
would imply the arithmetic picked the winner.

They do not tier and they do not stack into a bigger version: **winning two
Golden Boots is the same trophy held twice**. A "3× Golden Boot" tier would
imply the third is worth more than the first, and it isn't. So there is no
bronze Player of the Season and no diamond boot: a trophy is gold, and all four
are drawn on the same brass plinth so a cabinet of them reads as one set.

Three rulings inside that table:

- **The Dependable is most appearances, not ever-present.** Nobody was
  ever-present in 2025/26 — the best was 13 of 14 — and an award nobody can win
  in a squad where people miss games for weddings is not an incentive.
- **Playmaker, not Assist King.** One name for one award; the honours page and
  the badge shelf used different words for the same thing.
- **Most MOTM is not a season honour.** It usually goes to the same player as
  Player of the Season, so it was a second trophy for one performance. It
  survives as the Class 2 star, which is where a repeated event belongs.

### Winning one twice

**A trophy held more than once carries a count, and the seasons are named
wherever there is a line to name them.** The count is `×2`, the same mark a
Class 2 stackable wears, because it is the one thing a drawing cannot say: two
Golden Boots and one are the same picture. It is not a tier and never gets its
own artwork — see the paragraph above.

Where each surface lands, and why:

| Surface | What a repeat shows |
| --- | --- |
| The trophy cabinet, `/records/honours` | Every win, on its own season's shelf. This is the record and it needs nothing added |
| A trophy's own page, `/records/badges/:key` | The year list, and a roll counting seasons — "3 seasons · 2025/26, 2027/28, 2029/30" |
| A player's shelf | `×n` from the second win; one win keeps its season, which is the better fact while there is one of them. Every season is in the stack's `aria-label` and its tooltip |
| The hero, and a squad tile | `×n` from the second win, nothing at one |

**The compact surfaces stopped at a year list because a year list grows.** One
season under a 40px badge is a mark; four is "2025/26, 2027/28, 2029/30,
2030/31" under a 26px drawing on a 117px tile, which is not. This club intends
to be here in ten years — that is job 2 in `CLAUDE.md` — so the mark had to be
something that reads the same in year one and year ten, and the seasons had to
live where there is a column for them. There are two such places and both
already existed.

**The tile shows a count only from the second.** Its own rule is drawings and
nothing else, and the arithmetic behind it is exact: four across at 26px plus
their gaps is 116px of the 117.5px a tile's content box has at 375px
(`squad.css`). At one win nothing is added and that arithmetic is untouched,
which is every tile on the page today; a repeat costs about 17px and wraps the
shelf to a second row, which it already does for anyone holding more than four
badges. Seventeen pixels for "this player has won it three times" is the best
trade on the tile.

### When the honours go up

**An end-of-season award needs the season to have ended.** Three of the four are
derived from our own rows, which means they have a leader from the first
whistle: one friendly into 2026/27, every player who turned up had one
appearance, so all eleven led the column and all eleven held The Dependable. The
squad saw it, which is how this was found.

`honoursSettled` in `lib/awards.js` is the whole rule, and it is two conditions
that both have to hold:

- **1 July after the season ends.** A season is labelled by the two years it
  spans, so `2025/26` settles on 1 July 2026 — a week or so clear of the last
  Saturday anyone plays. The club's 2025/26 finished on 20 June.
- **Nothing left in the diary.** An entered fixture with no result means the
  season isn't over, whatever the calendar says. A cup final in July is a real
  thing. This only ever bites after 1 July, so mid-season's ordinary state —
  every entered fixture played, next month's not entered yet — cannot settle a
  season by accident.

**A row in `season_status` overrides both, in either direction, and there is no
row for a season following the rule.** Two cases need it and neither is a
calendar question: the club wanting the trophies up on the night of the dinner,
and a season that has to be pulled back after a result went in wrong. Admin →
Awards is where the switch is, three ways — *Automatic*, *Published now*, *Held
back* — with the date it goes up on written under it, because an admin choosing
*Published now* needs to be told it happens on its own in a fortnight and there
is nowhere else on the site that could tell them. It is a `<select>` and not the
site's segmented control: three honest labels in a `.seg` want about 276px of a
375px phone's 311px and more than a 320px one has, `.seg` neither wraps nor
scrolls, and a native picker is the better control on the phone this page is
filled in on anyway.

**An unsettled season hands out nobody rather than carrying a flag.** Six
surfaces draw a trophy and the one that forgot to check a flag would print
eleven Dependables again, so `seasonRecords` gives an unsettled season its four
awards with `leaders: []` — every one of those surfaces already reads `leaders`,
and the fix reaches all six through one line. The cabinet is the only thing told
which side of the rule a season is on, because it is the only thing that needs
to say so.

**The cabinet says which shelf is live.** The season being played now keeps its
place with four drained drawings, the way a season nobody has won yet does — but
its year carries an *In play* tag and its trophies say *End of season* rather
than *Not awarded*. The first is a date and the second is a verdict, and a
cabinet that passed a verdict on a season still being played would read as
broken. The race itself is not shown here: Players → Leaderboards is the current
season's goals, assists and appearances at full size, and a second copy of it
under a trophy would be the same thing said twice.

The nag on the admin home follows the same rule (`outstanding` in `lib/admin.js`).
Player of the Season is asked for the day its shelf goes up — not, as it used to
be, the day the season stops being the current one, which could be six weeks
earlier or, in a summer with no fixtures entered, months later.

### A badge has its own page

`/records/badges/:key`. Every holder at every tier, and who is closest to the
next one. A badge that can be linked into the group chat is worth more than a
badge that can only be looked at, and this club's distribution is WhatsApp.

**A player holds one tier — the best one they have reached — and appears on
that rung only.** Reaching silver is what leaves bronze behind: you cannot get
there without passing through it, so bronze does not also claim the name. The
page and the board both listed a name on every rung it had ever cleared, which
put the club's one silver playmaker under bronze and silver at once and read as
two players. `tierHolders` in `lib/awards.js` is the whole of the rule, and it
is the same tier a player's own shelf shows them (`careerBadge`), counted from
the club's end — the shelf always got this right and only the club's two views
of it did not.

Two consequences worth stating, because they look like bugs and aren't:

- **A rung is no longer the badge's total.** "48 holders" on a board card is
  the rungs added up, so `clubBadges` counts it separately; a rung counts who
  is standing on it.
- **A lower rung can empty while a higher one has metal on it**, once everybody
  who reached bronze has moved up. It says *all moved up* rather than *nobody
  yet* — the second would read as never reached.

**The way back sits above the hero, not under the last tier.** This is often
the first page a reader lands on, because the address is what gets pasted into
the group chat, and a way out that needs a scroll to find is a way out a player
doesn't know exists. It is the same muted line the page used to end with.

### The trophy cabinet

`/records/honours`. One green band, a shelf per season ruled off from the next,
and four trophies standing on each in the honours order — Player of the Season,
Golden Boot, Playmaker, The Dependable — with the winner under each and their
mark under the name.

It replaced a list: four label/name rows a season with the names at the
right-hand edge. The list was correct and said nothing, because the trophies are
the club's own drawings and they were 20px captions riding a `dt`'s baseline.
Three things make the cabinet work and all three are constraints rather than
decoration:

- **The order never changes with the layout.** Position on the shelf is how a
  reader knows which trophy they are looking at before they read its label, so
  the four are in the same place down every season at every width.
- **2×2 on a phone, four across from 520px.** Four across at 375px gives a column
  78px, and 78px of trophy with "Hugh Grindon" under it is the list again with
  extra steps. Two gives each about 160px: a 72px trophy, a name on one line and
  its mark under it.
- **A season nobody has won anything in yet is still on the shelf**, four
  drained drawings. That is not an empty state — it is the season the reader is
  about to play, and the cabinet's job is to make the gap look worth filling.
  Entering next season's fixtures is what puts a season on this page, which is
  the same rule as *The current season is the most recent season with a result*,
  seen from the other end. What the drawings say under them depends on which
  nought it is: *End of season* while the season is being played, *Not awarded*
  once it is over and this one went to nobody. See *When the honours go up*.

One board, not one per season: the cabinet is the band and a season is a shelf
inside it, which is both what a cabinet looks like and what keeps this page to a
single dark surface. See *Board* above.

### The icons

**Twenty-two drawings in `src/assets/badges/`** — four tiers of each career
badge, one apiece for the two events and the four trophies. A career badge's
file is `<key>-<metal>.svg`, everything else is `<key>.svg`, and a badge's key is
still its filename and its address under `/records/badges/`. `lib/badge-art.js`
is the whole of the lookup: `artKey(key, metal)` picks the file and `BADGE_ART`
lists what the set is supposed to contain.

They are **`<img>`, not inlined**. Inlining was never a preference — it was what
made the fills reachable for the ramp, and nothing reaches for them now. The set
is 807 KB: as markup that is 807 KB of JavaScript bundle every visitor downloads
before the first paint, and up to 520 path nodes per badge on a squad page that
draws a hundred of them. As images they are hashed, cached, deduped by URL and
never parsed twice, and the main bundle drops by what the old ten weighed.

**`npm run badges -- <directory>` is how a drop of art gets in.** It renames each
export to the key the system knows it by — the artboards arrive as
`Bronze_Appearances.svg` and `SIlver_Assists.svg`, typo included — and runs it
through `svgo` at one decimal place of coordinate. That is the only number in the
script worth arguing about, and it was measured rather than picked: a Figma
export carries six decimals on a 450-unit viewBox, which is 0.0002% of the
drawing and 55% of the file. The 22 exports are 1.8 MB as supplied and 807 KB
after, and renders diffed at 48px and 200px put the difference at edge
antialiasing — under 4% of pixels, nothing over one unit, which at the sizes
this site draws a badge is a tenth of a pixel. `removeViewBox` is off: the
viewBox is the only thing telling the square slot how to contain a drawing that
isn't square, and a test asserts every file still has one.

Three floors, and all three moved up with the new art: **20px for a career
badge, 20 for an event, 24 for a trophy.** The old drawings were flat shapes that
held at 16; these are framed crests with a rim, an inner field and a highlight,
and below their floor the frame closes over the thing inside it. A trophy is
still the deepest — a plinth plus an object needs 24 to stay two objects.
`BadgeIcon` clamps to the floor rather than trusting the call site, and the floor
rides on the element as `data-floor` so `check:layout` measures what was actually
drawn: the way in the clamp can't close is a flex or grid context squeezing a
badge after the fact.

Two failure modes from the last set are still worth keeping written down,
because both were shipped:

- **A drawing is not a vector by default.** The MOTM star arrived once as 471 KB
  of embedded bitmap — a 1241×1179 raster for something that renders into about
  2,300 pixels at its floor. A test fails any drawing carrying an `<image>`, and
  caps a file at 120 KB and the set at 900 KB.
- **A drop can be short a file.** The set is checked against `BADGE_ART` by the
  ingest script and again by a test, because a missing file renders nothing at
  all — there is no fallback drawing and there shouldn't be one.

**`npm run check:layout` holds the contrast rule, and a badge is not scored the
way an icon is.** The check renders each drawing at 64px with its computed paint
and its computed CSS filter baked in — so a greyed unearned badge is scored as
what the page shows, not as the colours in the file — and composites it over the
ground it actually sits on. Then:

- **An icon** — a nav glyph, a sparkline — is scored on **the share of its own
  ink clearing 3:1**, failing under a majority. It is one shape in one colour, so
  every pixel of it is the signal.
- **A badge** is scored on **the contrast between the ground and the mean of its
  own ink**, failing under 2:1. A badge is a shaded illustration, not a glyph:
  the share of its ink that happens to be dark is a fact about where the light is
  coming from, and scoring that way marks a perfectly legible silver crest as a
  failure at 50% while rewarding a drawing for having no highlight. What can
  actually go wrong is the medallion case — a drawing that doesn't separate from
  the page at all — and the mean is what measures it.

**The 2:1 has a negative control, not a fitted threshold.** The three drawings
the dark disc was invented for score 1.50 (the gold cup on paper), 1.31 (the
star) and 1.78 (the shirt). The current set's worst case is 2.12, a drained badge
on the recessed ground, and its worst *held* case on paper is 2.57. A future drop
fainter than this one fails.

A bitmap is still reported as unmeasurable rather than guessed at — the crest is
the only one left. A chart is not an icon and is excluded by name: Recharts draws
a whole plot into one `<svg>` whose gridlines are deliberately faint, and *Chart
series* above is the rule that governs those.

### Live progress — removed

The milestone progress bars are gone, along with `MilestoneStrip`,
`playerMilestones`, `nextMilestone` and the `.ms-*` rules. **`.milestones`
itself outlived them** in `primitives.css`, unreferenced, because this
paragraph claimed a cleanup that had not finished — Phase 51 removes it. The
lesson is the one under *CSS structure*: a rule with no call site is only found
by looking, and a doc that says it is gone stops anyone looking. Five bars on a
player's page pushed the things worth looking at below the fold, and "8 to go"
belongs on the unearned badge: a bar says how far along you are, a badge says
what you get.

### A figure that cannot differ is not a figure

> **Phase 51.** The removal below is decided and not built yet.

`starts` is on the player page twice — a tile in `StatGrid` with its own rank
and its own "vs squad avg" caption, and a column in `SeasonTable` — and it is
identical to `appearances` for every player who has ever played. Not by
coincidence: the wizard is the normal way a result is entered and it writes
`started: true` for everyone, so of 155 real appearance rows, zero have
`started` false. The data centre spotted this and dropped the column, saying so
in its own header comment. The player page kept it.

So on the one page a player opens to see their own progress, one of eight
headline tiles restates the tile two cells earlier and produces a second
identical ranking. **It comes off the player page.** The alternative — a bench
toggle in the wizard so the field means something — was considered and rejected
for now: it adds a tap per player to the weekly flow to record something nobody
has asked for, and entry burden is what kills a volunteer-run stats site. The
column stays in the schema and in the full lineup editor, where an admin who
wants the distinction can still set it.

The general rule: **before adding a figure, ask what would make it differ from
the one beside it.** If the answer is "nothing the club actually enters", it is
not a figure, it is a repetition with a rank on it.

## Leaderboards and the squad

Three sub-pages, three different relationships to a season. **Leaderboards
opens on the current season** and keeps every earlier one on the page, folded
into a collapsible archive underneath it. **Squad and the data centre are the
club's whole history by default**, filterable to one season for the reader
who wants it. **Records stays the one all-time board**, built from the same
card component as Leaderboards so the two can't drift on what a stat means,
even though they now disagree about scope by design.

### The boards

A grid of cards, one per stat, two up on a phone and more as the screen widens
— `components/LeaderBoards.jsx`. Each card: a heading, then **the top five**,
then a footer.

- **The leader takes the card's own dark row** and the display face, with an
  initials monogram where a photo would go. One name gets the occasion; the
  rest are a plain ranked list — a card two names wide has no room to give
  every row its own avatar as well as a name and a value.
- **A name wraps rather than clips**, the same rule as everywhere else on the
  site. A card this narrow means some names run to a second line; that costs a
  little height, and it's still the right trade against half a name.
- **No footer.** An earlier version named the boundary the cap left out —
  `6th of 48 · 9 apps`, the rank, the field size and the value right after the
  five shown — as a fact rather than a personal "your rank": nothing on the
  card knows who's reading it. It read as exactly that to the players it was
  written for: a line of jargon at the foot of every card with nothing behind
  it worth parsing at a glance, so it's cut rather than reworded. A tie still
  needs no footnote — the rank column shows 1, 1, 3 on its own — and a reader
  who wants "where do I place beyond the top five" has the data centre's
  sortable table for it now, which answers the question with a real rank
  rather than a caption.
- **No per-game rate line, and no stat icon.** Both were considered — the old
  hero board carried a "1.07 goals per game" caption, and DESIGN's own draft of
  this section imagined an icon in the heading — but a card in a two-up grid on
  a 1,400px budget doesn't have the height to spare on either, and neither is
  load-bearing information. The badge drawings landed in Phase 15 and four of
  them are a stat's own icon, so the option is real now — and the height
  argument hasn't changed, so the heading stays plain text rather than becoming
  a placeholder for one.
- **The heading doesn't link anywhere yet.** "Everyone a tap away" wants a full
  ranked list to send the tap to, and the nearest thing today is the squad
  roster, sorted by apps rather than by the stat in question. Phase 22's data
  centre is the real destination; wiring the link to a page that answers a
  different question would be worse than no link.

**Both pages run the whole list of six now.** `LEADERBOARD_STATS` in
`components/LeaderBoards.jsx` is the one shared list — goals, assists, goals +
assists, appearances, MOTM, clean sheets. Records used to show three, as a
workaround for the page being 4,823px long; the card format fixed the cause, so
it now runs all six the same as Players.

**Leaderboards carries no all-time scope.** There's no picker offering "All
time" on this sub-page at all any more — not a season selector and not a
combined board — because that board is Records', reached once rather than
from both sections on the same component. (Squad and the data centre carry a
different, unrelated all-time default of their own — see *The season
archive* below and *The squad* — which is about the roster's own scope, not
about a second combined leaderboard.)

**This reverses an earlier rule and the reversal was deliberate.** The previous
system put every board on the page at once, on the grounds that "a leaderboard
you have to click for can't show you where your name isn't". True, and the fix
is a rank column plus a cap, not 2,700px of bar charts: six capped cards show
every board *and* fit a phone — Players → Leaderboards measured 2,992px before
this phase and 1,370px after, against a 1,400px budget. A per-card footer
naming exactly where the cut fell shipped alongside this and was cut again
later — see *The boards* above — once it turned out to read as jargon rather
than as an answer; a reader who wants their own place beyond the top five now
has the data centre's sortable table for it, not a caption.

### The season archive

`components/players-hub/SeasonBoards.jsx`. Leaderboards used to carry a season
picker, the same `<select>` every other sub-page had — pick a year, see that
year's six boards, nothing else on the page. That's gone: **the current
season's boards render open, in full, and every earlier season is a thin
banner underneath**, closed until it's tapped. `<details>`/`<summary>` rather
than a hand-rolled disclosure, because the browser's own keyboard and screen
reader behaviour for "collapsed, expandable" is free, and a chevron drawn from
two CSS borders costs nothing to rotate on `[open]`.

**This is the shape "keep condensed as the seasons pile up" asks for.** A
picker hides everything behind one choice; a page with six boards a season
stacked flat would grow by a full grid every year. A banner is one line
whether it's open or shut, so ten years of history costs ten rows closed and
whatever the reader actually opens.

**The current season is `lib/players.js`'s `currentSeasonOf`, not the most
recent row.** The same rule Home and Matchday already follow: a fixture
entered for next season is a card, not a context switch, so it doesn't
silently become "current" and blank the boards above a real season's worth of
results. If nothing has been played in the current season yet, the boards
say so in one line and the archive still renders underneath it — the site's
own rule against a fixture-only season erasing the page, applied to a board
rather than to Home's summary tiles.

**Every board in the archive is the same `LeaderBoards` component**, one
instance per season, not a second shape built to be collapsible. Opening a
past season costs nothing to get right, because it's markup the harness
already measures at the top of the page.

**The bars are gone entirely.** Season's "Most involved" was the one caller
left drawing one, and Phase 18 moved it onto `LeaderBoards` too — one
`appearances` card, same format as everywhere else. `components/BarBoard.jsx`
and its CSS are deleted rather than kept for a caller that no longer exists.

### Ties

Level is level, and the rows can't say which of them mattered more.

A **rank column** handles this natively — 1, 1, 3 — which is why the card format
gets it for free. The old format had no rank column, so it needed a sentence to
explain each tie, and five of the six boards ended on "…and N more level on X".
With fourteen games and a rotating squad, ties are the normal case: a format that
needs a footnote for the normal case is the wrong format. Clean sheets is the
proof — a team achievement (see `docs/ROADMAP.md`, Phase 15) routinely ties a
dozen players at once, and the card just names the count and moves on.

Where the cut lands inside a tie, the footer says so in the same line it
always prints, since the rank it names already accounts for it.

### The squad

A team sheet: monogram, name, then Apps, Goals and Assists in fixed columns
under one set of heads. The head and every row share one `grid-template-columns`,
and that sharing is the point — labels belong at the top of a column, once.

Three figures, not four: a fourth column leaves a 375px phone no room for a name.
Apps leads them, because turning up is the thing this club is trying to reward.

**The roster is the club's whole history by default, not one season's.** A
name should be findable regardless of which season it happened in, so this
page no longer reads the season a visitor picked on Leaderboards — it opens
on every player the club has ever picked, career totals attached, with an
optional year filter (the same `SeasonSelect` every other sub-page uses,
"All time" as its own option) for the reader who wants one season only.

**That's also why the cap came back — once, and for a different reason than
before.** All 47 of one season fits a phone; the whole club across every
season the site has on record does not, and only gets longer. The list opens
on the **top 20 by appearances** — the order it's already sorted in — with
one "Show all N players" beneath it, the one affordance Phase 17 argued a
roster shouldn't need. **A search is never capped**, regardless: this is the
page people open to find themselves, and a name hidden behind "Show all"
would be worse than no cap at all. So there are still only two affordances on
the page, not three — the search box, and the one "Show all" a visitor only
sees if they haven't already searched or asked for it.

**Two views, list or cards, and one row shape.** `FIGURES` in
`components/players-hub/Squad.jsx` is the single definition of what a squad row
says: the list turns it into a head and three columns, a tile turns it into three
label/value pairs. One `label` each and no long form for the tiles — at 12px
uppercase with the label style's tracking "ASSISTS" wants 57px and a tile on a
375px phone gives a figure 47px, so spelling them out only for the cards would
have cost the shared shape to say nothing new.

**A tile's picture is the shelf.** Cards exist to put the badges on a page
somebody will actually open, and everything else about a tile is subordinate to
that. So:

- **Held badges only**, unlike the shelf on a player's own page. That page is
  right that a badge you can't see is not an incentive, but fifty tiles each
  carrying four silhouettes is two hundred grey drawings and reads as absence.
  A tile says what somebody has; the page it links to says what is next. A
  player picked but never played holds nothing, and that tile says so.
- **No year list and no tier caption** beside a drawing. Those are what a shelf
  is for. The one exception is a badge earned more than once — three hat-tricks,
  two Golden Boots — which carries `×n` from the second, because a drawing
  cannot say there are two of it. See *Winning one twice*.
- **Career-wide badges, and — by default — career-wide figures too**, now that
  the roster defaults to all-time. A season filter narrows the figures without
  touching the badges, since a career badge has no season; the note under the
  grid only appears in that case, naming which is which, because there's
  nothing to explain when both are already the same scope.
- **No monogram.** It costs 40px of a 141px measure and puts nearly every name
  on two lines. A stand-in for a photo we don't have is not worth folding a name
  in half; the list is where it earns its place.
- **One slot per drawing, and the tier is in the drawing.** A bronze crest and a
  diamond one are two different shapes, so a tile says which one somebody holds
  without a word for it. 26px, and it is arithmetic rather than a round number:
  four across plus their 4px gaps is 116px against the 117.5px a tile's content
  box has on a 375px phone. The medallion used to cost each badge 40% of itself
  in padding, which is why the old figure was 21.

**The tiles are the default**, and the team sheet is `?layout=list`. The tiles
are the only view with room for the badges, and the badges are the whole
argument this section makes for turning up; a roster that opens on three columns
of figures puts them behind a control most people never touch. The two layouts
are still **one address apart** rather than component state — a view nobody can
link to is also a view the harness can't measure, and an unmeasured view is
where a clipped name hides. `layout` is the roster's own and does not carry across to
Leaderboards or the data centre. `season` is the opposite: it's the one thing
this page shares with the data centre, so filtering to a year on either sub-
page keeps that year when the segmented control switches to the other —
Leaderboards has no use for it and drops it.

A zero takes `--ink-soft` — it's true, and it isn't the point. A name wraps
rather than clips: half a name is worse than a two-line one on the page where
people come to find their own.

## Charts

A single season's Stats draws three plots — the golden boot race, the scatter
and the spread — and *All seasons* draws one, Points accumulated. Everything
else that used to be a chart on that page is printed figures or a CSS bar
(Phases 70 and 71).

The charts used to read as generated, from `type="monotone"` smoothing and
gradient area fills. Rules:

- **`type="linear"`.** A season is a sequence of discrete matches, not a smooth
  curve. Straight segments between real points tell the truth.
- **No gradient fills.** A flat fill at low alpha, or no fill.
- **Horizontal grid only**, hairline `--rule`, no vertical lines, no axis lines.
  `axisLine={false}` alongside the `tickLine={false}` that was already there —
  the tick text is the only thing an axis draws now.
- **Label the series directly** at the end of its line where there's room, and
  drop the legend. Every series colour clears 4.5:1 on paper, so a label can
  take the line's own colour.
- **Tabular figures** on every axis and tooltip, in `--font-data`. The tooltip
  already had this, in CSS. The axis needed the same route rather than the
  tick style object every chart passes to Recharts: `font-variant-numeric`
  isn't in the attribute allowlist Recharts filters that object through, so it
  gets silently dropped where `fontSize` and `fill` survive. A class selector
  in `charts.css` (`.recharts-cartesian-axis-tick text`) isn't filtered by
  Recharts at all — it's a stylesheet rule same as any other, so `var()` works
  there.
- **Series colours from the token order.** Never a literal, never a per-call
  prop.
- **A chart that hides identity behind a dot or a line keeps its data table** —
  a chart is a view of the numbers, not a replacement for them — behind a quiet
  *Data* link in the card's foot (`components/season/chart-bits.jsx` →
  `ChartSheet`). The table swaps for the drawing rather than opening under it,
  so the link stays where the reader pressed it. **A card whose own figures are
  already printed on it carries no table at all**: the six per-game tiles, the
  W/D/L donut, the home/away goals split, the scorelines, the margins, and the
  division's ranked list (Phases 70 and 71; *A ranked list is not a plot*
  below).
- **A plot is capped at 760px and centred**, and takes its height from its own
  width — `.chart-hold` and `.chart-plot` in `charts.css`, Draft D's proportion
  as an `aspect-ratio`. No height floor on that box: an aspect-ratio box
  transfers a height floor back through the ratio into a *width* floor, and a
  240px minimum became a 404px minimum width that pushed every section on Stats
  71px off the right of a 375px screen.
- **A chart is drawn once, at a canvas that fits 375px, and scales up.** Never
  a wide canvas fitted down: an SVG scaled to a phone scales its labels too, so
  a 12px label ships at 5px and reads as a design choice rather than a bug.
  Everything a chart writes is `--t-micro`, the same step and the same real
  pixels as the small text around it, which in practice means `ResponsiveContainer`
  and `fontPx('--t-micro')` rather than a `viewBox`. `check:layout` asserts it
  (`chart-text-below-floor`): any SVG text whose size on the glass — after
  whatever its transform chain does to it — falls under 12px is a finding.

`components/ChartEndLabel.jsx` is the one label renderer shared by every line
and area — season and career alike — since "render text at a series' last real
point" doesn't change between them.

Two judgement calls on what gets labelled and what doesn't:

- **Points accumulated labels every season it draws.** Phase 70 took the card
  off a single season entirely — one line comparing itself to nothing answered
  nothing, and the mock has no such card — so *All seasons*, where the card
  now lives exclusively, is the only state it still needs to draw: there is no
  focused season to grey the rest against, and telling the seasons apart is
  the whole reason the mode exists, so each line takes its own series colour
  and its own end label. The end labels stagger where two seasons finish on
  the same matchday on the same points, which is the one way they land on each
  other. `PointsAccumulated` itself still accepts a single season — `season`
  is a year or `'all'` — as the general shape the component was built with;
  nothing in the app passes it a year any more.
- **A label needs its own lane.** The career arc's three end labels stack
  vertically (`dy` of `-8`/`0`/`8`) because goals, assists and their sum
  converge at a career's end far more often than a season's results do — three
  labels landing on the same point read as one run-on word without it.

No end label renders below 700px (`useIsNarrow`) on any chart — a phone-width
plot has no lane for one without crowding the line data itself.

**Which is why the scoring race carries a legend as well** (`.legend`, above the
plot inside the same 760px cap). Draft D draws both, and they are not a
duplication here: on a phone the labels are gone and the legend is the only
thing naming a line. The labels themselves are the mock's — surname and season
total, *Gibbons 5* — since the full name is already in the legend and what the
end of a line still has to say is where it finished, and each line gets a dot
where it stops, which on a phone is what separates two players finishing level.
Its x axis is dates rather than matchday numbers, five of them evenly across the
season with both ends kept: a race is read against when it happened, and a tick
a match is sixteen dates on one line. The spread's axis is thinned the same way.

**A pie has no line end, so its key sits beside it instead**
(`components/season/ResultSplit.jsx`) — not a re-added legend, since a donut
never had a multi-line plot to read one off in the first place, and every
figure it would tell you is already printed in the key: `.donut-wrap` holds a
128px Recharts pie and a `.donut-key` list, one ruled row a result with its
count and share. `--win`/`--draw`/`--loss` colour the slices there rather than
the chart series order: those three mean something specific everywhere else on
the site (*Chart series* above) and a result split is never themed. Phase 70
moved this off `ChartCard` entirely — a bare `.sheet` with a `.label.ruled`
head, no finding sentence, no data table, because the key already is one.
`components/season/VenueGoalsSplit.jsx` reads the same way, as one 32px
`.split` bar in `--chart-1`/`--chart-2` rather than a pie — home goals against
away, each half labelled with its own count and share, a neutral-ground goal
named underneath rather than folded into either side. `ScorelineFrequency.jsx`
and `MatchMargins.jsx` are `.hbars` now instead of a Recharts bar chart: up to
seven rows for the scorelines, a `Draw` row plus `marginBuckets`' own four for
the margins, each a `.hbar` — a filled track and the count on the right, the
joint-most in `--chart-1` and the rest `.quiet` (`--chart-2`). None of the four
needs a data table: a bar chart's whole job is standing in for numbers too
crowded to print, and there's no crowd here — six tiles, three slices, up to
seven scorelines, five margins.

**A scatter of a squad is a scatter of piles, so the dot is the pile**
(Phase 64's *Games against contributions*,
`components/season/GamesAgainstContributions.jsx`). Plotting one dot a player
draws fifteen of them on the same spot and shows one: after a season of Old
Wellingtonians, twenty of the forty-eight had played a single game and fifteen
of those had scored nothing, which is one point on the plot and the largest
fact on it. So players sharing a spot are a single dot sized by how many, and
the size is set as **area, not radius** — area is what the eye reads as
quantity. The names are in the tooltip, capped, and in the data table in full,
where each one is a link like every other name on the site (*A name is a link*).

**The gilded dots are the season's leading contributors, and they are not the
dots above the diagonal.** Draft D draws five gold and names them, and the
roadmap's description of Phase 72 said those five were "players at one a game
or better" — the players the diagonal marks. They are not the same set, and the
club's own 2025/26 is what settles it: five players finished at one a game or
better and **three of them had played a single game**, while the five the mock
gilds are the top five by goals + assists, exactly. A card whose subject is how
often people turn up against what they produce cannot headline a one-game cameo
as the standout, so the five are taken off the top of the contributions list —
the same depth the scoring race takes, and four of the same names. The diagonal
still means what it says; it is a threshold, not a shortlist. A dot is a pile,
so only a dot holding one player wears a name: two leaders sharing a spot are
drawn in the pile, because there is no honest way to write one name on a dot
that is two people. The surname sits to the right of its dot, and flips left in
the last quarter of the axis where a name drawn rightwards would leave the plot.

**A reference line gets its words on the line.** Recharts places a reference
label from the line's bounding box, which for a diagonal is the entire plot, so
`insideTopLeft` puts "one a game" in the corner where it reads as a label for
whichever gridline it landed on. The diagonal's own label sits at its midpoint
instead, in the empty triangle above it — everything below the line is dots.
The line stops where the shorter axis runs out rather than at the end of the
longer one, since `y = x` drawn past that is drawn outside the plot.

**A distribution keeps its empty buckets** (*How often people played*).
Games nobody played are drawn as zero rather than closed up: a gap in the middle
of a squad — nobody between eleven and fourteen games — is the shape, and a
chart that skips it shows a smooth tail that isn't there. The bar at the far end
carries the name of whoever is standing on it, in `--gold-deep` above the bar —
and only when one player is, because two ever-presents are a bar and writing one
of their names is picking a winner out of a tie.

### A ranked list is not a plot

Season → Stats holds one card that draws no chart: the division's attack and
defence (`components/season/DivisionRatios.jsx`, Phase 63, redrawn to Draft D
in Phase 71). Every club's goals for and goals against per game are ranked best
first, **one ranking at a time behind an *Attack | Defence* toggle** — a `.seg`
in the card's own `.head`, under the `.label` *The division*. The rules above
are about Recharts plots; five decisions belong to this shape instead.

- **One list, not two.** The same division ranked twice on one screen is the
  same nine club names read twice, and it made this the tallest card on Season →
  Stats: 854px, against a page budget of 2,200px for everything. The toggle
  costs a tap and halves the card, and nothing is lost — nobody reads a club's
  attack and its defence in the same glance, which is why the mock drew it this
  way.
- **The figure is a solid bar in its own track, and the name gets a measured
  column.** Phase 63 drew the figure as a wash behind the whole row, on the
  argument that a bar in its own column costs the width a club name needs. With
  one list on screen there is width for both, and a bar from a common left edge
  is read against its neighbours more easily than a wash whose end has to be
  found. The name column is measured rather than taken from the mock: the mock
  draws 8.4rem with an ellipsis, and "Old Merchant Taylors II" — a real club in
  the 2026/27 division, in `backups/league_rows.json` — needs 127px at
  `--t-micro` and 148px at `--t-small`, so the mock's own width cuts it at both
  steps. The column is 8.25rem below 520px and 9.6rem above, the track takes
  what is left down to a 48px floor, and every real club name in the division
  sits on one line from 320px up. Past that maximum the name wraps; it never
  clips, which is the rule *Mobile* states and `check:layout` asserts.
- **Both rankings share one scale; each carries its own average.** Scored and
  conceded are the same unit, so one maximum means the toggle moves a bar for a
  reason — a club that concedes what it scores keeps the same length across it.
  The averages are still worked out separately, because this table is typed in
  by hand: a complete division's goals for and goals against are the same pile
  of goals counted twice, and the committed fixture's are 209 against 193. The
  average is **a note under the list** — a dashed mark and *Division average
  2.55 scored per game* — not a hairline across every row: with one ranking on
  screen there is no second list for the same mark to be read against, and the
  note says the figure outright rather than leaving it to be judged off a rule's
  position.
- **A club that has played nothing is in neither list, and is named underneath.**
  Not a zero: dividing by zero is either NaN or, treated as a score of none, a
  club that hasn't kicked a ball topping the defence table. It stays out of the
  averages as well, so every goal in a numerator has games behind it in the
  denominator. It is not a hypothetical: one of the nine clubs in the 2026/27
  division, Old Malvernians, had played nothing a fortnight into the season.
- **The card says "League games only", because the card above it doesn't.**
  `league_rows` counts league games and the per-game tiles count every match, so
  the same club's scored-a-game figure differs between two adjacent cards — 2.58
  against 2.4 on the fixture. Each says which it is, which is *A figure that
  cannot differ is not a figure* read the other way round: two figures that
  genuinely differ have to say why. The foot draws only when the list does: on a
  season with no standings typed in there are no figures to reconcile.

The bar is `--chart-2` for a rival and `--chart-1` for us, with our row washed
gold — the same "this row is us" the league table's own row takes, and the bar
as well as the wash, so the row a reader is looking for isn't marked by hue
alone. Neither is a chart series colour: these are two categories, not five, and
the series palette is for lines that label themselves (*Chart series*).

## Motion

Restrained. Motion marks a change the user caused, and nothing else.

Every value comes from the six motion tokens in `tokens.css` — two curves and
four durations — and nothing picks a number outside them. Both curves are the
strong variants; the built-in CSS easings are too soft to read as deliberate.
`ease-in` isn't among them, because starting slow delays the one frame the user
is watching hardest.

**The material is the metaphor.** This site is paper and gilded board, so its
motion is what happens to printed matter: a rule is drawn, ink deepens, gold
catches the light. Nothing leaves the plane — nothing lifts, casts a shadow, or
grows under the pointer. That is a choice with a cost, and the cost is that
hover here is quieter than the shadow-and-scale idiom most sites use. It buys
the thing dropping shadows and 12px radii bought in the first place: a page
that reads as a record rather than a dashboard.

- **Only `transform` and `opacity` animate.** They skip layout and paint. The
  home stat bars animated `width`, which is all three, and scale now.
- **Press is what a phone has instead of hover, and it isn't optional.** A tap
  has nothing else to acknowledge it. Compact controls — buttons, chips, the
  segmented control, a bottom tab — scale to 0.97 under the finger. Full-width
  rows tint instead: a whole row shrinking 3% reads as the page flexing, not as
  a press. `.pick-row` is the one button that takes the row treatment, and says
  so where it overrides.
- **Every `:hover` rule sits behind `@media (hover: hover) and (pointer: fine)`.**
  Touch fires hover on tap and leaves it there until you tap elsewhere, so an
  ungated hover is a stuck highlight on the design target. Correctness, not
  taste.
- **`page-in` is a route transition now**, keyed on the pathname in
  `Layout.jsx`. For its first year `<main>` never remounted, so it only ever ran
  on first paint — this file claimed a transition the site didn't have. Opacity
  only: a tab is tapped dozens of times in a sitting, and at that rate the 4px
  rise it used to carry was movement on every one.
- **Hover changes colour, an edge, or a rule — never size or position.** Press
  is the exception, and only while held. There are three edge treatments and a
  hover picks one:
  - **A rule drawn** under a thing that is offered — the hairline under a
    button's label, a sortable column's own bottom border turning gold, a name
    in a table cell. Drawn from the left with `scaleX`, never switched on.
    Only where the text can't wrap: a cell is `nowrap`, so the link is one
    unbroken box, but a name that wraps to two lines would get a single rule
    under the whole block. Names that can wrap — a leaderboard's, a squad
    card's — deepen in colour instead, and that's why.
  - **A tick in the margin** beside a row, the way a reader marks a page:
    2px of gold down the left edge of a table row (`primitives.css`) or a
    result row (`result-list.css`). It is what this site has instead of a row
    that lifts.
  - **An edge firming up** on a thing that is a surface rather than a control.
    Three take it and all three go `--gold-deep`: a squad card, a badge card,
    a home stat tile. Two of them used to firm to the grey `--rule-firm`, which
    made the rule unreadable at exactly the moment there was a rule. A chip is
    the odd one out at `--gold`, because it is a control and its whole edge is
    the affordance.
- **A button's gold deepens; it does not brighten.** `brightness(1.06)` washed
  the colour towards white, which on gold is the one direction that loses the
  metal.
- **No scroll-triggered reveals, no parallax, and one piece of ambient
  movement.** The exception is **the gild**: a single sweep of light across a
  board as it arrives, at `--dur-gild`. It earns it by being what the surface
  is *for* — a board is an occasion, there are five of them, and each appears
  once per visit to its page. It is off on `.lb-lead`, because a leader's band
  is a row inside a card rather than a page's occasion, and six of them
  cascading down the leaderboard grid is a light show. The bar for a second
  exception is that it can name a surface whose whole purpose is the thing
  that moves.
- **Movement sits behind `prefers-reduced-motion: no-preference`; colour
  doesn't.** Reduced motion means gentler, not nothing — a press still tints and
  a state change still settles, and only the transforms go. Worth knowing that
  the harness runs with reduced motion *on*, so `npm run shots` and
  `check:layout` never exercise the other half: anything new here has to be
  looked at by hand with motion enabled.

## Mobile

The design target, not a fallback. Every change gets checked at 375px first.

- Bottom tab bar owns section navigation below 700px; the header keeps the crest
  and Admin only. This works — don't undo it.
- 44px minimum touch target, bought with padding.
- **A table that side-scrolls is a bug, and `.table-wrap` is not a fix.**
  Condensed figures buy the room; where they aren't enough, restructure into rows
  (the result row under *Structure* is the pattern), don't hide columns.

  This rule was in the doc and the site still broke it, which is worth recording
  because the failure was in the *check*, not the rule. Three phases asserted "no
  table side-scrolls **outside** a `.table-wrap`" — a weaker claim that a wrapped
  table passes by definition, since the wrap's whole job is to scroll. Measured
  inside the wrap, Records' season index hid **319px** at 375px and 374px at
  320px, taking Position and Top scorer with it, and the sticky first column
  made it look like a complete table. Phase 16 fixed it the way this rule says
  to — the index is a ledger of rows now, and two of the ten columns are gone
  rather than moved: Top scorer repeated the honours board directly above it,
  and Position was blank on every row, so it is a footnote until standings are
  entered. Player detail's Firsts & bests hid 122px and cut text mid-word;
  Phase 10 fixed it by moving off a table onto `dl.compare` rather than
  restyling one.

  So the assertion is: **no `.table-wrap` has `scrollWidth > clientWidth` at any
  supported width**, and no leaf element does either — that second one is the
  clipped-name bug ("Old Cheltonians" needing 82px in 74px). `npm run
  check:layout` owns both, on every route at 320/360/375/414/700/1400 against
  both fixture datasets, and it runs on every pull request.

  It is stated as "a scroller holding a table" rather than as `.table-wrap`, so a
  wrapper introduced later under another name is covered by the rule instead of
  by somebody remembering to add it. The chip rows — `.chip-row`, the segmented
  control under a section head — are deliberate horizontal scrollers and hold no
  table, so they fall outside it by construction: a control is not a hidden
  column. Matchday's own stepper and season chips used to be the example here;
  Phase 25 replaced both with the ladder, which scrolls nowhere.

  Running it found two more than the review did, both at widths nobody had
  measured: Season's upcoming-fixtures table hid a handful of pixels at 320px
  (4–7px, depending on the platform's font metrics), and the opponent page's
  home/away split hid 36px at 320px. Phase 18 fixed the first by moving
  upcoming fixtures onto the shared result row, off a table entirely; Phase 21
  fixed the second by condensing the table's own padding at that width, the
  same fix the league table already used below its own first breakpoint — no
  column came off either table. Both entries came off
  `scripts/expected-failures.js` in the commit that fixed them, which is the
  whole reason the check is worth having: it can tell a scheduled bug from a
  regression, and an entry that stops failing fails the run, so the phase that
  fixes one has to delete it.
- **The league table shows all ten columns from 360px up, and it's measured.**
  Phase 2 got the columns down to the width of a phone in `--font-data` and
  still had to hide four of them, because the surface holding the table spent
  16px either side on its own padding. Below 480px the sheet gives that back:
  `.home-widget.home-table` drops its horizontal padding, the head and the
  footnote take it themselves, and the standings run to the hairline with the
  cell padding as the only inset. The row rules run edge to edge — an engraved
  line across the sheet — so the breathing room at the two ends sits on the
  first and last cells instead.

  At 375px that leaves the table 341px and it needs 309px. At 360px it leaves
  326 and needs 303. Below 360 the four secondary columns still come out: the
  narrowest phones leave 286px, and the shortfall is the club names, which
  can't shrink past their longest word. One breakpoint, `max-width: 359px`, and
  it is the only place in the site that hides a column. The squad list uses the
  same breakpoint to drop its monogram, which is not a column — a stand-in for a
  photo is the one thing in that row that isn't data.
- **The write side is measured, and it is not exempt from any of this.** Its
  routes went into `scripts/site-map.js` in Phase 35; before that the admin
  section was the one part of the site `check:layout` had never seen, and all
  three of its tables were hiding columns at 375px — the match list hid **484px
  of its 738px**, which put Edit, Lineup and Report off screen and left the
  lineup editor unreachable from the only page that links to it. The teams
  table hid 289px and the squad list 98px, both taking their actions with them.
  This is the same failure as Records' season index (above), in the section the
  club touches most, and it lasted longer for exactly one reason: nothing
  looked.

  The fix is the one this page already prescribes — restructure into rows.
  `components/AdminList.jsx` is that shape, shared by the three pages that
  needed it: a record per row, its actions on the row, and below 560px those
  actions take their own full-width line. **A new admin screen listing records
  uses it rather than `SortableTable`,** which is for reading, not for editing.
- **An input under a hidden header row carries its own caption.** Both admin
  grids drop their header on a phone. `LeagueGrid` captions every input against
  that (`.lg-stat > .label`); the lineup editor did not, so entry on a phone was
  four unlabelled number boxes and an unlabelled checkbox per player. It does
  now (`.lineup-stat > .label`), on the same breakpoint device. If a header row
  is the only thing naming a column, hiding it is hiding the label.
- Admin data entry is a phone-first flow — it's used on a Saturday night at a
  pub table. Sticky save, big inputs, one record per block. Sticky save means
  **both** long grids: the league table has followed the admin down since it was
  built, the lineup editor didn't until Phase 35, and fifteen slots is the
  longer of the two. This is also why
  the data centre's rates are really per-appearance figures rather than
  actual per-90-minutes ones: minutes would be eleven to sixteen numbers typed
  per match on a phone, and entry burden is what kills a volunteer-run stats
  site. They're labelled "/90" anyway, on request, for the reader who wants
  the familiar fbref shorthand — the table's own footnote says once that this
  assumes a full 90 minutes every time out, rather than leaving every "/90"
  header to imply data the club has never recorded.
- **The data centre's own table is the one deliberate exception to "a table
  never side-scrolls".** Every other rule on this page is about a table that
  has to fit a phone; this one page is built for the opposite reader — a data
  nerd who wants every stat at once and a horizontal scrollbar rather than
  five separate small tables. It carries its own marker class,
  `wide-reference-table`, which `scripts/collect.js`'s "no table hides a
  column" invariant explicitly skips — see the script's own comment. The name
  column still sticks below 700px, the same rule every `.table-wrap` gets, so
  a reader never loses track of which row they're scrolling. A second table
  reaching for this exception needs its own argument, not a widened selector.
- **The golden boot race's data table is the second, and its argument is that
  its width is data.** Every other table on the site is a fixed set of columns
  a designer chose, so it can be made to fit by choosing shorter ones. This one
  is a matrix — a row a matchday, **a column a tracked scorer** — and its
  headers are people's names: five surnames is 420px at 375, and there is no
  shorter word for Grindon. Nothing is hidden by the scroll that isn't named
  on the chart it backs, it is opened deliberately from a *Data* link by a
  reader who wants the numbers rather than the lines, and the matchday column
  sticks like every other. The scatter's table beside it was made to fit
  instead, on the league table's own column codes (`P`, `G`, `A`, `G+A`), and
  the spread's two columns always did. Phase 72 also added the state that
  measures all three (`season-stats-data` in `scripts/site-map.js`): they were
  never measured open, and opening them used to take the whole document to
  724px in a 375px viewport, because a grid item sizes to its own min-content
  and a table's min-content is every column's longest word added up.

### Page length

A page has a height budget, because "no one scrolls to the bottom" is not a vibe
to argue about — it's measurable, and information at the bottom of a 4,800px
phone page is information that doesn't exist.

**This table is the authority for these numbers.** The roadmap tracks where each
page started and which phase closes the gap; the budget itself is a design
constraint, so it lives here.

| Page | Budget at 375px |
| --- | --- |
| Home | 2,600 |
| Matchday | 2,800 |
| Season | 2,450 |
| Season → Stats | 3,200 |
| Players → Leaderboards | 1,400 |
| Records → any sub-page | 2,000 |
| Player detail | 2,400 |
| Opponent detail | 2,000 |
| Players → Squad | no cap on "Show all" — it's a roster, and every name belongs on it once asked for; the default view opens on the top 20 |
| Players → Data centre | no cap — it's the reference table, and every player's row belongs on it |
| Matchday — clean sheet, report open | no cap — the clamp already bounds the default route; reading the whole report is a choice, the same as Squad's "Show all" |
| Admin → any route | no cap — these are working screens, and their length is the squad's: a fifteen-slot lineup is fifteen slots long. Measured on every run all the same, because the invariants above still apply |

Records is a reference document and earns length, which is why it splits into
sub-pages rather than shrinking. Home doesn't. The opponent page is the same kind
of document as a Records sub-page and takes the same number. Season → Stats
earns its own row for the same reason: Phase 61 merged Charts into it, and
built to the mock it's a season's whole numeric record — nine cards a reader
consults, not a page a stranger scrolls past — so it stopped sharing Season's
number rather than shrinking to fit it. `npm run shots` reports the real
numbers — page by page, at every supported width, into `shots/heights.json` —
and `docs/ROADMAP.md` → *Page budgets* is where they're tracked against these
figures, phase by phase; that history belongs there, not here.

Two of these numbers moved after the page they describe changed jobs, not
after it merely overran, which is the distinction that keeps a budget from
being "whatever got built." **Matchday's moved twice**: 1,900 to 2,300 when
Phase 25 gave the page the season's whole archive as a ladder (1,900, plus the
~730px eighteen rungs cost, less the ~330px of stepper and jump strip they
replaced), and 2,300 to 2,800 in Phase 52 once the head-to-head tape (Phase
27) and a bounded match report added real content the first move never
priced in — decided against the tape at its full designed size rather than
asking it to shrink, with the report's own unclamped *open* state left
uncapped rather than folded into the number at all. **Home's moved once**, from
1,600 — set in Phase 19 for a page that was a result and a fixture row — to
2,600 in Phase 52, once the redesign gave it a club band, a last-game bar, the
reader's own season, a match outlook and a league snapshot: the mock's own
hub, not the old summary. `docs/ROADMAP.md` → *Decisions* → *Settled* has both
argued in full, and *Page budgets* has the measurements each one was decided
against.

**"No cap" is not "unmeasured."** The squad roster and the data centre are
measured at every width on every run precisely because they have no ceiling —
that's what caught the roster's tiles collapsing to one a row on a 320px
phone. A page earns "no cap" by being a reference a reader consults rather
than a summary they scroll past; everything else keeps a number, and a number
that stops fitting what was built is a decision, not a shrug.

## CSS structure

The single 2,654-line `styles.css` is gone. Layers load in this order, set by
`styles/index.css`, and the order is load-bearing — a later layer may override
an earlier one, never the reverse:

```
styles/
  index.css         the import list. The only place load order is decided
  tokens.css        custom properties only. :root, and nothing else
  base.css          reset and element defaults — bare tags, no classes
  layout.css        the frame: masthead, nav, main column, footer, tab bar
  primitives.css    the shared vocabulary
  components/       one file per shared component
  pages/            one file per route. The last resort, and the smallest
  admin.css         the write side, loaded last
```

`badge.css` is the one file under `components/` that used to be a surface —
`plate.css`, the third box — and isn't one any more: what it holds now is size,
spacing, the square slot and the one filter that drains an unearned badge,
because a badge sits on the ground rather than in a box of its own. See *Badge*
above.

These layers are ordered by how broadly a rule applies, not by who owns the
component — which is the opposite of how `src/components/` is arranged, and
deliberately so. `squad.css` styles a component only the Players page renders,
and it still belongs under `components/`: it dresses a component, and the cascade
cares about that rather than about which page mounts it.
`pages/` is for a page's own layout — the grid it arranges its sections in.

`tokens.css` carries one media query, and it is the only selector allowed to
join `:root` there: `--t-display` and `--t-headline` drop a step on a phone,
and putting that in the token layer is what stops every page from having to
know about it.

A rule earns a place in `primitives.css` by being wanted in three or more
places. Two rules of thumb that follow from it:

- A variant scoped by a page's own class still belongs with the primitive it
  modifies, not with the page — `.scoreboard .venue-badge` lives next to
  `.venue-badge`.
- A file under `pages/` growing past ~80 lines means something in it should
  have been a primitive.

**The rule that keeps it from growing back:** before writing a new class, check
`primitives.css`. If three pages need the same thing, it's a primitive, not a
page style. `pages/` is for genuinely one-of-a-kind layout, and a file there
growing past ~80 lines means something in it should have been a primitive.

## Deliberately not doing

- **No photography yet.** Player photos mean chasing 30 people for headshots.
  The design works without images and doesn't leave holes where they'd go.
  Initials-in-a-circle is the placeholder, and it's fine.
- **No dark mode.** One well-executed palette beats two half-tuned ones, and
  the board surfaces already give the site tonal range.
- **No component library.** Vanilla CSS with tokens. The site is ~7k lines;
  adding Tailwind or a UI kit now would be more migration than benefit.
- **No animation library.** CSS transitions, five keyframes and one
  `@starting-style` cover everything under *Motion*.
- **No sixth section.** Depth goes into a sub-page of one of the five, per
  *Structure*. A section is expensive to add and expensive to rename — `App.jsx`
  already carries seven redirect shims.
- **No real per-90 stats.** They need minutes, which nobody is going to type.
  The data centre labels its rate columns "/90" anyway, on request — that's a
  label choice for a familiar shorthand, not new data collection, and the
  table's footnote says so. See *Mobile*.
- **No stored aggregates.** Still true and still the load-bearing rule:
  everything is derived. There are four exceptions and each one is a fact about
  the world our rows cannot hold: league standings, the voted Player of the
  Season, whether a season has ended (`season_status`, from Phase 55, and only
  where an admin overrides the calendar), and — from Phase 73 — the other
  clubs' recent form (`league_rows.form`). The fourth is the first one again
  rather than a new kind: `league_rows` already stores other clubs' results,
  and a W/D/L total simply carries no order, so their last five is typed into
  the same grid on the same night as the rest of their row. **Our own row
  never is** — ours is derived from our own league results, the same way points
  and goal difference are, so every row has one source. There is not a fifth.
- **No accounts for readers.** The only login on the site is the admin's. A
  player identifying themselves is a cookie on their own phone, not a user
  record — see *What the site remembers*. Thirty accounts and thirty forgotten
  passwords for a read-only stats site is the version nobody uses.
- **No offline editing, and no offline data.** The service worker in *An
  installed app has to open with no signal* caches the shell, so the site opens
  to its own frame and says it has no connection. It does not cache a single row
  and it does not queue writes. A result typed into a dead connection and
  replayed later is a whole conflict model for a flow that takes four steps once
  a week, and the admin can wait for a bar.
