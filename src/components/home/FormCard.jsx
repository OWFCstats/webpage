import { Link } from 'react-router-dom';
import { ordinal } from '../../lib/format';

/** "6th" -> ["6", "th"], so the suffix can sit in a <sup> rather than the
 *  display face's own numerals. */
function ordinalParts(n) {
  const full = ordinal(n);
  const num = String(n);
  return [num, full.slice(num.length)];
}

/**
 * The club band's other plate (Phase 58; redrawn to the mock in Phase 67):
 * the season and division as the plate's own heading, league position in the
 * display face with an ordinal superscript and the points beside it, then
 * the last five results as a capped strip of squares, the latest ringed gold
 * — and nothing else, because the fixture plate beside it and the league
 * table two sections down already carry the rest.
 */
export default function FormCard({ label, position, of, points, form }) {
  const [num, suffix] = position != null ? ordinalParts(position) : [null, null];
  return (
    <div className="sheet club-plate form-card">
      <h1 className="label">{label}</h1>

      <div className="form-pos">
        <b>{num != null ? <>{num}<sup>{suffix}</sup></> : '—'}</b>
        {(of || points != null) && (
          <small>
            {of ? `of ${of}` : null}
            {of && points != null ? ' · ' : null}
            {points != null ? `${points} point${points === 1 ? '' : 's'}` : null}
          </small>
        )}
      </div>

      {form.length > 0 && (
        <>
          <span className="label">Recent form · last 5</span>
          <div className="form-strip">
            {form.map(({ match, result, scoreline }, i) => (
              <Link key={match.id} to={`/matchday/${match.id}`} className="form-run">
                <span className={`form-badge ${result}${i === form.length - 1 ? ' latest' : ''}`}>
                  {result}
                </span>
                <small>{scoreline}</small>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
