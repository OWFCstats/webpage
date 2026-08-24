import { lazy, Suspense, useMemo } from 'react';
import { Link, Navigate, NavLink, useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ErrorNote, SeasonSelect, Spinner } from '../components/bits';
import LeaderBoards from '../components/LeaderBoards';
import LeagueTable from '../components/LeagueTable';
import ResultsTable from '../components/season/ResultsTable';
import SeasonSummary from '../components/season/SeasonSummary';
import UpcomingFixtures from '../components/season/UpcomingFixtures';
import { monthYear } from '../lib/format';
import {
  fixtures,
  playedMatches,
  seasonsOf,
  seasonSummary,
  venueSummary,
} from '../lib/matches';
import { playerTotals } from '../lib/players';

// Charts pull in Recharts (~400kB); they stay in their own chunk and load
// only when someone opens /season/charts.
const SeasonCharts = lazy(() => import('../components/season/SeasonCharts'));

const VIEWS = [
  { to: '/season', end: true, label: 'Season' },
  { to: '/season/charts', end: false, label: 'Charts' },
];

export default function Season({ view }) {
  const { players, matches, appearances, loading, error } = useData();
  const seasons = seasonsOf(matches);
  // Records' season index links a season across as ?season=; the picker
  // takes over from there. Anything unrecognised — an old link, a hand-typed
  // year — falls back to the latest rather than rendering an empty season.
  const [params, setParams] = useSearchParams();
  const asked = params.get('season') ?? 'latest';

  // "All seasons" used to be a picker option here; that board is Records'
  // now (docs/DESIGN.md → Structure), reached once rather than from both
  // sections on the same component. A link built against the old option
  // still lands somewhere useful.
  if (asked === 'all') return <Navigate to="/records/all-time" replace />;

  const season = seasons.includes(asked) ? asked : 'latest';
  const activeSeason = season === 'latest' ? seasons[0] : season;

  const { pool, summary, results, upcoming, homeAway, totals } = useMemo(() => {
    const pool = matches.filter((m) => m.season === activeSeason);
    return {
      pool,
      summary: seasonSummary(pool),
      results: playedMatches(pool),
      upcoming: fixtures(pool),
      homeAway: venueSummary(pool),
      totals: playerTotals(players, pool, appearances),
    };
  }, [matches, activeSeason, players, appearances]);

  if (loading) return <Spinner />;
  if (error) return <ErrorNote message={error} />;

  const isLatestSeason = activeSeason === seasons[0];

  // Games played plus whichever of "started"/"ended" is knowable from the
  // matches on record. Where the club finished is a standings question, and
  // the table below answers it — this line stays about our own results.
  let periodLabel = null;
  if (results.length > 0) {
    const oldest = results[results.length - 1];
    const newest = results[0];
    periodLabel = isLatestSeason
      ? `started ${monthYear(oldest.date)}`
      : `ended ${monthYear(newest.date)}`;
  }

  // The season carries across to whichever sub-page the control switches to.
  const search = params.toString();

  return (
    <div>
      <div className="section-head">
        <h1>Season {activeSeason ?? ''}</h1>
        <SeasonSelect
          seasons={seasons}
          value={season === 'latest' ? (seasons[0] ?? '') : season}
          allowAll={false}
          onChange={(next) => {
            const nextParams = new URLSearchParams(params);
            if (next === seasons[0]) nextParams.delete('season');
            else nextParams.set('season', next);
            setParams(nextParams);
          }}
        />
      </div>

      <nav className="seg" aria-label="Season view">
        {VIEWS.map((v) => (
          <NavLink
            key={v.to}
            to={{ pathname: v.to, search }}
            end={v.end}
            className={({ isActive }) => (isActive ? 'active' : undefined)}
          >
            {v.label}
          </NavLink>
        ))}
      </nav>

      <p className="muted page-intro">
        {summary.played} played{periodLabel ? ` · ${periodLabel}` : ''}
      </p>

      {view === 'season' ? (
        <div className="season-layout">
          <div className="season-main">
            {/* The whole division, not the window Home shows. */}
            <LeagueTable season={activeSeason} full showSeasonLink={false} />

            <ResultsTable results={results} />

            <UpcomingFixtures upcoming={upcoming} />
          </div>

          <aside className="sheet season-aside">
            <SeasonSummary summary={summary} homeAway={homeAway} />

            <div className="section">
              <LeaderBoards rows={totals} stats={['appearances']} limit={4} />
              <p className="muted card-foot">
                Every season together on{' '}
                <Link className="more" to="/records/all-time">Records → All-time</Link>
              </p>
            </div>
          </aside>
        </div>
      ) : (
        <Suspense fallback={<Spinner />}>
          <SeasonCharts season={activeSeason} />
        </Suspense>
      )}
    </div>
  );
}
