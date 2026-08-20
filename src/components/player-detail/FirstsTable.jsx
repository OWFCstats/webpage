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
      <h3 className="label ruled">Firsts &amp; bests</h3>
      <div className="table-wrap">
        <table className="data firsts">
          <tbody>
            <tr>
              <td><strong>Debut</strong></td>
              <td>{formatDate(debut.match.date)}</td>
              <td>
                <Link to={`/matchday/${debut.match.id}`}>vs {matchTitle(debut.match)}</Link>{' '}
                <span className="muted">— {scoreline(debut.match)}</span>
              </td>
            </tr>
            <tr>
              <td><strong>First goal</strong></td>
              <td>{firstGoal ? formatDate(firstGoal.match.date) : '—'}</td>
              <td>
                {firstGoal ? (
                  <>
                    <Link to={`/matchday/${firstGoal.match.id}`}>vs {matchTitle(firstGoal.match)}</Link>{' '}
                    <span className="muted">— appearance {firstGoal.appearanceNo}, {scoreline(firstGoal.match)}</span>
                  </>
                ) : (
                  <span className="muted">Yet to score</span>
                )}
              </td>
            </tr>
            <tr>
              <td><strong>Best game</strong></td>
              <td>{bestGame ? formatDate(bestGame.match.date) : '—'}</td>
              <td>
                {bestGame ? (
                  <>
                    <Link to={`/matchday/${bestGame.match.id}`}>vs {matchTitle(bestGame.match)}</Link>{' '}
                    <span className="muted">— {contribution(bestGame.app)}, {scoreline(bestGame.match)}</span>
                    {bestGame.app.motm && <> <span className="tag">MOTM</span></>}
                  </>
                ) : (
                  <span className="muted">No goals or assists yet</span>
                )}
              </td>
            </tr>
            <tr>
              <td><strong>Best season</strong></td>
              <td>{bestSeason ? bestSeason.season : '—'}</td>
              <td>
                {bestSeason ? (
                  <span className="muted">
                    {plural(bestSeason.appearances, 'app', 'apps')} ·{' '}
                    {plural(bestSeason.goals, 'goal', 'goals')} ·{' '}
                    {plural(bestSeason.assists, 'assist', 'assists')}
                  </span>
                ) : (
                  <span className="muted">—</span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
