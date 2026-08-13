import { Link } from 'react-router-dom';
import { VenueBadge } from './bits';
import { formatDate, resultOf } from '../lib/stats';

/**
 * One row per played match: result pill, opponent (with date and
 * competition beneath), and the score. Used in place of a data table
 * wherever the columns would overflow a phone screen.
 */
export default function ResultList({ matches, emptyText = 'Nothing here yet.' }) {
  if (matches.length === 0) return <div className="empty">{emptyText}</div>;
  return (
    <ul className="result-list">
      {matches.map((m) => (
        <li key={m.id}>
          <Link className="result-row" to={`/matches/${m.id}`}>
            <span className={`result-pill ${resultOf(m)}`}>{resultOf(m)}</span>
            <span className="who">
              <strong>{m.opponent} <VenueBadge venue={m.venue} /></strong>
              <span className="muted">{formatDate(m.date)} · {m.competition}</span>
            </span>
            <span className="score">{m.goals_for}–{m.goals_against}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
