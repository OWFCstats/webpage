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
// One of the two entries here is a table that hides a column at a width it
// was never measured at, against the phase that rebuilds that table. The
// other is the crest, whose ink a bitmap can't be read for. Phase 10's three
// bugs used to be deliberately absent so the run stayed red until they were
// fixed; they are fixed, so the run is green and anything new in it is a
// regression.
//
// Records' season index and Season's fixtures table were the other two
// tables here, and both came off this list the same way — Phase 16 and
// Phase 18 respectively rebuilt each onto the Phase 10 result row, so
// there's no wrap left to scroll. One remains, on the opponent page.

export const EXPECTED = [
  {
    invariant: 'table-wrap-scrolls',
    route: 'opponent',
    match: 'sheet.section',
    owner: 'Phase 21',
    why:
      'The opponent page\'s home/away split hides 36px at 320px and fits from '
      + '360px up. Also found by this check and not by the review. Phase 21 owns '
      + 'the opponent page and its 2,000px budget; the meetings table on the same '
      + 'page is Phase 10\'s and is not on this list.',
  },
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
];
