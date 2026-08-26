# docs/mocks/

Design flats. Static HTML, opened in a browser, nothing here is imported by the
site or built by Vite — they exist so a design can be argued about before it is
built, and so the next session doesn't re-argue a decision that was already made.

Each flat renders the club's real 2025/26 season (2–3 at home to Old Stoics,
matchday 16) and takes its colour and type from `src/styles/tokens.css`
verbatim, so a chosen direction can be built without inventing a value.

| File | |
| --- | --- |
| `matchday-final.html` | **The approved Matchday design.** Phases 25–28 and 31 build this; `docs/DESIGN.md` → *Matchday is a ladder with one match open on it* is the written version. Open it before touching a Matchday component. |
| `matchday-round2.html` | Round two — the two shortlisted directions, two ways each, and the combination that became the final. Kept for the reasoning, not as a target. |
| `matchday-directions.html` | Round one — five directions for the Matchday page. Same. |

Two things the flats do that the app must not copy, both noted in the phases
that build them: they use `@container` queries (only because a flat renders
inside a fixed-width frame — the app uses `@media`), and they render the match
panel twice and hide one per width (fine in a flat, not in a component — the
app renders it once and places it, see `DESIGN.md` → *Matchday is a ladder
with one match open on it*).

One thing `matchday-final.html` carries that the app deliberately does not:
the previous/next `step-nav` under the report. Phase 25 replaced it with the
ladder, where every rung is already a link to its own match.

A flat is a snapshot, not a living document. When the built page and the flat
disagree, the built page and `DESIGN.md` win.
