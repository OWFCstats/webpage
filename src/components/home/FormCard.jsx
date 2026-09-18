import { Link } from 'react-router-dom';
import { ordinal } from '../../lib/format';

/**
 * The club band's other plate (Phase 58): league position over the last five
 * results, and nothing else — no sentence explaining the standing, no button
 * to go read more of it, because the fixture card beside it already carries
 * both of those and the league table two sections down carries the rest.
 * Each square uses the same `.form-badge` W/D/L colouring as everywhere else
 * on the site, fixed at its own pixel size rather than stretched to fit the
 * row, which is what keeps it square instead of flattening into a pill when
 * the card is squeezed to sit half the fixture card's height.
 */
export default function FormCard({ position, of, form }) {
  return (
    <div className="sheet club-plate form-card">
      <span className="block gold">League position</span>
      <div className="form-position">
        <span className="form-position-value">{position != null ? ordinal(position) : '—'}</span>
        {of ? <span className="form-position-of">of {of}</span> : null}
      </div>
      {form.length > 0 && (
        <div className="form-squares">
          {form.map(({ match, result, scoreline }) => (
            <Link key={match.id} to={`/matchday/${match.id}`} className="form-square">
              <span className={`form-badge ${result}`}>{result}</span>
              <span className="form-square-score">{scoreline}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
