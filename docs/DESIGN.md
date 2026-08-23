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
judgement that split them is the rule under *Surfaces* below. The plate is the
third, and it is built: twenty-four of them on Records, a player's own shelf
under their hero, and nothing else in the site is one.

One invariant is worth keeping, because it is what stops a fourth surface
arriving by accident: **no class whose name contains `card` draws a surface.**
Several survive as names for objects and layouts — `.card-foot` is the footnote
at the foot of a surface, `.card-mark` is a yellow or a red card, `.lead-card`,
`.chart-card` and `.season-card` name components, and `.season-cards`,
`.player-cards` and `.match-cards` are grids. Every one of them either sets
padding on an element that already carries `.sheet`, or lays out a row. The only
one that touches colour is `.season-card.best`, and it re-tints a sheet rather
than defining one.

So if a rule named `…card…` ever grows a `background`, a `border` and a
`border-radius` together, that's the system drifting back, not a special
case.

## Structure

Three decisions about what a page shows, before any decision about how it looks.

> **Phase 13.** The sub-navigation mechanism landed in 13, and Players is the
> first section running on it — `/players` and `/players/squad` are real
> addresses now. Season and Records are still each one long page: Season's
> Charts move to their own address in Phase 18, when the content is rebuilt
> to fill it, and Records splits in Phase 16, once Phase 14 and 15 have built
> what its three sub-pages show. The result row and the season rule below are
> built — they landed in Phase 10.

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
everything above a single season — badges, honours, club records.

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
Only Phase 15 builds those recolours; until then `plate.css` reads stop 2 of
each ramp, which is what the flat `--bronze`, `--silver` and `--gold-tier`
values it replaced held.

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

For occasions and honours, and there are five of them: the matchday scoreboard,
a player's hero, the honours board, the leaderboard leader, the last result on
Home. All five render — the leaderboard leader is `LeadBoard` in
`components/BarBoard.jsx`, and it heads the Players page. See *Leaderboards and
the squad* below for which stat earns it.

That file goes in Phase 14 and the leader row is rebuilt with the cards. The
occasion survives the component; this paragraph gets updated in that commit
rather than left describing a file that isn't there.

`--board` ground, `--on-board` text, display face, gold accents, 1px `--gold`
bottom border. No radius above 4px. Sparingly — if half the page is board, none
of it feels like an occasion. Measured, since "sparingly" invites argument: no
page is more than one board, and at 375px a board is between 5% and 29% of its
page's height — the 29% being Matchday, where the scoreboard *is* the page.

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

### Plate — replaced by the badge icon

> **Phase 15.** The plate is live today; the icon system replaces it.

The plate — a rectangle with two clipped corners, one shape for every badge —
did its job as a system and failed as a signature. Twenty-four of them, nineteen
saying "Nobody yet", with unearned silver and unearned gold identical because the
tier was carried by a word rather than by the metal.

What replaces it is not a fourth surface. A badge is now **an icon in a metal**,
drawn per badge, and it needs no box: it sits directly on whatever is behind it.
That is what lets a badge appear inline under a player's name, in a leaderboard
row and on a board, which a boxed plate never could.

Three things about a metal as paint rather than as a border, all measured
rather than judged by eye:

- **The band depends on the ground.** A metal is a ramp (see *Metals*), and an
  icon's own tones map onto a slice of it. Mapping onto the whole ramp bleaches
  large light shapes: measured on the committed files, the trophy cup puts 11% of
  its own footprint above 3:1 against paper and the cap 0%. Icons on the ground
  sit low on the ramp; icons on a board sit high.
- **Bronze goes on the ground; the light metals go on a board.** Bronze is a
  dark metal — on green the football measures 0% of its footprint above 3:1, and
  so do the target and the playmaker figure. The light metals have the mirror
  problem on a light page. So career badges live on the ground and season
  trophies live on the board, which is where the pages put them anyway.
- **A ramp cannot recolour a silhouette.** The pipeline reads a drawing's own
  tonal range and maps it onto a slice of the metal. Three of the ten have no
  range to read: assists spans 0.00–0.03 in luminance, goals 0.03–0.03,
  playmaker 0.00–0.00. For those the metal is a flat stop, not a mapped band.
  Appearances (0.00–0.60) and clean sheets (0.00–0.56) are the two career badges
  with enough span for a ramp to do anything.

A dark medallion behind a light metal fixes the light-on-light case and makes a
badge read as an actual medal. **It is no longer parked** — it arrived in the
brief with the artwork, and the measurements say it is not optional: a gold cup
on a light page is 11% whatever the band does, because a cup is mostly highlight.
Phase 15 builds it.

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

> **Phase 15.** The three classes below replace the plate ladder that is live
> today. `lib/awards.js` is the single source for the numbers; if it and this
> table ever disagree, this table is wrong.

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

They do not tier and they do not stack into a bigger version: **winning two
Golden Boots is the same trophy held twice**, shown as a year list. A "3× Golden
Boot" tier would imply the third is worth more than the first, and it isn't. So
there is no bronze Player of the Season and no diamond boot: a trophy is gold.
The cup, the boot and the cap arrive gold in the file; the playmaker figure
arrives as a black silhouette and is recoloured once, to gold, and never again.

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

> **The artwork is here.** Ten drawings in `src/assets/badges/`, one per badge,
> named for the slug its page will use: four career badges, four trophies, the
> MOTM star and the hat-trick. The numbers below are measured against those files
> — the earlier ones were taken in a session whose artwork was never committed.
> The eleventh drawing, `public/crest.png`, arrived mid-Phase 10 — the masthead
> renders it now instead of its `OW` monogram fallback. `docs/ROADMAP.md` →
> *The artwork* holds the full table and the two defects Phase 15 has to fix.
>
> `npm run check:layout` cannot yet hold this. Its icon rule reads `fill` off the
> root `<svg>`, which is one colour for the five nav icons and the sparklines it
> was written against and meaningless for a drawing carrying colour on up to
> thirty-six child paths — on these files it reads the initial value, black. Phase 15
> extends it to composite the rendered footprint. Until then the figures here are
> taken by hand, the same way.

The club's own drawings, recoloured by the ramp rather than hand-tinted: read
each drawing's tonal range, map it onto a slice of the metal. That keeps the
relationships the artwork already has — a glove's palm stays lighter than its
back — and means a redrawn icon re-colours without anyone picking hexes.

Two failure modes are worth writing down because both were shipped once:

- **Do not normalise an icon to the full ramp.** Some drawings are deliberately
  near-monochrome. Stretching two shades of black across dark-to-white turned an
  arrow and a figure almost white and they vanished on the ground. Scale the
  span to the source's own contrast instead — and where there is no span at all,
  as with the target, the football and the playmaker figure, take one stop flat
  rather than inventing a range. See *Plate* above for the measurements.
- **Trophies never render below 20px.** A plinth plus an object below that merges
  into a blob. Career badges and the star hold at 16.

### Live progress — removed

The milestone progress bars are gone, along with `MilestoneStrip`,
`playerMilestones`, `nextMilestone` and the `.ms-*` rules. Five bars on a
player's page pushed the things worth looking at below the fold, and "8 to go"
belongs on the unearned badge: a bar says how far along you are, a badge says
what you get.

## Leaderboards and the squad

Two views behind one nav entry, plus a third for the numbers. **Players is this
season; Records is all time** — the same components, different scope, so the two
can't drift.

> **Phases 14 and 17.** The card format below replaces the six stacked bar
> boards that are live today. Phase 14 comes before Records is split, because
> Records renders this component and can be neither built nor measured without
> it.

### The boards

A grid of cards, one per stat. Each card: a heading with the stat's icon, then
**the top five**, then a footer.

- **The leader takes the board's own dark row** and the display face. One name
  gets the occasion; the rest are a list.
- **Initials where a photo would go.** There are no photographs and there won't
  be for a while, so the placeholder is designed rather than left as a hole.
- **The heading links to the full list.** Five names on the page, everyone a tap
  away.
- **The footer answers "where am I".** `You're 18th of 47 · 2 apps`. That is the
  question the old design answered by making a player scan six boards of six
  names for their own.

**Both pages run the whole list of six.** `LEADERBOARD_STATS` in
`components/LeaderBoards.jsx` is already the one shared list — goals, assists,
goals + assists, appearances, MOTM, clean sheets. Records shows three of them
today; that was a workaround for the page being 4,823px long, and splitting it
fixes the cause rather than the symptom.

**Players carries no all-time scope.** Its season picker offers "All time"
today, which with Records → All-time on the same component is one board reached
two ways — the duplication this split exists to remove. Season's picker loses
its "All seasons" option for the same reason. One question, one address.

**This reverses an earlier rule and the reversal is deliberate.** The previous
system put every board on the page at once, on the grounds that "a leaderboard
you have to click for can't show you where your name isn't". True, and the fix
for it is the footer line, not 2,700px of bar charts. Six capped cards show every
board *and* fit a phone.

**The bars are gone.** A bar next to a number tells you nothing the number
didn't, and it cost every row a second line — which is most of why the page was
2,714px tall.

### Ties

Level is level, and the rows can't say which of them mattered more.

A **rank column** handles this natively — 1, 1, 3 — which is why the card format
gets it for free. The old format had no rank column, so it needed a sentence to
explain each tie, and five of the six boards ended on "…and N more level on X".
With fourteen games and a rotating squad, ties are the normal case: a format that
needs a footnote for the normal case is the wrong format.

Where the cut lands inside a tie, the footer says so, once, in the line that is
already there.

### The squad

A team sheet: monogram, name, then Apps, Goals and Assists in fixed columns
under one set of heads. The head and every row share one `grid-template-columns`,
and that sharing is the point — labels belong at the top of a column, once.

Three figures, not four: a fourth column leaves a 375px phone no room for a name.
Apps leads them, because turning up is the thing this club is trying to reward.

**Every name is on the page.** All 47, not the first 12 with a "Show all" button
— this is the page people open to find themselves, and a player with three
appearances should not have to tap to exist. One affordance for narrowing, the
search box, and that's it; "Full table" and "Show all 47" both go.

**Two views, list or cards.** The list is the team sheet above. Cards give each
player a tile carrying their badge icons, which is what makes the badges visible
without opening a profile. Both views read from one row-shape definition.

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
- Bar and plate fills animate their width/opacity on first paint, 0.4s ease.
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
  inside the wrap, Records' season index still hides **319px** at 375px and
  374px at 320px, taking Position and Top scorer with it, and the sticky first
  column makes it look like a complete table — that one is Phase 16's, which
  rebuilds the table this phase would only have restructured twice. Player
  detail's Firsts & bests hid 122px and cut text mid-word; Phase 10 fixed it by
  moving off a table onto `dl.compare` rather than restyling one.

  So the assertion is: **no `.table-wrap` has `scrollWidth > clientWidth` at any
  supported width**, and no leaf element does either — that second one is the
  clipped-name bug ("Old Cheltonians" needing 82px in 74px). `npm run
  check:layout` owns both, on every route at 320/360/375/414/700/1400 against
  both fixture datasets, and it runs on every pull request.

  It is stated as "a scroller holding a table" rather than as `.table-wrap`, so a
  wrapper introduced later under another name is covered by the rule instead of
  by somebody remembering to add it. The chip rows — the Matchday stepper, the
  season chips — are deliberate horizontal scrollers and hold no table, so they
  fall outside it by construction: a stepper is a control, and scrolling one is
  not a hidden column.

  Running it found two more than the review did, both at widths nobody had
  measured: Season's upcoming-fixtures table hides a handful of pixels at 320px
  (4–7px, depending on the platform's font metrics), and the opponent page's
  home/away split hides 36px at 320px. Neither is being fixed on the way
  past — they are on `scripts/expected-failures.js` against the phases that own
  those pages (18 and 21). That list is the whole reason the check is worth
  having: it can tell a scheduled bug from a regression, and an entry that stops
  failing fails the run, so the phase that fixes one has to delete it.
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
  pub table. Sticky save, big inputs, one record per block. This is also why the
  data centre reports per-appearance rates and not per-90: minutes would be
  eleven to sixteen numbers typed per match on a phone, and entry burden is what
  kills a volunteer-run stats site.

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
| Matchday | 1,900 |
| Season | 2,200 |
| Players → Leaderboards | 1,400 |
| Records → any sub-page | 2,000 |
| Player detail | 2,400 |
| Opponent detail | 2,000 |
| Players → Squad | no cap — it's a roster, and every name belongs on it |

Records is a reference document and earns length, which is why it splits into
sub-pages rather than shrinking. Home doesn't. The opponent page is the same kind
of document as a Records sub-page and takes the same number. `npm run shots`
reports the real numbers — page by page, at every supported width, into
`shots/heights.json` — and the roadmap records where each page started. Every
one of them is over budget today except Matchday, and `check:layout` prints the
gap on every run without failing on it: the phase that owns each page closes its
own, and a check that went red for eleven phases would stop being read.

Matchday is the exception and it is a thin one: 1,857 against 1,900. Phase 20
*adds* to that page — labels on fourteen stepper chips, a key for the squad pills
— so the room has to come from somewhere inside it, and it does: the comparison
table moves onto the result row and the pitch address leaves the scoreboard for
the fixture. **A budget that gets edited to fit what was built is not a budget.**
If it can't be met, that's a finding to write down.

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

One file under `components/` is a surface rather than a component style, and
that is deliberate: `plate.css` holds the third surface because keeping it with
its component is what stops it spreading. See *Plate* above.

These layers are ordered by how broadly a rule applies, not by who owns the
component — which is the opposite of how `src/components/` is arranged, and
deliberately so. `squad-list.css` styles a component only the Players page
renders, and it still belongs under `components/`: it dresses a component, and
the cascade cares about that rather than about which page mounts it.
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
- **No per-90 stats.** They need minutes, which nobody is going to type. See
  *Mobile*.
- **No stored aggregates.** Still true and still the load-bearing rule:
  everything is derived. The two exceptions are league standings and the voted
  Player of the Season, and there is not a third.
