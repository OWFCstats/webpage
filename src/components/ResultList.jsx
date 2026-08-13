import { Link } from 'react-router-dom';
import { formatDate, matchHomeAway, resultOf } from '../lib/stats';

/**
 * One row per played match: result pill, home team, score, away team — read
 * left to right the way a fixture actually reads, with the date beneath.
 * Used in place of a data table wherever the columns would overflow a phone
 * screen.
 */
export default function ResultList({ matches, emptyText = 'Nothing here yet.' }) {
  if (matches.length === 0) return <div className="empty">{emptyText}</div>;
  return (
    <ul className="result-list">
      {matches.map((m) => {
        const { homeTeam, awayTeam, homeGoals, awayGoals } = matchHomeAway(m);
        return (
          <li key={m.id}>
            <Link className="result-row" to={`/matchday/${m.id}`}>
              <span className={`result-pill ${resultOf(m)}`}>{resultOf(m)}</span>
              <span className="who">
                <strong>{homeTeam} {homeGoals}–{awayGoals} {awayTeam}</strong>
                <span className="muted">{formatDate(m.date)} · {m.competition}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
