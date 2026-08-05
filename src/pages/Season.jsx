import { lazy, Suspense, useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ErrorNote, FormBadges, SeasonSelect, Spinner, StatTile } from '../components/bits';
import SortableTable from '../components/SortableTable';
import {
  fixtures,
  formatDate,
  formOf,
  matchTitle,
  playedMatches,
  resultOf,
  seasonsOf,
  seasonSummary,
} from '../lib/stats';

// Charts pull in Recharts (~400kB); they stay in their own chunk and load
// only when someone opens the Charts view.
const SeasonCharts = lazy(() => import('../components/SeasonCharts'));

export default function Season() {
  const { matches, loading, error } = useData();
  const seasons = seasonsOf(matches);
  const [season, setSeason] = useState('latest');
  const [view, setView] = useState('results');

  if (loading) return <Spinner />;
  if (error) return <ErrorNote message={error} />;

  const activeSeason = season === 'latest' ? seasons[0] : season;
  const pool = season === 'all' ? matches : matches.filter((m) => m.season === activeSeason);
  const summary = seasonSummary(pool);
  const results = playedMatches(pool);
  const upcoming = fixtures(pool);
  const gd = summary.goalsFor - summary.goalsAgainst;

  return (
    <div>
      <div className="section-head">
        <h1>{season === 'all' ? 'All seasons' : `Season ${activeSeason ?? ''}`}</h1>
        <FormBadges matches={formOf(pool)} />
      </div>
      <SeasonSelect
        seasons={seasons}
        value={season === 'latest' ? (seasons[0] ?? 'all') : season}
        onChange={setSeason}
      />

      <div className="grid cols-4">
        <StatTile value={summary.played} label="Played" />
        <StatTile value={`${summary.won}-${summary.drawn}-${summary.lost}`} label="W-D-L" />
        <StatTile value={gd > 0 ? `+${gd}` : gd} label="Goal difference" />
        <StatTile
          value={summary.played ? `${Math.round((summary.won / summary.played) * 100)}%` : '—'}
          label="Win rate"
        />
      </div>

      <div className="seg section" role="tablist" aria-label="Season view">
        <button
          type="button"
          role="tab"
          aria-selected={view === 'results'}
          className={view === 'results' ? 'active' : undefined}
          onClick={() => setView('results')}
        >
          Results
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === 'charts'}
          className={view === 'charts' ? 'active' : undefined}
          onClick={() => setView('charts')}
        >
          Charts
        </button>
      </div>

      {view === 'results' ? (
        <>
          {upcoming.length > 0 && (
            <div className="card section">
              <h2>Upcoming</h2>
              <div className="table-wrap">
                <table className="data">
                  <tbody>
                    {upcoming.map((m) => (
                      <tr key={m.id}>
                        <td>{formatDate(m.date)}</td>
                        <td><strong>vs {matchTitle(m)}</strong></td>
                        <td><span className="tag orange">{m.competition}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <div className="card section">
            <SortableTable
              filterable
              rows={results}
              rowKey={(m) => m.id}
              initialSort={{ key: 'date', dir: 'desc' }}
              emptyText="No results in this season yet."
              columns={[
                { key: 'date', label: 'Date', render: (m) => formatDate(m.date) },
                {
                  key: 'opponent',
                  label: 'Opponent',
                  render: (m) => <Link to={`/matches/${m.id}`}>{matchTitle(m)}</Link>,
                },
                { key: 'competition', label: 'Competition', render: (m) => <span className="tag">{m.competition}</span> },
                {
                  key: 'result',
                  label: 'Result',
                  sortValue: (m) => ({ W: 2, D: 1, L: 0 })[resultOf(m)],
                  render: (m) => <span className={`result-pill ${resultOf(m)}`}>{resultOf(m)}</span>,
                },
                {
                  key: 'score',
                  label: 'Score',
                  num: true,
                  sortValue: (m) => m.goals_for - m.goals_against,
                  render: (m) => <strong>{m.goals_for}–{m.goals_against}</strong>,
                },
                {
                  key: 'report',
                  label: '',
                  render: (m) => (m.report ? <Link className="more" to={`/matches/${m.id}`}>Report →</Link> : ''),
                },
              ]}
            />
          </div>
        </>
      ) : (
        <Suspense fallback={<Spinner />}>
          <SeasonCharts season={season} activeSeason={activeSeason} />
        </Suspense>
      )}
    </div>
  );
}
