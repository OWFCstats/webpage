import { Link } from 'react-router-dom';
import ResultList from '../ResultList';

const SLOTS = 3;

/** Pads a list out to `n` entries with `tbc` placeholders, so a short diary
 *  still fills the row `ResultList`'s inline variant keeps to (Phase 59's
 *  own "Done means"). */
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
 * compact inline variant rather than a seventh scoreline shape. A short
 * diary — end of season, or before the fixtures are in — pads out with
 * `TBC` chips instead of shrinking the card.
 */
export default function MatchOutlook({ recent, upcoming }) {
  return (
    <section className="sheet home-widget home-outlook">
      <div className="head">
        <h2>Match outlook</h2>
        <Link className="more" to="/matchday">All matches →</Link>
      </div>
      <div className="outlook-group">
        <span className="label">Recent results</span>
        <ResultList matches={padded(recent, SLOTS)} inline />
      </div>
      <div className="outlook-group">
        <span className="label">Upcoming fixtures</span>
        <ResultList matches={padded(upcoming, SLOTS)} inline />
      </div>
    </section>
  );
}
