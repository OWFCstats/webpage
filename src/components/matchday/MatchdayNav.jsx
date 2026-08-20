import { Link } from 'react-router-dom';
import { formatDate } from '../../lib/format';
import { isPlayed, matchTitle, resultOf } from '../../lib/matches';

/**
 * The archive: one step either side, and the whole season as a strip of
 * results you can jump straight into. Fixtures keep a blank badge in the strip
 * so the season reads its full length from the first game onwards.
 */
export default function MatchdayNav({ match, season, seasonOrdered, prevMatch, nextMatch, matchNumber, seasonGames }) {
  const played = isPlayed(match);
  return (
    <div className="section">
      {played && (
        <div className="matchday-stepper">
          {prevMatch ? (
            <Link className="nav" to={`/matchday/${prevMatch.id}`} aria-label={`Previous matchday: vs ${matchTitle(prevMatch)}`}>
              ← Previous
            </Link>
          ) : (
            <span className="nav disabled">← Previous</span>
          )}
          <span className="count">Matchday {matchNumber} of {seasonGames} · {season}</span>
          {nextMatch ? (
            <Link className="nav" to={`/matchday/${nextMatch.id}`} aria-label={`Next matchday: vs ${matchTitle(nextMatch)}`}>
              Next →
            </Link>
          ) : (
            <span className="nav disabled">Next →</span>
          )}
        </div>
      )}

      {seasonOrdered.length > 0 && (
        <>
          <div className="label">Jump to a matchday</div>
          <div className="jump-strip">
            {seasonOrdered.map((m) => {
              const current = m.id === match.id;
              return isPlayed(m) ? (
                <Link
                  key={m.id}
                  to={`/matchday/${m.id}`}
                  className={`form-badge ${resultOf(m)}${current ? ' current' : ''}`}
                  title={`${formatDate(m.date)} vs ${m.opponent} (${m.goals_for}–${m.goals_against})`}
                  aria-current={current ? 'page' : undefined}
                >
                  {resultOf(m)}
                </Link>
              ) : (
                <Link
                  key={m.id}
                  to={`/matchday/${m.id}`}
                  className={`form-badge fixture${current ? ' current' : ''}`}
                  title={`${formatDate(m.date)} vs ${m.opponent} (upcoming)`}
                  aria-current={current ? 'page' : undefined}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
