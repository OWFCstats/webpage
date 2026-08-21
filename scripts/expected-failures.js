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
// Everything on this list today is a table that hides a column at a width it
// was never measured at. What is deliberately *not* on it is the three bugs
// Phase 10 owns: player detail's Firsts & bests, the clipped opponent names in
// "Last 6 played", and the opponent page's meetings table. Those fail the run,
// which is the point — this check is red on main until Phase 10 lands.

export const EXPECTED = [
  {
    invariant: 'table-wrap-scrolls',
    route: 'records',
    owner: 'Phase 16',
    why:
      'Records\' season index hides its two most interesting columns — Position '
      + 'and Top scorer — inside a scrolling wrap. Phase 16 splits Records into '
      + 'sub-pages and rebuilds this table as rows; restructuring it now and again '
      + 'in six phases\' time is the same work twice.',
  },
  {
    invariant: 'table-wrap-scrolls',
    route: 'season',
    match: 'flat-block',
    owner: 'Phase 18',
    why:
      'Season\'s upcoming-fixtures table is 7px too wide at 320px and fits '
      + 'everywhere else. Found by this check rather than by the review, and it '
      + 'is the fixture list — which Phase 18 restructures onto the result row.',
  },
  {
    invariant: 'table-wrap-scrolls',
    route: 'season-all',
    match: 'flat-block',
    owner: 'Phase 18',
    why: 'The same fixtures table as Season, reached through "All seasons".',
  },
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
];
