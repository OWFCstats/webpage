import { Link, useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ErrorNote, Spinner, StatTile } from '../components/bits';
import {
  formatDate,
  isPlayed,
  playerSeasonBreakdown,
  playerTotals,
  resultOf,
} from '../lib/stats';

export default function PlayerDetail() {
  const { playerId } = useParams();
  const { players, matches, appearances, loading, error } = useData();
  if (loading) return <Spinner />;
  if (error) return <ErrorNote message={error} />;

  const player = players.find((p) => p.id === playerId);
  if (!player) {
    return <div className="empty card">Player not found. <Link className="more" to="/players">All players →</Link></div>;
  }

  const career = playerTotals([player], matches, appearances)[0];
  const seasonsRows = playerSeasonBreakdown(player, matches, appearances);
  const matchById = new Map(matches.map((m) => [m.id, m]));
  const log = appearances
    .filter((a) => a.player_id === player.id && !a.dropout)
    .map((a) => ({ app: a, match: matchById.get(a.match_id) }))
    .filter((r) => r.match && isPlayed(r.match))
    .sort((a, b) => (a.match.date < b.match.date ? 1 : -1));

  return (
    <div>
      <div className="section-head">
        <h1>{player.name}</h1>
        <div>
          {player.position && <span className="tag">{player.position}</span>}{' '}
          {player.status === 'inactive' && <span className="tag orange">inactive</span>}
        </div>
      </div>

      <div className="grid cols-4">
        <StatTile value={career.appearances} label="Appearances" />
        <StatTile value={career.goals} label="Goals" />
        <StatTile value={career.assists} label="Assists" />
        <StatTile value={career.motm} label="MOTM awards" />
      </div>

      <div className="section card">
        <h2>Season by season</h2>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Season</th>
                <th className="num">Apps</th>
                <th className="num">Starts</th>
                <th className="num">Goals</th>
                <th className="num">Assists</th>
                <th className="num">MOTM</th>
                <th className="num">Clean sheets</th>
                <th className="num">Yellows</th>
                <th className="num">Reds</th>
                <th className="num">Dropouts</th>
              </tr>
            </thead>
            <tbody>
              {seasonsRows.map((s) => (
                <tr key={s.season}>
                  <td><strong>{s.season}</strong></td>
                  <td className="num">{s.appearances}</td>
                  <td className="num">{s.starts}</td>
                  <td className="num">{s.goals}</td>
                  <td className="num">{s.assists}</td>
                  <td className="num">{s.motm}</td>
                  <td className="num">{s.cleanSheets}</td>
                  <td className="num">{s.yellows}</td>
                  <td className="num">{s.reds}</td>
                  <td className="num">{s.dropouts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {seasonsRows.length === 0 && <div className="empty">No appearances yet.</div>}
      </div>

      <div className="section card">
        <h2>Match log</h2>
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
              {log.map(({ app, match }) => (
                <tr key={app.id}>
                  <td>{formatDate(match.date)}</td>
                  <td><Link to={`/matches/${match.id}`}>vs {match.opponent}</Link></td>
                  <td>
                    <span className={`result-pill ${resultOf(match)}`}>{resultOf(match)}</span>{' '}
                    {match.goals_for}–{match.goals_against}
                  </td>
                  <td>{app.started ? 'Started' : 'Sub'}</td>
                  <td className="num">{app.goals || ''}</td>
                  <td className="num">{app.assists || ''}</td>
                  <td>
                    {app.motm && <span className="tag">MOTM</span>}{' '}
                    {app.yellows > 0 && <span className="tag orange">YC{app.yellows > 1 ? ` ×${app.yellows}` : ''}</span>}{' '}
                    {app.reds > 0 && <span className="tag orange">RC</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {log.length === 0 && <div className="empty">No matches played yet.</div>}
      </div>
    </div>
  );
}
