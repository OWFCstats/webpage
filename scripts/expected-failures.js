// The failures check:layout knows about, and the phase that owns each one.
//
// The list exists so a run can tell a bug that is already scheduled apart from
// a regression that just landed. Without it the check has one signal for both,
// which means it gets ignored — and a check nobody reads is how two tables came
// to hide a third of themselves through three rounds of measurement
// (ROADMAP → Phase 9).
//
// The rules, because a list like this rots quickly:
//   * every entry names an owning phase and why it isn't being fixed now;
//   * the phase that fixes it deletes the entry in the same commit;
//   * a stale entry — one that has stopped failing — fails the run, so the
//     deletion can't be forgotten;
//   * nothing goes on this list to make a run green. An entry needs a phase
//     that owns it, and if no phase does, the phase you are in does.
//
// Fields: invariant (required), route / dataset / match (optional filters —
// `match` is a substring of the element's path or of its text), owner, why.
//
// The crest is the remaining pair of entries: its ink a bitmap can't be read
// for, at the two places it renders — the masthead on every route, and —
// since Phase 19 — the real thumbnail in Home's compact next-fixture row.
// Both are scoped by element and not by route, because both render wherever
// their component does and a route list would need extending every time a page
// gains a second measured state.
//
// Phase 10's three bugs used to be deliberately absent so the run stayed red
// until they were fixed; they are fixed, so the run is green and anything new
// in it is a regression.
//
// Records' season index, Season's fixtures table and the opponent page's
// home/away split were the tables that used to hide a column here, and all
// three came off this list the same way — Phase 16, Phase 18 and Phase 21
// respectively rebuilt or condensed each so there's no wrap left to scroll.

export const EXPECTED = [
  {
    invariant: 'icon-unmeasurable',
    match: 'a.brand',
    owner: 'Phase 10',
    why:
      'The club uploaded the real public/crest.png mid-Phase 10, straight to '
      + 'this branch, and the masthead now renders it on every route instead of '
      + 'the OW monogram fallback. A bitmap\'s own ink can\'t be read for '
      + 'contrast, so this reports as unmeasurable rather than a pass or a '
      + 'fail — and it is now the only one: Phase 15 redrew motm.svg, the other '
      + 'raster in the repository, as paths. No phase owns verifying the crest '
      + 'visually; if that ever matters it needs vector art, not a wider '
      + 'exemption here. Found kicking off Phase 10, not by the review — the '
      + 'crest didn\'t exist when the review ran.',
  },
  {
    invariant: 'icon-unmeasurable',
    match: 'a.fixture-row > img',
    owner: 'Phase 19',
    why:
      'The next-fixture row draws the same public/crest.png the masthead does, '
      + 'in place of the "OW" text placeholder it carried before the crest '
      + 'existed — a second bitmap render, not a second bug: the masthead\'s own '
      + 'entry above is scoped to a.brand, so this one needs its own line rather '
      + 'than a widened match. Same limitation, same fix if it\'s ever needed: '
      + 'vector art, not a wider exemption here. Scoped to the row and not to a '
      + 'route: it used to say route "home", which meant Phase 48 adding two '
      + 'more states of that same page reported the same crest as two new bugs. '
      + 'The finding is that the fixture row draws a bitmap, wherever it is.',
  },
];
