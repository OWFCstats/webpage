import { Link } from 'react-router-dom';
import { formatDate, plural } from '../../lib/format';
import { matchTitle, resultOf } from '../../lib/matches';

/** "2 goals, 1 assist" — the player's own contribution to one game. */
function contribution(app) {
  const bits = [
    app.goals > 0 && `${app.goals} goal${app.goals > 1 ? 's' : ''}`,
    app.assists > 0 && `${app.assists} assist${app.assists > 1 ? 's' : ''}`,
  ].filter(Boolean);
  return bits.join(', ');
}

function scoreline(match) {
  return `${resultOf(match) === 'W' ? 'won' : resultOf(match) === 'L' ? 'lost' : 'drew'} ${match.goals_for}–${match.goals_against}`;
}

export default function FirstsTable({ firsts }) {
  const { debut, firstGoal, bestGame, bestSeason } = firsts;
  if (!debut) return null;
  return (
    <div className="sheet">
      <h3 className="block board">Firsts &amp; bests</h3>
      <dl className="compare">
        <div>
          <dt>Debut</dt>
          <dd>
            {formatDate(debut.match.date)} ·{' '}
            <Link to={`/matchday/${debut.match.id}`}>vs {matchTitle(debut.match)}</Link>{' '}
            <span className="muted">— {scoreline(debut.match)}</span>
          </dd>
        </div>
        <div>
          <dt>First goal</dt>
          <dd>
            {firstGoal ? (
              <>
                {formatDate(firstGoal.match.date)} ·{' '}
                <Link to={`/matchday/${firstGoal.match.id}`}>vs {matchTitle(firstGoal.match)}</Link>{' '}
                <span className="muted">— appearance {firstGoal.appearanceNo}, {scoreline(firstGoal.match)}</span>
              </>
            ) : (
              <span className="muted">Yet to score</span>
            )}
          </dd>
        </div>
        <div>
          <dt>Best game</dt>
          <dd>
            {bestGame ? (
              <>
                {formatDate(bestGame.match.date)} ·{' '}
                <Link to={`/matchday/${bestGame.match.id}`}>vs {matchTitle(bestGame.match)}</Link>{' '}
                <span className="muted">— {contribution(bestGame.app)}, {scoreline(bestGame.match)}</span>
                {bestGame.app.motm && <> <span className="tag">MOTM</span></>}
              </>
            ) : (
              <span className="muted">No goals or assists yet</span>
            )}
          </dd>
        </div>
        <div>
          <dt>Best season</dt>
          <dd>
            {bestSeason ? (
              <span className="muted">
                {bestSeason.season} ·{' '}
                {plural(bestSeason.appearances, 'app', 'apps')} ·{' '}
                {plural(bestSeason.goals, 'goal', 'goals')} ·{' '}
                {plural(bestSeason.assists, 'assist', 'assists')}
              </span>
            ) : (
              <span className="muted">—</span>
            )}
          </dd>
        </div>
      </dl>
    </div>
  );
}
