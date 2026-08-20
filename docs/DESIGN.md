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
exists to fix each one. Three are done; the fourth is what Phase 3 is for.

| Problem | Fix | |
| --- | --- | --- |
| One typeface (Manrope) at weight 800 doing every job | A display face, a text face, and a condensed face for data | done |
| Twelve near-identical tiny-uppercase label styles (0.62–0.75rem) | One label style. 0.75rem is the floor | done |
| Three overlapping palettes (CSS tokens, a chart `SERIES` array, per-component hex props) | One token set. No hex literals in components, ever | done |
| One `.card` class on all ~40 surfaces equally, whatever the section is | Three surfaces with a rule about when each is used | Phase 3 |

The radius and the shadow came across with the token swap rather than waiting
for Phase 3 — the token set has no 12px radius and no shadow for content, so
there was nothing for `.card` to keep. What's left for Phase 3 is the part that
needs judgement: which sections are boards and which are sheets.

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
and engraved marks. Text on a plate is always `--ink` or `--on-board`.

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
every figure, with `font-variant-numeric: tabular-nums`. This is functional,
not stylistic: condensed figures took the ten-column league table from a
side-scroll at every phone width to fitting at 375px with four columns hidden,
and fitting outright at 414. See *Mobile* for what the last 23px costs.

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
a card heading. On a dark ground it takes `--on-board-soft`, scoped next to the
primitive rather than restated by every page that uses a board.

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

For occasions and honours: the matchday scoreboard, a player's hero, the
honours board, the leaderboard leader, the last result on Home.

`--board` ground, `--on-board` text, display face, gold accents, 1px
`--gold` bottom border. No radius above 4px. Sparingly — if half the page is
board, none of it feels like an occasion.

### Sheet — paper, ruled

The default, and where most data lives: tables, lists, squad rows, stat cells,
fixtures.

`--paper` ground, `1px solid var(--rule)` border, `--r` (4px) radius, **no
shadow**. Separation inside a sheet is a hairline rule, not a nested box.

Dropping the shadow and taking the radius from 12px to 4px is most of what
stops this reading as a SaaS dashboard, and `.card` already does both — what
Phase 3 changes is which sections stop being cards at all.

### Plate — metal

Badges and awards only. Never anything else. See below.

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
`--s7` 48. Sections are `--s6` apart, `--s5` on a phone. Card padding is
`--s4`/`--s5`.

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
│      50      │        │      25      │
│ APPEARANCES  │        │    GOALS     │
│  Mar 2026    │        │  3 to go     │
 \____________/          \____________/
    earned                  not yet
```

- **Earned**: metal border and a tinted fill, the mark in Fraunces at
  `--t-headline`, the month earned beneath.
- **Not earned**: `--rule` border, paper fill, mark in `--ink-faint`, and
  "*n* to go". Present and named, visibly not yours. A badge you can't see is
  not an incentive.
- **Tier** by threshold: bronze for the first rung, silver for the middle,
  gold for the top. Because bronze and gold are close at small sizes, the tier
  is also named in the plate's label — colour alone never carries it.

Where they appear:

- **A player's own page**: directly under the hero, above everything else.
  Earned plates first, then the two or three closest to falling. This is the
  first thing a player sees about themselves.
- **Records**: the club board — every plate the club has, with holders' names.

Repeat-count badges (5 hat-tricks, 5 MOTMs) use the same plate with a `×5`
mark. They're derivable from existing appearance rows — no schema change.

### 2. Season awards — the honours board

Singular, one per season, so they belong in a chronological ruled list, not a
grid. A board-surfaced table: season down the left, award across, name in gold.
This is the school-hall honours board, and it reads as one because it's ruled
and gilded rather than boxed.

| Award | Source |
| --- | --- |
| Golden Boot | most goals — derived |
| Assist King | most assists — derived |
| The Dependable | most appearances — derived |
| Most MOTM | most MOTM awards — derived |
| **Player of the Season** | **voted by the players, entered by an admin** |

Player of the Season is the only award a formula can't produce, and inventing
one would be arbitrary and argued with. It needs a `season_awards` table and an
admin field — see `docs/ROADMAP.md`.

### 3. Live progress — removed

The milestone progress bars come out. Five bars on a player's page pushed the
things worth looking at below the fold, and "8 to go" already lives on the
unearned plate, which is a better place for it.

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
- **The league table is the one exception, and it's measured.** All ten columns
  in `--font-data` at `--t-small` with 4px cell padding come to 332px. A 375px
  phone leaves the table 309px inside the card, so P, D, GF and GA still come
  out below 480px. The missing 23px is the card's own 1rem of padding either
  side, not the figures — which makes it Phase 3's to find, not the type's.
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
