import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { ErrorNote, Spinner, StatTile } from '../components/bits';
import BarBoard from '../components/BarBoard';
import ResultList from '../components/ResultList';
import {
  playedMatches,
  playerTotals,
  seasonsOf,
  seasonSummary,
} from '../lib/stats';

export default function History() {
  const { players, matches, appearances, loading, error } = useData();

  const view = useMemo(() => {
    if (loading) return null;
    return {
      seasons: seasonsOf(matches),
      allTime: playerTotals(players, matches, appearances),
      summary: seasonSummary(matches),
    };
  }, [loading, players, matches, appearances]);

  if (loading) return <Spinner />;
  if (error) return <ErrorNote message={error} />;

  const { seasons, allTime, summary } = view;

  return (
    <div>
      <h1>History</h1>
      <p className="muted page-intro">
        Every season on record, and the all-time boards. The club's memory lives
        here — season by season below, career totals first.
      </p>

      <div className="grid cols-4">
        <StatTile value={summary.played} label="Matches played" />
        <StatTile value={`${summary.won}-${summary.drawn}-${summary.lost}`} label="All-time W-D-L" />
        <StatTile value={summary.goalsFor} label="Goals scored" />
        <StatTile value={seasons.length} label="Seasons" />
      </div>

      <div className="section">
        <h2>All-time leaders</h2>
        <div className="grid boards">
          <BarBoard title="Goals" rows={allTime} statKey="goals" accent="#b8860b" limit={5} />
          <BarBoard title="Appearances" rows={allTime} statKey="appearances" accent="#3f4149" limit={5} />
          <BarBoard title="Man of the Match" rows={allTime} statKey="motm" accent="#5ba3c9" limit={5} />
        </div>
      </div>

      <div className="section">
        <h2>Season by season</h2>
        {seasons.map((s) => (
          <PastSeason
            key={s}
            season={s}
            matches={matches.filter((m) => m.season === s)}
            players={players}
            appearances={appearances}
          />
        ))}
        {seasons.length === 0 && <div className="empty card">No seasons recorded yet.</div>}
      </div>
    </div>
  );
}

/** A season, collapsed to a summary bar until the reader opens it. */
function PastSeason({ season, matches, players, appearances }) {
  const [open, setOpen] = useState(false);
  const summary = useMemo(() => seasonSummary(matches), [matches]);
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
          <div className="grid boards section">
            <BarBoard title="Goals" rows={totals} statKey="goals" accent="#b8860b" limit={5} />
            <BarBoard title="Assists" rows={totals} statKey="assists" accent="#5ba3c9" limit={5} />
            <BarBoard title="Man of the Match" rows={totals} statKey="motm" accent="#e8772e" limit={5} />
          </div>
          <div className="card section">
            <ResultList matches={playedMatches(matches)} emptyText="No results recorded for this season." />
          </div>
        </div>
      )}
    </div>
  );
}
