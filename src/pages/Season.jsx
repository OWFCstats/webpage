import { lazy, Suspense, useMemo } from 'react';
import { Link, Navigate, NavLink, useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ErrorNote, Spinner } from '../components/bits';
import LeaderBoards from '../components/LeaderBoards';
import LeagueTable from '../components/LeagueTable';
import SeasonLadder from '../components/SeasonLadder';
import SeasonSummary from '../components/season/SeasonSummary';
import { monthYear, plural } from '../lib/format';
import {
  playedMatches,
  seasonLadder,
  seasonsOf,
  seasonSummary,
  venueSummary,
} from '../lib/matches';
import { playerTotals } from '../lib/players';

// The charts pull in Recharts (~400kB); they stay in their own chunk and load
// only when someone opens /season/stats.
const SeasonStats = lazy(() => import('../components/season/SeasonStats'));

const VIEWS = [
  { to: '/season', end: true, label: 'Season' },
  { to: '/season/stats', end: false, label: 'Stats' },
];

export default function Season({ view }) {
  const { players, matches, appearances, teams, loading, error } = useData();
  const seasons = seasonsOf(matches);
  // Records' season index links a season across as ?season=; the picker
  // takes over from there. Anything unrecognised — an old link, a hand-typed
  // year — falls back to the latest rather than rendering an empty season.
  const [params, setParams] = useSearchParams();
  const asked = params.get('season') ?? 'latest';
  const allSeasons = asked === 'all';

  const season = seasons.includes(asked) ? asked : 'latest';
  const activeSeason = season === 'latest' ? seasons[0] : season;

  const { pool, summary, results, rungs, homeAway, totals } = useMemo(() => {
    // Under All seasons the page is the comparison chart, and the only figure
    // the layout still needs from here is the intro line's count.
    const pool = allSeasons ? matches : matches.filter((m) => m.season === activeSeason);
    return {
      pool,
      summary: seasonSummary(pool),
      results: playedMatches(pool),
      rungs: allSeasons ? [] : seasonLadder(matches, activeSeason),
      homeAway: venueSummary(pool),
      totals: allSeasons ? [] : playerTotals(players, pool, appearances),
    };
  }, [matches, activeSeason, allSeasons, players, appearances]);

  // Every return below is after the last hook: /season and /season/stats render
  // the same component from two routes, so React reconciles rather than
  // remounting and a hook skipped on one of them is a crash on the other.
  //
  // "All seasons" belongs to Stats: this sub-page is one season as a whole, and
  // every all-seasons answer it could give — career totals, every result — is
  // Records' (docs/DESIGN.md → Sections do not grow). An old ?season=all link
  // lands on the comparison rather than on a season it didn't ask for.
  if (allSeasons && view === 'season') return <Navigate to="/season/stats?season=all" replace />;
  if (loading) return <Spinner />;
  if (error) return <ErrorNote message={error} />;

  const isLatestSeason = activeSeason === seasons[0];

  // Games played plus whichever of "started"/"ended" is knowable from the
  // matches on record. Where the club finished is a standings question, and
  // the table below answers it — this line stays about our own results.
  let periodLabel = null;
  if (allSeasons) {
    periodLabel = plural(seasonsOf(results).length, 'season', 'seasons');
  } else if (results.length > 0) {
    const oldest = results[results.length - 1];
    const newest = results[0];
    periodLabel = isLatestSeason
      ? `started ${monthYear(oldest.date)}`
      : `ended ${monthYear(newest.date)}`;
  }

  // The season carries across whichever sub-page the control switches to.
  // All seasons doesn't: Season has no such view, so its tab drops the filter
  // rather than bouncing the reader straight back here.
  const searchFor = (to) => {
    const next = new URLSearchParams(params);
    if (to === '/season' && next.get('season') === 'all') next.delete('season');
    return next.toString();
  };

  // Season's own filter, above the segmented control so it holds across both
  // sub-pages — the mock's .season-filter, built from the site's own chip
  // row rather than a new class (Draft D). All seasons is a chip on Stats
  // only: Season has no such view, so its own filter never offers it.
  const pickSeason = (next) => {
    const nextParams = new URLSearchParams(params);
    if (next === seasons[0]) nextParams.delete('season');
    else nextParams.set('season', next);
    setParams(nextParams);
  };

  return (
    <div>
      <h1>{allSeasons ? 'Every season' : `Season ${activeSeason ?? ''}`}</h1>

      <div className="chip-row" role="group" aria-label="Season">
        <span className="label">Season</span>
        {seasons.map((s) => (
          <button
            key={s}
            type="button"
            className={`chip-btn${!allSeasons && s === activeSeason ? ' active' : ''}`}
            aria-pressed={!allSeasons && s === activeSeason}
            onClick={() => pickSeason(s)}
          >
            {s}
          </button>
        ))}
        {view === 'stats' && (
          <button
            type="button"
            className={`chip-btn${allSeasons ? ' active' : ''}`}
            aria-pressed={allSeasons}
            onClick={() => pickSeason('all')}
          >
            All seasons
          </button>
        )}
      </div>

      <nav className="seg" aria-label="Season view">
        {VIEWS.map((v) => (
          <NavLink
            key={v.to}
            to={{ pathname: v.to, search: searchFor(v.to) }}
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

            <SeasonLadder rungs={rungs} season={activeSeason} teams={teams} />
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
          <SeasonStats season={allSeasons ? 'all' : activeSeason} />
          {allSeasons && (
            <p className="muted card-foot">
              Career totals are on{' '}
              <Link className="more" to="/records/all-time">Records → All-time</Link>
            </p>
          )}
        </Suspense>
      )}
    </div>
  );
}
