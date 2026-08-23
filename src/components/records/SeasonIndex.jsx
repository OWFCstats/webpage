import { Link } from 'react-router-dom';
import { plural } from '../../lib/format';

/** The row read as a sentence, for anyone who gets it read out rather than
 *  seeing the columns line up. */
function readable(s) {
  const { played, won, drawn, lost, goalsFor, goalsAgainst } = s.summary;
  if (played === 0) return `${s.season} — nothing played yet`;
  return `${s.season} — ${plural(played, 'game', 'games')}, ${won} won, ${drawn} drawn, `
    + `${lost} lost, ${goalsFor} scored, ${goalsAgainst} conceded`;
}

/**
 * An index, not a season view: one row each, and the whole row is the way
 * across to Season with that season already selected.
 *
 * Ten columns hid 319px of themselves inside a scrolling wrap at 375px. Two of
 * them are gone rather than restructured — Top scorer said what the honours
 * board directly above says season by season, and Position was blank on every
 * row, so it is the footnote below until standings are entered. What is left is
 * a ledger: the season on the left, its record and its goals in a column on the
 * right (docs/DESIGN.md → *A list of records is a ledger*).
 */
export default function SeasonIndex({ seasons }) {
  if (seasons.length === 0) {
    return <div className="empty sheet">No season on record yet.</div>;
  }
  return (
    <div className="sheet">
      <ul className="season-index">
        <li className="si-head" aria-hidden="true">
          <span className="label">Season</span>
          <span className="label">W-D-L</span>
          <span className="label">Goals</span>
        </li>
        {seasons.map((s) => {
          const { played, won, drawn, lost, goalsFor, goalsAgainst } = s.summary;
          return (
            <li key={s.season}>
              <Link
                className="si-row"
                to={`/season?season=${encodeURIComponent(s.season)}`}
                aria-label={readable(s)}
              >
                <span className="si-season">{s.season}</span>
                <span className="si-figure">{played === 0 ? '—' : `${won}-${drawn}-${lost}`}</span>
                <span className="si-figure">{played === 0 ? '—' : `${goalsFor}–${goalsAgainst}`}</span>
                {/* Under the figures rather than beside the year: three
                    competitions in a 180px column wrap, and across the row
                    they don't. */}
                <span className="muted si-scope">
                  {played === 0
                    ? 'Fixtures entered, nothing played yet'
                    : `${plural(played, 'game', 'games')} · ${s.competitions.join(' · ')}`}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      {/* Why there is no Position column: it needs the other clubs' results,
          which nobody has entered — docs/ROADMAP.md → Parked. */}
      <p className="muted card-foot">Final positions wait on standings being entered.</p>
    </div>
  );
}
