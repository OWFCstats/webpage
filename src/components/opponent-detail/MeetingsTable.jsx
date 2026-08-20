import { Link } from 'react-router-dom';
import { formatDate } from '../../lib/format';
import { CLUB_NAME, isPlayed, resultOf } from '../../lib/matches';

/** Every meeting, oldest first, as a neutral fixture list: both clubs named on
 *  the side they played, so the row reads the way the league prints it. */
export default function MeetingsTable({ team, meetings }) {
  return (
    <div className="section">
      <h2>Every meeting</h2>
      <div className="sheet">
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Date</th>
                <th>Home</th>
                <th className="score-cell">Score</th>
                <th>Away</th>
                <th>Competition</th>
              </tr>
            </thead>
            <tbody>
              {meetings.map((m) => {
                const weAreHome = m.venue !== 'A';
                const homeTeam = weAreHome ? CLUB_NAME : team.name;
                const awayTeam = weAreHome ? team.name : CLUB_NAME;
                const homeGoals = weAreHome ? m.goals_for : m.goals_against;
                const awayGoals = weAreHome ? m.goals_against : m.goals_for;
                return (
                  <tr key={m.id}>
                    <td><Link to={`/matchday/${m.id}`}>{formatDate(m.date)}</Link></td>
                    <td>{homeTeam}</td>
                    <td className="score-cell">
                      {isPlayed(m) ? (
                        <>
                          <strong>{homeGoals}–{awayGoals}</strong>{' '}
                          <span className={`result-pill ${resultOf(m)}`}>{resultOf(m)}</span>
                        </>
                      ) : (
                        'v'
                      )}
                    </td>
                    <td>{awayTeam}</td>
                    <td><span className="tag">{m.competition}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {meetings.length === 0 && <div className="empty">No meetings recorded yet.</div>}
        </div>
      </div>
    </div>
  );
}
