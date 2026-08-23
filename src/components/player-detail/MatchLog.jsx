import { useState } from 'react';
import { Link } from 'react-router-dom';
import { VenueBadge } from '../bits';
import { formatDate } from '../../lib/format';
import { resultOf } from '../../lib/matches';

/** "Started · 2G 1A · MOTM" — everything a match log row says beyond the
 *  scoreline, in the order it matters. */
function summary(app, match) {
  const bits = [app.started ? 'Started' : 'Sub'];
  const contribution = [
    app.goals > 0 && `${app.goals}G`,
    app.assists > 0 && `${app.assists}A`,
  ].filter(Boolean).join(' ');
  if (contribution) bits.push(contribution);
  if (app.motm) bits.push('MOTM');
  if (match.goals_against === 0) bits.push('Clean sheet');
  if (app.yellows > 0) bits.push(`YC${app.yellows > 1 ? ` ×${app.yellows}` : ''}`);
  if (app.reds > 0) bits.push('RC');
  return bits.join(' · ');
}

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
      {rows.length === 0 ? (
        <div className="empty">No matches match that filter.</div>
      ) : (
        <ul className="result-list">
          {rows.map(({ app, match }) => (
            <li key={app.id} className={app.goals + app.assists > 0 ? 'scored' : undefined}>
              <Link className="result-row" to={`/matchday/${match.id}`}>
                <span className={`result-pill ${resultOf(match)}`}>{resultOf(match)}</span>
                <span className="result-opponent">{match.opponent}</span>
                <span className="result-score">{match.goals_for}–{match.goals_against}</span>
                <VenueBadge venue={match.venue} />
              </Link>
              <span className="muted result-meta">
                {formatDate(match.date)} · {summary(app, match)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
