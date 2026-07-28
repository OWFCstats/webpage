import { Link, useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ErrorNote, Spinner } from '../components/bits';
import { CLEAN_SHEET_POSITIONS, formatDate, isPlayed, resultOf } from '../lib/stats';

export default function MatchDetail() {
  const { matchId } = useParams();
  const { players, matches, appearances, loading, error } = useData();
  if (loading) return <Spinner />;
  if (error) return <ErrorNote message={error} />;

  const match = matches.find((m) => m.id === matchId);
  if (!match) {
    return <div className="empty card">Match not found. <Link className="more" to="/matches">All matches →</Link></div>;
  }

  const playerById = new Map(players.map((p) => [p.id, p]));
  const lineup = appearances
    .filter((a) => a.match_id === match.id)
    .map((a) => ({ ...a, player: playerById.get(a.player_id) }))
    .filter((a) => a.player)
    .sort((a, b) => (b.started - a.started) || a.player.name.localeCompare(b.player.name));

  const starters = lineup.filter((a) => a.started);
  const subs = lineup.filter((a) => !a.started);
  const scorers = lineup.filter((a) => a.goals > 0);
  const motm = lineup.filter((a) => a.motm);
  const played = isPlayed(match);
  const cleanSheet = played && match.goals_against === 0;

  return (
    <div>
      <div className="match-hero">
        <p className="muted">
          {formatDate(match.date)} · {match.competition} · {match.season}
        </p>
        <h1>Old Wellingtonians vs {match.opponent}</h1>
        {played ? (
          <p className="scoreline">
            {match.goals_for}–{match.goals_against}{' '}
            <span className={`result-pill ${resultOf(match)}`}>{resultOf(match)}</span>
          </p>
        ) : (
          <p className="scoreline">Upcoming</p>
        )}
        {played && (
          <p className="muted">
            {scorers.length > 0 &&
              `Scorers: ${scorers.map((a) => `${a.player.name}${a.goals > 1 ? ` ×${a.goals}` : ''}`).join(', ')}`}
            {match.own_goals_for > 0 && ` · Own goals: ${match.own_goals_for}`}
            {motm.length > 0 && ` · MOTM: ${motm.map((a) => a.player.name).join(', ')}`}
          </p>
        )}
      </div>

      {match.report && (
        <div className="section card">
          <h2>Match report</h2>
          <div className="report-body">{match.report}</div>
        </div>
      )}

      {lineup.length > 0 && (
        <div className="section card">
          <h2>Lineup</h2>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Pos</th>
                  <th>Role</th>
                  <th className="num">Goals</th>
                  <th className="num">Assists</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {[...starters, ...subs].map((a) => (
                  <tr key={a.id}>
                    <td><Link to={`/players/${a.player.id}`}>{a.player.name}</Link></td>
                    <td>{a.player.position}</td>
                    <td>{a.started ? 'Started' : 'Sub'}</td>
                    <td className="num">{a.goals || ''}</td>
                    <td className="num">{a.assists || ''}</td>
                    <td>
                      {a.motm && <span className="tag">MOTM</span>}{' '}
                      {cleanSheet && CLEAN_SHEET_POSITIONS.includes(a.player.position) && (
                        <span className="tag">Clean sheet</span>
                      )}{' '}
                      {a.yellows > 0 && <span className="tag orange">YC{a.yellows > 1 ? ` ×${a.yellows}` : ''}</span>}{' '}
                      {a.reds > 0 && <span className="tag orange">RC</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
