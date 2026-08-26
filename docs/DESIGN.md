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

`.card` is gone. Fifty call sites are `.sheet` and five are `.board`, and the
judgement that split them is the rule under *Surfaces* below. **There is no
third surface.** The plate was one — a box every badge was cut from — and
Phase 15 replaced it with a drawing in a metal that needs no box at all, which
is what lets the same badge sit in a hero band, in a card and in a list.

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

> **Phase 16.** Records runs on the sub-navigation mechanism now too:
> `/records` (Badges), `/records/honours` and `/records/all-time` are real
> addresses, and the five sections that used to stack on one 4,841px page are
> three sub-pages, none over 2,000px. The mechanism itself landed in Phase 13,
> on Players; the result row and the season rule below landed in Phase 10.
>
> **Phase 18.** Season splits too: `/season` (results and standings) and
> `/season/charts` are real addresses, both under the same 2,200px budget.
> Every section on the site now gains depth through a real sub-page rather
> than a toggle squeezed into a corner of one.
>
> **Phase 22.** Players gains its third sub-page, `/players/data` — every
> player, every stat, the columns the old "Full table" toggle held before
> Phase 17 deleted it. It stayed behind a fourth address of its own,
> `?stat=`, one per stat group, for the same reason the squad's `?layout=`
> does: a group the harness never visits is a name column it never checks.
> **A later pass replaced the five groups with one wide table** — see *The
> boards* and *Mobile* — so `?stat=` and the address it lived behind are both
> gone; only `/players/data` and its `?season=` filter remain.

### Sections do not grow; they gain depth

Five sections, and that does not change. What changes is that a section may have
**sub-pages**, reached by a segmented control at the top of it, each with a real
address. Tapping a bottom tab lands on the section's default sub-page.

| Section | Sub-pages | Default |
| --- | --- | --- |
| Home | — | — |
| Matchday | — | — |
| Season | Season · Charts | Season |
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

### A result is a row, not a sentence

```
[W]  Old Stoics          4–1   H
[D]  Old Salopians       1–1   A
```

Opponent, our score always first, venue as a letter, W/D/L as a chip, all on one
`grid-template-columns` shared by every row. This is a primitive, not a page
style, built as `components/ResultList.jsx`: six places render a scoreline and
all six read from it, plus a compact inline variant for the one that sits
inside another card's own row rather than a list of its own. Written as prose
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
do, which is show the whole season while one match is being read (Phase 28).
`SeasonLadder`'s own two wrapping elements — the section and the list — go
`display: contents` at that width, in `styles/pages/matchday.css`, which
promotes the head, every rung, and the panel a current match opens to be
direct items of the page's own grid. That is what lets the tree Matchday
already builds serve both layouts: one column below 900px, two above it,
the panel written once either way. The rung that shares a row with the panel
is the one that's open — its own cell stretches to match, so the highlight
becomes a gold band running the height of the match beside it, rather than
leaving a gap in the rail.

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
read as metal. Darkest to lightest:

```
--bronze-1..4   #6b3a1a  #a9612c  #d18f57  #f0c8a0
--silver-1..4   #3d4449  #79838a  #a9b2b9  #d4dbdf
--gold-1..4     #4d3606  #a87d18  #dcb143  #f9ecb8
--diamond-1..4  #24505f  #528799  #8ec2d3  #c8e7f1
```

Four tiers, not three: diamond is the fourth, and it is icy rather than another
warm metal so it cannot be mistaken for gold.

**Only the four career badges read the ramps.** Season trophies and the two
events are single gold and do not tier, so sixteen recolours exist, not forty.
A drawing takes a *slice* of the ramp rather than the whole of it, and which
slice is decided by the ground: stops 1–2 on paper, stops 3–4 on a board or a
medallion. `lib/badge-art.js` does the mapping and `lib/tokens.js` reads the
stops, so the hexes stay here and nothing writes a metal down in JS.

Bronze is deliberately coppery rather than dark brown. Bronze and gold are
adjacent hues, and separating them by lightness fails the moment either sits on
a ground that isn't white — so they are separated by hue instead.

**A metal is never text.** Silver is 2.4:1 on the ground. Metals are fills and
engraved marks; every word on a badge is `--ink` or `--ink-soft`.

### Chart series

Fixed order, assigned in sequence, never cycled. Ordered so the two warm darks
aren't adjacent.

```
--series-1  #8c6716  brass      --series-2  #3f6b5c  verdigris
--series-3  #a2551a  burnt      --series-4  #2f6b46  green
--series-5  #4a3f7a  plum
```

All clear 4.5:1 on the ground, so a series colour can label its own line directly
and skip the legend. Plum moved from `--series-4` to `--series-5`: it was
carrying appearances, the club's most-looked-at stat, in a colour with no basis
in anything. `lib/tokens.js` maps appearances to `--series-4` by name, so the
swap needed no JS change — only the token underneath it moved.

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
honours board, the last result on Home — plus one per leaderboard card, since
Phase 14 gave every stat its own leader row rather than promoting a single one.
`components/LeaderBoards.jsx` renders those now, on every page that shows one —
Season included, since Phase 18. See *Leaderboards and the squad* below for
the card format.

`--board` ground, `--on-board` text, display face, gold accents, 1px `--gold`
bottom border. No radius above 4px. Sparingly — if half the page is board, none
of it feels like an occasion. Measured, since "sparingly" invites argument: no
page is more than one board, and at 375px a board runs from a few percent of
its page's height up to the high twenties — Records' honours board, at 28%, is
the deepest now. Matchday's scoreboard used to hold that top end at 29%, wide
enough that the scoreboard *was* the page; Phase 20 brought it to 11% by
attaching each score to its own team row instead of spreading a floating one
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

The gold edge is 1px, not the 3px the scoreboard used to carry. With five boards
in the site rather than one dark section, a 3px rule on each read as five
underlines; the masthead keeps its 3px because it is the frame, not an occasion.

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
in the site draws a surface by hand any more. `.home-stat-tile` is the one
exception and it is permanent: it uses `--sheet`, the recessed ground, because
it sits *inside* a surface.

### Badge — an icon in a metal

The plate — a rectangle with two clipped corners, one shape for every badge —
did its job as a system and failed as a signature. Twenty-four of them, nineteen
saying "Nobody yet", with unearned silver and unearned gold identical because the
tier was carried by a word rather than by the metal. It is gone, and it left no
fourth surface behind.

A badge is **an icon in a metal**, drawn per badge, and it needs no box: it sits
directly on whatever is behind it. That is what lets a badge appear inline under
a player's name, in a leaderboard row and on a board, which a boxed plate never
could.

Three things about a metal as paint rather than as a border, all measured
rather than judged by eye:

- **The band depends on the ground.** A metal is a ramp (see *Metals*), and an
  icon's own tones map onto a slice of it. Mapping onto the whole ramp bleaches
  large light shapes: the shirt is 89% gold fill, and stretched to the top of a
  ramp it is a pale shape on pale paper. Icons on the ground take stops 1–2;
  icons on a board take stops 3–4.
- **Bronze goes on the ground; the light metals go on a medallion.** Bronze is a
  dark metal and reads on paper. Silver, gold and diamond don't, so they take
  the disc — which is also where every trophy and every event badge sits when
  the page around it is light.
- **A ramp cannot recolour a silhouette.** The pipeline reads a drawing's own
  tonal range and maps it onto a slice of the metal. Three of the ten have no
  range to read: assists spans 0.00–0.03 in luminance, goals 0.03–0.03,
  playmaker 0.00–0.00. Those take one flat stop — the band's inner one, which
  is the stop that reads as the metal rather than as its shadow or its
  highlight. Appearances (0.00–0.60) and clean sheets (0.00–0.56) are the two
  career badges with enough span for a ramp to do anything.

**The medallion is built.** A dark disc with a gold hairline rim, behind a light
metal, and it is not decoration: a gold cup on a light page puts 11% of its own
ink above 3:1 whatever the band does, because a cup is mostly highlight. The
disc gives it a ground to read against and makes a badge read as an actual
medal. Career badges sit on the ground in bronze and on a medallion above it;
trophies and events are on one wherever the page is light.

**An unearned badge is a silhouette**, in the ground's own soft ink — present,
named, and visibly not yours. Not a faded metal: dimming a metal costs the
contrast that makes it legible, and a badge you can't see is not an incentive.

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
only badges that tier**, and so the only four drawings the metal ramps touch.

| Badge | Icon | Bronze | Silver | Gold | Diamond |
| --- | --- | --- | --- | --- | --- |
| Appearances | shirt | 1 | 10 | 25 | 50 |
| Goals | football | 1 | 5 | 15 | 30 |
| Assists | target and arrow | 1 | 4 | 12 | 25 |
| Clean sheets | keeper's glove | 1 | 5 | 12 | 25 |

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

**Class 2 — events, stackable, no tiers, gold.** Man of the Match and the
hat-trick. A hat-trick is a thing that happened, not a rung on a ladder — "3
hat-tricks" as a tier reads oddly where "hat-trick ×3" doesn't. These carry a
small multiplier and appear inline under a player's name. `lib/awards.js` counts
a hat-trick on `goals >= 3` and that is the whole rule.

**There is no brace.** An earlier version of this section carried one as a third
event on `goals === 2`. It is out: two goals is a good afternoon, not a thing
with a name, and a badge for it cheapens the one beside it. Nothing in
`lib/awards.js` ever counted one, so it leaves no code behind.

**Class 3 — season honours, trophies, one per season, gold.** Four, and they
are exactly the honours board's rows, so the board and the badges cannot drift.

| Award | Icon | Source |
| --- | --- | --- |
| **Player of the Season** | cup | **voted by the players, entered by an admin** |
| Golden Boot | boot on a plinth | most goals — derived |
| Playmaker | figure striking a ball | most assists — derived |
| The Dependable | cap | most appearances — derived |

**The board marks the voted award with a hairline, not a caption.** Player of
the Season's row is ruled in gold and the other three are not; that is the whole
device. The line of prose under the board explaining it was longer than the four
rows above it, so Phase 16 cut it — the one surface the review had found nothing
wrong with still didn't need a paragraph.

They do not tier and they do not stack into a bigger version: **winning two
Golden Boots is the same trophy held twice**, shown as a year list. A "3× Golden
Boot" tier would imply the third is worth more than the first, and it isn't. So
there is no bronze Player of the Season and no diamond boot: a trophy is gold.
The cup and the cap arrive gold in the file; the boot's plinth and the playmaker
figure are black, so those two are gilded once and never again — see *The icons*
below.

Three rulings inside that table:

- **The Dependable is most appearances, not ever-present.** Nobody was
  ever-present in 2025/26 — the best was 13 of 14 — and an award nobody can win
  in a squad where people miss games for weddings is not an incentive.
- **Playmaker, not Assist King.** One name for one award; the honours board and
  the badge shelf used different words for the same thing.
- **Most MOTM is not a season honour.** It usually goes to the same player as
  Player of the Season, so it was a second trophy for one performance. It
  survives as the Class 2 star, which is where a repeated event belongs.

### A badge has its own page

`/records/badges/:key`. Every holder at every tier, and who is closest to the
next one. A badge that can be linked into the group chat is worth more than a
badge that can only be looked at, and this club's distribution is WhatsApp.

### The icons

Ten drawings in `src/assets/badges/`, one per badge, each named for the slug its
page uses — so a badge's key, its filename and its address are one string. They
are inlined rather than served as images, because the metal is paint: a tier
recolours the fills, and an `<img>` has no fills to reach.

The club's own drawings, recoloured by the ramp rather than hand-tinted: read
each drawing's tonal range, map it onto a slice of the metal. That keeps the
relationships the artwork already has — a glove's palm stays lighter than its
back — and means a redrawn icon re-colours without anyone picking hexes.

**Only what isn't gold in the file gets gilded.** Six of the ten never tier.
Three of them — the cup, the cap and the redrawn star — arrive gold and are left
exactly as the club drew them. The other three take one pass through the gold
ramp and never another: the playmaker figure (a black silhouette, 0% of its ink
above 3:1 on a board), the hat-trick footballs (black and white, 63%), and the
Golden Boot, whose plinth is five black fills that vanish on a dark ground
(57%). The boot is a correction to this section — it was listed as arriving
gold, and a third of it doesn't.

Three failure modes are worth writing down because all three were shipped once:

- **Do not normalise an icon to the full ramp.** Some drawings are deliberately
  near-monochrome. Stretching two shades of black across dark-to-white turned an
  arrow and a figure almost white and they vanished on the ground. Scale the
  span to the source's own contrast instead — and where there is no span at all,
  as with the target, the football and the playmaker figure, take one stop flat
  rather than inventing a range. See *Badge* above for the measurements.
- **Trophies never render below 20px.** A plinth plus an object below that merges
  into a blob. Career badges and the star hold at 16. `BadgeIcon` clamps to the
  floor rather than trusting the call site, and the floor rides on the element
  as `data-floor` so `check:layout` measures what was actually drawn — the way
  in the clamp can't close is a flex or grid context squeezing a badge after
  the fact.
- **A drawing is not a vector by default.** The MOTM star arrived as 471 KB of
  embedded bitmap — a 1241×1179 raster for something that renders into about
  2,300 pixels at its floor. It is paths now, at 748 bytes, and a test fails any
  drawing over 25 KB or carrying an `<image>`.

**`npm run check:layout` holds all of this.** Its icon rule used to read `fill`
off the root `<svg>` — one colour for the five nav icons it was written against,
and meaningless for a drawing carrying colour on up to thirty-six child paths,
where it read the initial value, black. It now bakes each icon's computed paint
into a copy, renders it at 64px, composites it over the ground it actually sits
on and scores **the share of its own ink clearing 3:1**, failing anything under
a majority. That is what `npm run check:layout` reports, icon by icon. A
chart is not an icon and is excluded by name: Recharts draws a whole plot into
one `<svg>` whose gridlines are deliberately faint, and *Chart series* above is
the rule that governs those.

### Live progress — removed

The milestone progress bars are gone, along with `MilestoneStrip`,
`playerMilestones`, `nextMilestone` and the `.ms-*` rules. Five bars on a
player's page pushed the things worth looking at below the fold, and "8 to go"
belongs on the unearned badge: a bar says how far along you are, a badge says
what you get.

## Leaderboards and the squad

Three sub-pages, three different relationships to a season. **Leaderboards
opens on the current season** and keeps every earlier one on the page, folded
into a collapsible archive underneath it. **Squad and the data centre are the
club's whole history by default**, filterable to one season for the reader
who wants it. **Records stays the one all-time board**, built from the same
card component as Leaderboards so the two can't drift on what a stat means,
even though they now disagree about scope by design.

> **Phase 14.** The card format below landed, on both pages — Players and
> Records each run the whole set of six now, and Players' season picker lost
> "All time" the same commit. **Phase 17** built the squad view below: every
> name on the page, and the tiles that put the badges on it. **A later pass**
> replaced Players' single-season picker with the current-season-plus-archive
> shape described here, made Squad and the data centre all-time by default,
> cut the per-card footer, and rebuilt the data centre as one wide table —
> Phase 24 in `docs/ROADMAP.md`, and `git log --grep="Phase 24"` for the
> reasoning.

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
- **No count and no year list** beside a drawing. Those are what a shelf is for.
- **Career-wide badges, and — by default — career-wide figures too**, now that
  the roster defaults to all-time. A season filter narrows the figures without
  touching the badges, since a career badge has no season; the note under the
  grid only appears in that case, naming which is which, because there's
  nothing to explain when both are already the same scope.
- **No monogram.** It costs 40px of a 141px measure and puts nearly every name
  on two lines. A stand-in for a photo we don't have is not worth folding a name
  in half; the list is where it earns its place.
- **One slot per drawing, medallion or not.** A bronze career badge wears no
  disc, and in a row of six that reads as badges of two sizes rather than of two
  metals, so an unmedalled badge takes the disc's own inset as transparent
  padding.

**The two layouts are one address apart** — `/players/squad` and
`/players/squad?layout=cards` — not component state. A view nobody can link to
is also a view the harness can't measure, and an unmeasured view is where a
clipped name hides. `layout` is the roster's own and does not carry across to
Leaderboards or the data centre. `season` is the opposite: it's the one thing
this page shares with the data centre, so filtering to a year on either sub-
page keeps that year when the segmented control switches to the other —
Leaderboards has no use for it and drops it.

A zero takes `--ink-soft` — it's true, and it isn't the point. A name wraps
rather than clips: half a name is worse than a two-line one on the page where
people come to find their own.

## Charts

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
- **Every chart keeps its "Show data" table.** This already exists and is the
  best thing about the current charts — a chart is a view of the numbers, not a
  replacement for them.

`components/ChartEndLabel.jsx` is the one label renderer shared by every line
and area — season and career alike — since "render text at a series' last real
point" doesn't change between them.

Two judgement calls on what gets labelled and what doesn't:

- **Points accumulated labels the focused season only.** The other seasons on
  that chart are grey context, drawn to show shape, not identity — the finding
  sentence above the chart already names the one that matters, and "Show data"
  still headers every column with its season. Labelling all of them would be
  the legend again, just moved onto the plot.
- **A label needs its own lane.** The career arc's three end labels stack
  vertically (`dy` of `-8`/`0`/`8`) because goals, assists and their sum
  converge at a career's end far more often than a season's results do — three
  labels landing on the same point read as one run-on word without it.

No end label renders below 700px (`useIsNarrow`) on any chart — a phone-width
plot has no lane for one without crowding the line data itself. The tooltip and
the data table carry series identity there instead.

## Motion

Restrained. Motion marks a change the user caused, and nothing else.

- The existing page transition stays (`page-in`, 0.25s).
- Bar fills and badges animate their width/opacity on first paint, 0.4s ease.
- Hover changes colour or border, never size or position.
- No scroll-triggered reveals, no parallax, no ambient movement.
- Everything above sits behind `prefers-reduced-motion` — already handled
  correctly throughout the current CSS. Keep it that way.

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
- Admin data entry is a phone-first flow — it's used on a Saturday night at a
  pub table. Sticky save, big inputs, one record per block. This is also why
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

### Page length

A page has a height budget, because "no one scrolls to the bottom" is not a vibe
to argue about — it's measurable, and information at the bottom of a 4,800px
phone page is information that doesn't exist.

**This table is the authority for these numbers.** The roadmap tracks where each
page started and which phase closes the gap; the budget itself is a design
constraint, so it lives here.

| Page | Budget at 375px |
| --- | --- |
| Home | 1,600 |
| Matchday | 2,300 |
| Season → any sub-page | 2,200 |
| Players → Leaderboards | 1,400 |
| Records → any sub-page | 2,000 |
| Player detail | 2,400 |
| Opponent detail | 2,000 |
| Players → Squad | no cap on "Show all" — it's a roster, and every name belongs on it once asked for; the default view opens on the top 20 |
| Players → Data centre | no cap — it's the reference table, and every player's row belongs on it |

Records is a reference document and earns length, which is why it splits into
sub-pages rather than shrinking. Home doesn't. The opponent page is the same kind
of document as a Records sub-page and takes the same number. `npm run shots`
reports the real numbers — page by page, at every supported width, into
`shots/heights.json` — and the roadmap tracks each page against its budget.
Seven of these rows are inside now: Matchday's default route (against the 2,300
below — see the note after this table), Players →
Leaderboards (Phase 14, 1,296px), Records' three sub-pages (Phase 16), Season →
Charts (Phase 18, at 1,909px), the opponent page (still light on content, but
measured and inside either way), and Player detail, which Phase 21 brought from
3,127px to 2,241px — mostly by moving the career-arc chart and "Most played alongside"
off the Overview tab and onto Full stats, next to the season table and squad
comparison they already keep company with there, the same split between "what
you open the page for" and "the reference behind it" the two tabs already draw
everywhere else on the page. The season-by-season cards came off the page
entirely rather than moving: they repeated, in less detail, the table Full
stats already carries. Home and Season's own results view are still over —
Season is 3,224px, down from 3,379px in Phase 18 (Charts leaving for its own
address and the bars leaving "Most involved" account for that) but a season of
16 played games costs 1,286px on the shared result row before the league table,
the summary or a single fixture is counted, and that arithmetic doesn't close
under 2,200px without cutting games off a page a season is supposed to keep.
Phase 29 owns it, and the lever is the result row becoming a ladder rung.
Home is 2,047px: Phase 19 took it from 2,113px to 1,882px (the result leading,
the next-fixture card collapsing to a row, a redundant form-chip strip coming
off Recent form) and Phase 23's badge, "Goals" label and "Charts" button put
165px back. `LeagueTable` and `RecentForm` alone are most of the page, and
neither shrinks further without breaking the "all ten columns from 360px up"
rule below or cutting Recent form's list under the five results `formOf` shows
everywhere else on the site — so no phase owns Home's gap today, and closing it
means cutting a section rather than shaving one. `check:layout`
prints the gap on every run without failing on it: the phase that owns each page
closes its own where it can, and a check
that went red for eleven phases would stop being read.

**"No cap" is not "unmeasured".** The roster is 1,671px as a list and 2,138px as
tiles at 375px on the default top-20 view, and every name on the fixture once
"Show all" is asked for — 49 of them, since the fixture carries two matches the
real season doesn't. That is the whole argument for the row having no budget. It
is still measured at every width, and
that is what caught the tiles collapsing to one a row on a 320px phone and
running to 7,350px: the grid's measure came down to 130px so the narrowest phone
keeps two side by side. A page that has earned its length still has to earn it at
every width.

**Matchday's number moved from 1,900 to 2,300, and that is the one edit this
table has taken.** It is worth being precise about why, because the rule
underneath it — *a budget that gets edited to fit what was built is not a
budget* — is one this site has kept through eleven phases of pages running over.

The rule bites on a page that overran. This is a page whose job changed. The
1,900 was set for a page that was one match plus a way of stepping between
matches; since Phase 25 the same page carries the season's whole archive, one
rung a game, because *Matchday is a ladder with one match open on it* above.
The arithmetic is the ladder's own: 1,900, plus the ~730px eighteen rungs cost,
less the ~330px of stepper, jump strip, form chips and next-fixture card they
replaced, is ~2,300. That was decided before the ladder was built rather than
after it was measured, which is the difference between re-setting a budget and
losing one.

The alternative was to open the ladder on the eight most recent games with the
rest behind a control, and it was rejected on three counts. It re-introduces a
compressed index of the season, which is the object the ladder exists to
replace — the jump strip was a row of coloured chips precisely because the page
couldn't afford the rows. It contradicts the approved flat, which puts every
game on the page and none behind a control. And it breaks Phase 29, which
closes Season's much larger gap by reusing this same component to get ~640px
back *with every game still on the page*; a component whose default hides
two-thirds of a season can't do that job. A rung is already the cheapest row on
this site at ~40px, against the ~80px of the shared result row. Collapsing it
would be shaving. The budget question was about what the page now *is*.

The default route measured 2,218px against the new number, with 82px in hand —
it was 1,812px against the old one, and Phase 20 had taken it there from 1,857px
by moving the pitch address off the scoreboard and attaching each score to its
own team row. The richer routes were still over: the clean-sheet match, thirteen
named with a report, was 2,734px. That gap belonged to Phases 26 and 27 — the
team sheet replacing the squad pills and "Worth noting" going (Phase 26, to
2,682px) — and head to head replacing the comparison card, and above all the
report clamping to ~300 characters, which is what stops whoever wrote it up on
the Sunday from setting the length of the page, are Phase 27's.

Phase 27 shipped both, and the clean-sheet number moved the wrong way first.
The old fixture report was 222 characters — short enough that the clamp never
fired, which proved nothing about it — so it grew to 784 across two paragraphs,
a length the club's own reports do reach. Clamped, the route is now 2,746px:
worse than the 2,682px it replaces, because a bounded ~300 characters of report
is still more than a whole 222, and the six-row tape (points, won, drawn, lost,
scored, conceded, each with its own head and footnote) is real content a
two-line "how it compares" card never carried. That is the honest comparison —
not the clamp failing, but the old number having been measured against a report
too short to need one. What the clamp actually buys is bounded growth: open, the
same route is 3,150px, and that is the number a full unclamped report would have
put on the page regardless of length. The default route moved too, to 2,456px
against its 82px of headroom — purely the tape, since Old Stoics has a row in
the table and the season's most-viewed match now carries the full six-row
comparison the old card never showed. `npm run shots` records all three
(`matchday`, `matchday-clean-sheet`, `matchday-clean-sheet-open`); `check:layout`
reports the overage rather than failing on it, the same as it does for Home and
Season. Matchday's budget moved from 1,900 to 2,300 once already, for the same
reason it may need a second look now: the page's job changed again, in the same
direction the ladder moved it.

Phase 28's rail doesn't close this gap, and measuring it settles why: the
budget is stated at 375px, and the rail only applies above 900px, so the
number this table tracks is untouched — the default route is still 2,456px,
the clean-sheet route still 2,746px clamped and 3,150px open, the same three
figures Phase 27 left. What the rail does move is the reading nobody had
taken yet: at 1400px those same three routes are 2,336px, 2,580px and
2,821px — shorter than at 700px, because the panel no longer stacks under the
whole ladder — but it isn't the number this table tracks, so it isn't this
gap closing. No phase owns the 375px gap yet.

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
spacing and the medallion, because a badge sits on the ground rather than in a
box of its own. See *Badge* above.

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
- **No animation library.** CSS transitions cover everything above.
- **No sixth section.** Depth goes into a sub-page of one of the five, per
  *Structure*. A section is expensive to add and expensive to rename — `App.jsx`
  already carries seven redirect shims.
- **No real per-90 stats.** They need minutes, which nobody is going to type.
  The data centre labels its rate columns "/90" anyway, on request — that's a
  label choice for a familiar shorthand, not new data collection, and the
  table's footnote says so. See *Mobile*.
- **No stored aggregates.** Still true and still the load-bearing rule:
  everything is derived. The two exceptions are league standings and the voted
  Player of the Season, and there is not a third.
