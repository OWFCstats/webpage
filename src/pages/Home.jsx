import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ErrorNote, FormBadges, Spinner, StatTile } from '../components/bits';
import {
  fixtures,
  formatDate,
  formOf,
  playerTotals,
  seasonsOf,
  seasonSummary,
} from '../lib/stats';

function MiniBoard({ title, rows, statKey, statLabel, linkStat }) {
  const top = rows
    .filter((r) => r[statKey] > 0)
    .sort((a, b) => b[statKey] - a[statKey])
    .slice(0, 3);
  return (
    <div className="card">
      <h3>{title}</h3>
      {top.length === 0 ? (
        <p className="muted">Nothing recorded yet.</p>
      ) : (
        <table className="data">
          <tbody>
            {top.map((r) => (
              <tr key={r.player.id}>
                <td><Link to={`/players/${r.player.id}`}>{r.player.name}</Link></td>
                <td className="num"><strong>{r[statKey]}</strong> <span className="muted">{statLabel}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p style={{ marginTop: '0.5rem' }}>
        <Link className="more" to={`/leaderboards?stat=${linkStat}`}>Full leaderboard →</Link>
      </p>
    </div>
  );
}

export default function Home() {
  const { players, matches, appearances, loading, error } = useData();
  if (loading) return <Spinner />;
  if (error) return <ErrorNote message={error} />;

  const seasons = seasonsOf(matches);
  const currentSeason = seasons[0];
  const seasonMatches = currentSeason ? matches.filter((m) => m.season === currentSeason) : [];
  const summary = seasonSummary(seasonMatches);
  const form = formOf(seasonMatches);
  const next = fixtures(matches)[0];
  const totals = playerTotals(players, seasonMatches, appearances);

  if (matches.length === 0 && players.length === 0) {
    return (
      <div className="empty card">
        <h1>Old Wellingtonians FC</h1>
        <p>No data yet. Once the first players and matches are entered, stats will appear here.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="section-head">
        <h1>{currentSeason ? `Season ${currentSeason}` : 'Old Wellingtonians FC'}</h1>
        <FormBadges matches={form} />
      </div>

      <div className="grid cols-4">
        <StatTile value={summary.played} label="Played" />
        <StatTile value={`${summary.won}-${summary.drawn}-${summary.lost}`} label="W-D-L" />
        <StatTile value={summary.goalsFor} label="Goals scored" />
        <StatTile value={summary.goalsAgainst} label="Goals conceded" />
      </div>

      {next && (
        <div className="card section">
          <h3>Next fixture</h3>
          <p>
            <strong>vs {next.opponent}</strong> · {formatDate(next.date)}{' '}
            <span className="tag">{next.competition}</span>
          </p>
        </div>
      )}

      <div className="section">
        <div className="section-head">
          <h2>Leaders — {currentSeason ?? 'all time'}</h2>
          <Link className="more" to="/leaderboards">All leaderboards →</Link>
        </div>
        <div className="grid leaders">
          <MiniBoard title="Top scorers" rows={totals} statKey="goals" statLabel="goals" linkStat="goals" />
          <MiniBoard title="Most assists" rows={totals} statKey="assists" statLabel="assists" linkStat="assists" />
          <MiniBoard title="Goal involvements" rows={totals} statKey="goalInvolvements" statLabel="G+A" linkStat="goalInvolvements" />
          <MiniBoard title="Man of the Match" rows={totals} statKey="motm" statLabel="awards" linkStat="motm" />
          <MiniBoard title="Clean sheets" rows={totals} statKey="cleanSheets" statLabel="clean sheets" linkStat="cleanSheets" />
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <h2>Latest results</h2>
          <Link className="more" to="/results">Results & form →</Link>
        </div>
        <div className="card">
          <table className="data">
            <tbody>
              {form.map((m) => (
                <tr key={m.id}>
                  <td>{formatDate(m.date)}</td>
                  <td><Link to={`/matches/${m.id}`}>vs {m.opponent}</Link></td>
                  <td><span className="tag">{m.competition}</span></td>
                  <td className="num">
                    <strong>{m.goals_for}–{m.goals_against}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {form.length === 0 && <div className="empty">No results yet this season.</div>}
        </div>
      </div>
    </div>
  );
}
