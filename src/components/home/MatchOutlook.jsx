import { Link } from 'react-router-dom';
import ResultList from '../ResultList';

const SLOTS = 3;

/** Pads a list out to `n` entries with `tbc` placeholders, so a short diary
 *  still fills the row count `ResultList`'s outlook variant keeps to (Phase
 *  59's own "Done means", carried forward by Phase 69's richer row). */
function padded(list, n) {
  if (list.length >= n) return list;
  return [
    ...list,
    ...Array.from({ length: n - list.length }, (_, i) => ({ tbc: true, id: `tbc-${i}` })),
  ];
}

/**
 * Recent results and upcoming fixtures as one card, replacing `RecentForm`:
 * the last three and the next three, each group on `ResultList`'s own
 * `outlook` row (Phase 69) rather than a seventh scoreline shape. A short
 * diary — end of season, or before the fixtures are in — pads out with
 * `TBC` chips instead of shrinking the card, so it's the same height whether
 * the next three fixtures are all in the book or the season has none left.
 */
export default function MatchOutlook({ recent, upcoming }) {
  return (
    <section className="sheet home-widget home-outlook g-outlook">
      <div className="head">
        <h2>Match outlook</h2>
        <Link className="more" to="/matchday">All matches →</Link>
      </div>
      <div className="outlook">
        <div className="ol-group">
          <div className="ol-head">Recent results</div>
          <ResultList matches={padded(recent, SLOTS)} outlook />
        </div>
        <div className="ol-group">
          <div className="ol-head">Upcoming fixtures</div>
          <ResultList matches={padded(upcoming, SLOTS)} outlook />
        </div>
      </div>
    </section>
  );
}
