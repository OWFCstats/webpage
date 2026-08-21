# fixtures/

The committed data the site can be rendered against with no Supabase
credentials, and the harness that reads it.

Before this existed there was no way to render a page without a database
behind it, so phases 5, 6 and 8 each wrote a throwaway harness to a slightly
different invariant — which is how two tables came to side-scroll on every
phone while passing three rounds of "measured, not eyeballed" checks. See
`docs/ROADMAP.md` → *Phase 9*.

## Using it

```sh
npm run dev:fixture                      # the real site, on the fixture
npm run shots                            # every route × width, to shots/
npm run check:layout                     # the mobile invariants, as assertions
npm test                                 # lib/ unit tests, over this fixture
```

`npm run dev:fixture` serves `mid-season` by default. `?fixture=pre-season`
switches dataset, and `?admin=1` boots signed in so the admin section is
reachable without a password. Both go in the real query string, before the
hash: `http://localhost:5173/?fixture=pre-season&admin=1#/season`.

## How it is wired

`vite.config.js` aliases `lib/supabase` to `supabase-stub.js` when `FIXTURE` is
set. An alias rather than a flag inside `src/`, because `lib/supabase.js`
exports `null` when it is unconfigured and `DataContext` turns that null into an
error message — so a runtime flag would have to be read in both places and
would leave a dev-only branch in the shipped bundle. `src/` has no idea this
directory exists, and a production build can't pick it up.

Writes in the stub land in memory and are gone on reload. That is enough to
walk an admin flow; it is not a database.

## What is in it

| File | |
| --- | --- |
| `2025-26.json` | the club's real season, parsed from `supabase/import_2025_26.sql` — 53 players, 14 matches, 169 appearances |
| `build.mjs` | the parser that produces it (`npm run fixtures:build`). The JSON is committed; this is its provenance |
| `datasets.js` | the two named datasets, and every deliberate addition to the real season |
| `supabase-stub.js` | the module the alias swaps in |
| `uuid.js` | deterministic ids, so a rebuild doesn't renumber everybody and change every screenshot URL |

Two datasets:

- **`mid-season`** — results behind, two fixtures ahead. The state the site was
  designed against.
- **`pre-season`** — 2025/26 finished, 2026/27 fixtures entered, nothing played
  in them. Today this blanks four of five sections on Home, because the current
  season is derived as the most recent season with any *row*. Phase 10 fixes
  that; this dataset is how it gets checked.

Each dataset carries its own `now`, and the harness pins the browser clock to
it — the fixture countdown reads the clock, and a measurement that changes with
the day it was taken isn't one.

## What was added to the real season, and why

One real season doesn't contain every state a page has to render. Each of these
is a state the club can genuinely produce, and each one is in `datasets.js` next
to the reason it's there:

| Added | Why |
| --- | --- |
| A clean sheet | Fourteen real games, none of them a clean sheet — so the badge, the club record and the honours board all had nothing to render |
| A walkover | 3–0 with no team sheet: the one played match with no appearance rows, which every squad-shaped render has to survive |
| A debutant who scores | First appearance, a goal and the MOTM in it |
| A red card | The real season has three yellows and no reds |
| A late dropout | And by a player with no other appearance, which is the case where every appearance-based stat has to leave a squad member out |
| Two upcoming fixtures | What makes a dataset mid-season rather than an archive. Two, because "next" and "the one after" render differently |
| Next season's fixtures | The `pre-season` dataset |
| Venues, kick-off times | The spreadsheet had neither; one match keeps both null, which is what every pre-migration row looks like |
| Teams | The import has none, and without them no opponent page resolves |
| League standings | Hand-entered in the real thing. Our own row is computed from the dataset's own league results, so the fixture can't contradict itself |
| Player of the Season | The one award no formula produces |
| Two match reports | Roughly the club's own hit rate, and Matchday needs both branches |

Six of the 53 players never appear, which is real: the club's rotating squad is
why the badge ladder excludes most of it, and a fixture that quietly filled
them in would hide the problem phases 14–17 exist to solve.

`tests/fixtures.test.js` asserts every row of that table. A state that falls
out of the fixture takes a page's whole check with it, so it fails the tests
rather than the review.
