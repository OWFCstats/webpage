import { useState } from 'react';
import { Link } from 'react-router-dom';
import { VenueBadge } from '../bits';
import { formatDate } from '../../lib/format';
import { resultOf } from '../../lib/matches';

/** Every game the player has played, filterable by season and by whether they
 *  had a hand in a goal. The filters are local: nobody links to a filtered log. */
export default function MatchLog({ log, seasons }) {
  const [season, setSeason] = useState('all');
  const [goalsOnly, setGoalsOnly] = useState(false);
  const rows = log.filter(
    ({ app, match }) =>
      (season === 'all' || match.season === season) &&
      (!goalsOnly || app.goals + app.assists > 0),
  );
  return (
    <div className="section sheet">
      <div className="section-head">
        <h2>Match log</h2>
        <button
          type="button"
          className={`secondary small${goalsOnly ? ' active' : ''}`}
          aria-pressed={goalsOnly}
          onClick={() => setGoalsOnly((v) => !v)}
        >
          {goalsOnly ? 'All games' : 'Goals & assists only'}
        </button>
      </div>
      {seasons.length > 1 && (
        <div className="chip-row">
          <button
            type="button"
            className={`chip-btn${season === 'all' ? ' active' : ''}`}
            onClick={() => setSeason('all')}
          >
            All seasons
          </button>
          {seasons.map((s) => (
            <button
              key={s}
              type="button"
              className={`chip-btn${season === s ? ' active' : ''}`}
              onClick={() => setSeason(s)}
            >
              {s}
            </button>
          ))}
        </div>
      )}
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Date</th>
              <th>Match</th>
              <th>Result</th>
              <th>Role</th>
              <th className="num">Goals</th>
              <th className="num">Assists</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ app, match }) => (
              <tr key={app.id} className={app.goals + app.assists > 0 ? 'scored-row' : undefined}>
                <td>{formatDate(match.date)}</td>
                <td>
                  <Link to={`/matchday/${match.id}`}>vs {match.opponent}</Link>{' '}
                  <VenueBadge venue={match.venue} />
                </td>
                <td>
                  <span className={`result-pill ${resultOf(match)}`}>{resultOf(match)}</span>{' '}
                  {match.goals_for}–{match.goals_against}
                </td>
                <td>{app.started ? 'Started' : 'Sub'}</td>
                <td className="num">{app.goals || ''}</td>
                <td className="num">{app.assists || ''}</td>
                <td>
                  {app.motm && <span className="tag">MOTM</span>}{' '}
                  {match.goals_against === 0 && <span className="tag">CS</span>}{' '}
                  {app.yellows > 0 && <span className="tag orange">YC{app.yellows > 1 ? ` ×${app.yellows}` : ''}</span>}{' '}
                  {app.reds > 0 && <span className="tag orange">RC</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && <div className="empty">No matches match that filter.</div>}
    </div>
  );
}
