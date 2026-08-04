import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ErrorNote, FormBadges, Spinner, StatTile } from '../components/bits';
import {
  fixtures,
  formatDate,
  formOf,
  playedMatches,
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

  // One pass over the dataset, above the loading guards so the hook order is
  // stable. seasonsOf sorts newest first, so a new season takes over the
  // dashboard as soon as its first match is saved and the old one drops into
  // the list below.
  const view = useMemo(() => {
    const seasons = seasonsOf(matches);
    const currentSeason = seasons[0];
    const seasonMatches = currentSeason
      ? matches.filter((m) => m.season === currentSeason)
      : [];
    return {
      currentSeason,
      pastSeasons: seasons.slice(1),
      summary: seasonSummary(seasonMatches),
      form: formOf(seasonMatches),
      next: fixtures(matches)[0],
      totals: playerTotals(players, seasonMatches, appearances),
    };
  }, [players, matches, appearances]);

  if (loading) return <Spinner />;
  if (error) return <ErrorNote message={error} />;

  const { currentSeason, pastSeasons, summary, form, next, totals } = view;

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

      {pastSeasons.length > 0 && (
        <div className="section">
          <h2>Previous seasons</h2>
          {pastSeasons.map((s) => (
            <PastSeason
              key={s}
              season={s}
              matches={matches.filter((m) => m.season === s)}
              players={players}
              appearances={appearances}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** A finished season, collapsed to a summary bar until the reader opens it. */
function PastSeason({ season, matches, players, appearances }) {
  const [open, setOpen] = useState(false);
  const summary = useMemo(() => seasonSummary(matches), [matches]);
  // The collapsed bar already needs the top scorer, so the squad aggregate has
  // to happen either way — memoised so opening and closing a season doesn't
  // recompute it, and so the boards below reuse the same pass.
  const totals = useMemo(
    () => playerTotals(players, matches, appearances),
    [players, matches, appearances],
  );
  const topScorer = useMemo(
    () => totals.filter((r) => r.goals > 0).sort((a, b) => b.goals - a.goals)[0],
    [totals],
  );

  return (
    <div className={`past-season${open ? ' open' : ''}`}>
      <button
        type="button"
        className="past-season-bar"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="past-season-name">{season}</span>
        <span className="past-season-facts muted">
          {summary.played} played · {summary.won}W {summary.drawn}D {summary.lost}L
          {topScorer && ` · top scorer ${topScorer.player.name} (${topScorer.goals})`}
        </span>
        <span className="past-season-chevron" aria-hidden="true">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="past-season-body">
          <div className="grid cols-4">
            <StatTile value={summary.played} label="Played" />
            <StatTile value={`${summary.won}-${summary.drawn}-${summary.lost}`} label="W-D-L" />
            <StatTile value={summary.goalsFor} label="Goals scored" />
            <StatTile value={summary.goalsAgainst} label="Goals conceded" />
          </div>
          <div className="grid leaders section">
            <MiniBoard title="Top scorers" rows={totals} statKey="goals" statLabel="goals" linkStat="goals" />
            <MiniBoard title="Most assists" rows={totals} statKey="assists" statLabel="assists" linkStat="assists" />
            <MiniBoard title="Man of the Match" rows={totals} statKey="motm" statLabel="awards" linkStat="motm" />
          </div>
          <div className="card section">
            <table className="data">
              <tbody>
                {playedMatches(matches).map((m) => (
                  <tr key={m.id}>
                    <td>{formatDate(m.date)}</td>
                    <td><Link to={`/matches/${m.id}`}>vs {m.opponent}</Link></td>
                    <td><span className="tag">{m.competition}</span></td>
                    <td className="num"><strong>{m.goals_for}–{m.goals_against}</strong></td>
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
