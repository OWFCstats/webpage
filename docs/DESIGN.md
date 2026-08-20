# Design system

Read this before changing anything visual. If a change needs something this
doc doesn't cover, add it here in the same commit.

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

### What this replaces

The site read as templated for four specific reasons, and the system below
exists to fix each one. All four are done.

| Problem | Fix | |
| --- | --- | --- |
| One typeface (Manrope) at weight 800 doing every job | A display face, a text face, and a condensed face for data | done |
| Twelve near-identical tiny-uppercase label styles (0.62–0.75rem) | One label style. 0.75rem is the floor | done |
| Three overlapping palettes (CSS tokens, a chart `SERIES` array, per-component hex props) | One token set. No hex literals in components, ever | done |
| One `.card` class on all ~40 surfaces equally, whatever the section is | Two surfaces with a rule about when each is used, and a third for badges | done |

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
--paper        #faf8f4   page background. Warm near-white, deliberately not cream
--sheet        #f1eee6   recessed and inset areas, table stripes
--board        #1a1c19   dark sections. Near-black with a green undertone
--board-soft   #262a25   raised areas inside a dark section

--ink          #20221f   body text
--ink-soft     #6a6a63   secondary text, labels           (5.2:1 on paper)
--ink-faint    #9b9a92   disabled, placeholder — never for text that matters
--on-board     #ece9df   text on a dark ground
--on-board-soft #96958c  secondary text on a dark ground
```

The green undertone in `--board` is the one nod to the Sweethatco reference.
It stops the dark sections reading as UI chrome and makes gold sit warmer on
them. Green is *not* a brand colour — it never appears anywhere else.

### Identity

Gold and black are Wellington College's, and they're the kit. They carry
identity, and they mark what matters — never used just to fill space.

```
--gold        #c8952a   brass. Borders, accents, the active state
--gold-leaf   #e8c14f   gold on a dark ground only            (10:1 on board)
--gold-deep   #8f6a14   gold as text on paper                 (4.7:1 on paper)
```

### Accents

The school's baby blue and orange. These carry data and secondary emphasis, so
gold stays scarce enough to mean something.

```
--sky         #8fc4dd   light school blue — fills on dark grounds only
--sky-deep    #2f6f8f   links and text on paper               (5.2:1)
--tangerine   #e07a2f   fills, chart marks on dark grounds
--tangerine-deep #a8501a  text on paper                       (5.2:1)
```

### Results

W/D/L is a convention people read instantly. Keep the colours, tuned to sit
with the rest.

```
--win   #2f7d4f      --draw  #8a8b83      --loss  #b3392f
```

### Metals

Badge tiers. See *Badges* below.

```
--bronze  #a8703f     --silver  #9ca3aa     --gold-tier  #c8952a
```

**Silver fails contrast as text** (2.4:1 on paper). Metals are fills, borders
and engraved marks. Every word on a plate — the tier included — is `--ink` or
`--ink-soft`, never the metal it names.

### Chart series

Fixed order, assigned in sequence, never cycled. Ordered so the two warm darks
aren't adjacent.

```
--series-1  #8f6a14  brass    --series-2  #2f6f8f  blue    --series-3  #a8501a  orange
--series-4  #4a3f7a  plum     --series-5  #2f6b46  green
```

All clear 4.5:1 on paper, so a series colour can also label its own line
directly and skip the legend.

## Type

Two families, three roles.

```css
--font-display: 'Fraunces Variable', Fraunces, Georgia, serif;
--font-text:    'Archivo Variable', Archivo, system-ui, sans-serif;
--font-data:    'Archivo Narrow', 'Archivo Variable', Archivo, system-ui, sans-serif;
```

Self-hosted through `@fontsource`, imported in `main.jsx`, so the type doesn't
depend on a third-party CDN staying up. Fontsource ships the variable faces
under their own family names — `'Fraunces Variable'`, `'Archivo Variable'` —
which is why both spellings are in each stack; the `Variable` one is what
loads.

**Fraunces** (display) — page titles, player names, scores, the mark on a
badge. Variable, with a slightly hand-cut quality that suits an amateur club
rather than a corporate one. Mixed case, always. Weight 500–700, tracking
`-0.015em` at large sizes.

**Archivo** (text) — body copy, buttons, labels, navigation. A grotesque with
enough width to read at 16px on a phone.

**Archivo Narrow** (data) — every table, every league standing, every stat cell,
every figure, with `font-variant-numeric: tabular-nums`. This is functional, not
stylistic: condensed figures are half of why the ten-column league table fits a
375px phone at all. The other half is the surface getting out of its way — see
*Mobile*.

**No all-caps headings.** The one uppercase style is `.label` below, and
nothing else in the site is set in caps.

### Scale

Seven steps. Nothing outside this list, and **0.75rem is the floor** — the old
CSS used forty-nine distinct sizes, twelve of them below the floor and all
doing the same job, which is how a label ended up smaller than the caption
beside it.

| Token | Size | Face | Use |
| --- | --- | --- | --- |
| `--t-display` | 2.75rem / 2rem phone | Fraunces 600 | Page title, big score |
| `--t-headline` | 2rem / 1.6rem phone | Fraunces 600 | Player name, hero figure |
| `--t-title` | 1.5rem | Fraunces 600 | Section heading |
| `--t-subtitle` | 1.125rem | Archivo 600 | Card heading |
| `--t-body` | 1rem | Archivo 400 | Body copy |
| `--t-small` | 0.875rem | Archivo 400 | Secondary, captions |
| `--t-micro` | 0.75rem | Archivo 600 | Labels, and the smallest marks. The floor |

`.label` — the single label style, and the only uppercase in the site.
`--t-micro`, weight 600, tracking `0.08em`, uppercase, `--ink-soft`. Column
headers and section eyebrows. `.label.ruled` adds the hairline that closes off
a heading. On a dark ground it takes `--on-board-soft` — one `.board .label`
rule, where it used to take a list of all five dark sections by name.

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

### Board — dark, gilded

For occasions and honours, and there are five of them: the matchday scoreboard,
a player's hero, the honours board, the leaderboard leader, the last result on
Home. All five render — the leaderboard leader is `LeadBoard` in
`components/BarBoard.jsx`, and it heads the Players page. See *Leaderboards and
the squad* below for which stat earns it.

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

### Plate — metal

Badges and awards only. Never anything else. The shape and the tiers are under
*Badges* below; three things about it as a surface:

- **It is never nested.** A plate is a box, so a plate inside a sheet is the
  box-in-a-box this system rules out — and on a dark ground it would break
  contrast as well. A shelf of plates sits directly on the page, which is also
  what buys three across on a 375px phone instead of two.
- **The shape is two elements, not one.** The outer element is the metal edge,
  the face sits an edge-width inside it, and both carry the clip. One element
  can't do both, because a border follows the border box and the clipped
  corners cut straight through it. The face's corners are cut by the edge width
  less than the plate's, which keeps the two diagonals parallel.
- **It lives in `components/plate.css`, not `primitives.css`.** That is the one
  deliberate exception to surfaces being shared vocabulary, and it is the point:
  keeping the plate with the component that owns it is what stops it being
  reached for as a general-purpose fourth surface. If something that isn't a
  badge wants one, the answer is a sheet.

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

Three kinds, three treatments. They are not interchangeable.

### 1. Career badges — plates

A **plate**: a rectangle with the bottom two corners clipped, like an engraved
nameplate hung on a board. One shape for every badge. The metal carries the
tier; an engraved label carries the category. One shape, three metals — that's
the whole language.

```
┌──────────────┐        ┌──────────────┐
│    BRONZE    │        │    SILVER    │
│      5       │        │      15      │
│ Appearances  │        │ Appearances  │
│   Nov 2025   │        │   6 to go    │
 \____________/          \____________/
    earned                  not yet
```

Four lines, and each one answers a different question:

- **The tier**, in `.label` — the site's one uppercase style, so a plate needs
  no type of its own. It's a hallmark stamped on metal. It is here because
  bronze and gold are close at 100px and colour alone must never carry the
  tier.
- **The mark**: the rung itself, Fraunces at `--t-headline`, tabular. Always the
  plain count — `5`, not `×5`, even on the repeat badges. One mark format across
  every plate is worth more than per-badge phrasing, and "×3 Hat-tricks" reads
  worse than "3 Hat-tricks" anyway.
- **The category**, mixed case in the text face. Not caps: the tier above it
  already has the uppercase, and two lines of the same shape mean neither reads
  first. Singular at a rung of one — "1 Hat-trick", not "1 Hat-tricks".
- **The note**: the month it landed, or "*n* to go".

Earned takes a 2px metal edge and a fill tinted off that metal. Not earned takes
a 1px `--rule` edge, a paper fill and the mark in `--ink-faint` — present and
named, visibly not yours. A badge you can't see is not an incentive.

**The ladder is fixed, three rungs per badge, one metal each.** Not the rolling
round-number rungs a career total used to chase: a badge has to be nameable, and
"the next multiple of ten" isn't.

| Badge | Bronze | Silver | Gold |
| --- | --- | --- | --- |
| Appearances | 5 | 15 | 30 |
| Goals | 3 | 10 | 25 |
| Assists | 3 | 10 | 25 |
| Clean sheets | 2 | 6 | 15 |
| MOTM | 2 | 5 | 12 |
| Hat-tricks | 1 | 3 | 6 |
| Golden Boots | 1 | 2 | 3 |
| Ever-present | 1 | 2 | 3 |

The numbers are set against a fourteen-game season: bronze inside a first
season for anyone who keeps turning up, silver in a second, gold a mark that
takes years. That calibration is the whole point — a ladder whose bottom rung is
out of reach is decoration. On the season already in the database, fifteen of
the fifty-three names hold at least one plate and nobody holds a silver — which
is what a first season should look like.

The last three can't be read off a career total. A hat-trick, a Golden Boot and
an ever-present season are events, so they're counted off the appearance rows —
still derived, still no schema change.

Where they appear:

- **A player's own page**: directly under the hero, above the view selector and
  everything else. The best metal they hold in each badge first, then the three
  closest to falling, ranked on how far through the rung they are. At 375px that
  puts what they've won and the first thing within reach on the first screen.
- **Records**: the club badge board — all twenty-four, in ladder order rather
  than earned-first, because where the gold stops is the story. Each names
  whoever is furthest past it, or says "Nobody yet".

### 2. Season awards — the honours board

Singular, one per season, so they belong in a chronological ruled list, not a
grid. A `.board` surface: one block per season, newest first, the award as a
caption on the left and the name in gold at the right-hand edge, with an
engraved hairline under each and a firmer one between seasons. The rules are
what make it read as a board rather than as a table that lost its borders.

| Award | Source |
| --- | --- |
| **Player of the Season** | **voted by the players, entered by an admin** |
| Golden Boot | most goals — derived |
| Assist King | most assists — derived |
| The Dependable | most appearances — derived |
| Most MOTM | most MOTM awards — derived |

Player of the Season leads, and the hairline under it is gold rather than the
board's own grey: it separates the one name the players chose from the four the
arithmetic did. It's the only award a formula can't produce — inventing one
would be arbitrary and argued with — so it has a `season_awards` row and an
admin field.

**Not a matrix, and that's a change from what this doc first said.** Five awards
plus a season is six columns of names, and no condensed face fits that on a
375px phone; hiding columns is ruled out under *Mobile*. So the season heads its
own block instead of holding a column. Above 700px it steps out into a left
gutter, which puts the reading order back where a printed board has it — season
down the left, awards across.

A derived award keeps ties whole: two players level at the top both won it, and
the rows can't say which of them mattered more. A voted award carries no mark,
because printing one would imply the arithmetic decided it.

### 3. Live progress — removed

The milestone progress bars are gone, along with `MilestoneStrip`,
`playerMilestones`, `nextMilestone` and the `.ms-*` rules. Five bars on a
player's page pushed the things worth looking at below the fold, and "8 to go"
lives on the unearned plate, which is a better place for it: a bar says how far
along you are, a plate says what you get.

## Leaderboards and the squad

Two views, one nav entry, and the leaderboard is the one that lands: it is the
incentive board, and the roster is a tap behind it. The view and the season sit
in the address as `?view=squad` and `?season=…`, with the defaults left out of
it, so `/players` stays the canonical address and anything longer is a link
somebody meant to send.

### The boards

Six stats — goals, assists, goals + assists, appearances, MOTM, clean sheets —
in that order, declared once in `components/LeaderBoards.jsx` and drawn by the
same component on Players and on Records, so the two can't drift.

**Every board is on the page at once.** The old page put one behind a row of six
chips, and that is most of what made it read as a database rather than a board:
a leaderboard you have to click for can't show you where your name isn't.

One stat is promoted to the dark band (`LeadBoard`), and on Players that's
goals. Only one, because a page carries a single `.board` — which is also why
the all-time set on Records has no lead: the honours board is that page's
occasion.

The row limit is a hard cap of six, ties included. A board that grew to fifty
names every September, when half the squad is level on one goal, would be
useless in the month it matters most.

### Ties

Level is level, and the rows can't say which of them mattered more — the same
rule the honours board follows.

- **Up to three level at the top**, the band names them all — "Owen Gibbons &
  Tom Simeon" — a type step down, with "2 players level at the top" where the
  leader's rate line would be.
- **Past three, the band names nobody**: "Nobody clear yet", and every level
  name drops into the list beneath, all still ranked first. A crowd at the top
  is a fact about the season, not a name to pick out of it.
- **The chase list ranks by competition** — 1, 1, 3 — never by row number.
- **A cut that lands inside a tie says so**: "…and 4 more level on 1." Without
  that line the last name shown reads as the last name there is.

### The squad

A team sheet: monogram, name, then Apps, Goals and Assists in fixed columns
under one set of heads. The head and every row share one
`grid-template-columns`, and that sharing is the point — the old list labelled
all three figures on every row, so "MOTM" made each row a different shape and no
column lined up down the page. Labels belong at the top of a column, once.

Three figures, not four: a fourth column leaves a 375px phone no room for a
name, and MOTM has a board of its own a tap away. Apps leads them, because
turning up is the thing this club is trying to reward.

A zero takes `--ink-soft` — it's true, and it isn't the point. A name wraps
rather than clips: half a name is worse than a two-line one on the page where
people come to find their own.

Behind the list, unchanged, is the full sortable table — thirteen columns in a
`.table-wrap`, for the argument about whose season it was.

The list is `components/SquadList.jsx` with `styles/components/squad-list.css`,
and the Players route now has no page stylesheet at all. `.grid.boards`, the
grid a set of boards sits in, moved to `styles/components/bar-board.css` for the
same reason: two pages can't share a class that lives in one of their page
files.

## Charts

The current charts read as generated because of `type="monotone"` smoothing and
gradient area fills. Rules:

- **`type="linear"`.** A season is a sequence of discrete matches, not a smooth
  curve. Straight segments between real points tell the truth.
- **No gradient fills.** A flat fill at low alpha, or no fill.
- **Horizontal grid only**, hairline `--rule`, no vertical lines, no axis lines.
- **Label the series directly** at the end of its line where there's room, and
  drop the legend. Every series colour clears 4.5:1 on paper, so a label can
  take the line's own colour.
- **Tabular figures** on every axis and tooltip, in `--font-data`.
- **Series colours from the token order.** Never a literal, never a per-call
  prop.
- **Every chart keeps its "Show data" table.** This already exists and is the
  best thing about the current charts — a chart is a view of the numbers, not a
  replacement for them.

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
- **A table that side-scrolls is a bug.** Condensed data figures buy the room;
  where they aren't enough, restructure into rows (`ResultList` is the pattern),
  don't hide columns.
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
  pub table. Sticky save, big inputs, one record per block.

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
