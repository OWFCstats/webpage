# docs/mocks/

Design flats. Static HTML, opened in a browser, nothing here is imported by the
site or built by Vite — they exist so a design can be argued about before it is
built, and so the next session doesn't re-argue a decision that was already made.

Each flat renders the club's real 2025/26 season (2–3 at home to Old Stoics,
matchday 16) and takes its colour and type from `src/styles/tokens.css`
verbatim, so a chosen direction can be built without inventing a value.

| File | |
| --- | --- |
| `home-stats-draft-d.html` | **The approved Home and Season → Stats design — Draft D.** Two pages at two widths (the chrome bar at the top switches page and 375px/desktop), real 2025/26 figures. Phases 66–73 build this; `docs/DESIGN.md` → *Draft D is the specification* is the written version. **Phases 57–64 were built without this file in the repo, from a prose description, and do not match it** — `docs/ROADMAP.md` → *The redesign — what went wrong*. Open it, at both widths, before touching Home or Stats. |
| `matchday-final.html` | **The approved Matchday design.** Phases 25–28 and 31 build this; `docs/DESIGN.md` → *Matchday is a ladder with one match open on it* is the written version. Open it before touching a Matchday component. |
| `matchday-round2.html` | Round two — the two shortlisted directions, two ways each, and the combination that became the final. Kept for the reasoning, not as a target. |
| `matchday-directions.html` | Round one — five directions for the Matchday page. Same. |

Two things the Matchday flats do that the app must not copy, both noted in the phases
that build them: they use `@container` queries (only because a flat renders
inside a fixed-width frame — the app uses `@media`), and they render the match
panel twice and hide one per width (fine in a flat, not in a component — the
app renders it once and places it, see `DESIGN.md` → *Matchday is a ladder
with one match open on it*).

Draft D carries its own list of things the app must not copy, because it was
drawn as a standalone artifact rather than against the repo:

- Its first three lines are the artifact host's wrapper (`<meta>`, a reset
  `<style>`); the flat proper starts at `<title>`. It is committed byte for
  byte because it is the thing that was signed off — don't tidy it.
- It **copies the tokens inline** under `#app` rather than importing
  `tokens.css`. The values match. Two are its own — `--chart-1: var(--gold)`
  and `--chart-2: var(--board-soft)` — and Phase 66 adds both to `tokens.css`.
- It loads the faces from Google Fonts; the app self-hosts through Fontsource.
- It uses `@container`, a `.card` class (a name `DESIGN.md` bans for a surface —
  the app's is `.club-plate`), hex literals inside the hand-drawn chart SVGs,
  a fixed mock clock for the countdown, and two hard-coded datasets in its
  `<script>`. Every one of those is a flat's shortcut, not a design decision.

What *is* a design decision in it is listed in `docs/DESIGN.md` → *Draft D is
the specification*, and where the flat and that list disagree, ask — that is
the gap the first pass fell through.

One thing `matchday-final.html` carries that the app deliberately does not:
the previous/next `step-nav` under the report. Phase 25 replaced it with the
ladder, where every rung is already a link to its own match.

A flat is a snapshot, not a living document. Once its phases have landed and
the owner has signed the built page off against it, the built page and
`DESIGN.md` win where the two disagree. **Until then the flat wins** — that
is the whole of what Draft D is waiting on, and reading this sentence the
other way round is how phases 57–64 built the wrong pages.
