import { lazy, Suspense, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ErrorNote, SeasonSelect, Spinner, StatTile, VenueBadge } from '../components/bits';
import BarBoard from '../components/BarBoard';
import LeagueTable from '../components/LeagueTable';
import ResultList from '../components/ResultList';
import SortableTable from '../components/SortableTable';
import { useIsNarrow } from '../lib/useIsNarrow';
import {
  CLUB_NAME,
  fixtures,
  formatDate,
  formatKickoff,
  matchHomeAway,
  monthYear,
  opponentSlug,
  playedMatches,
  playerTotals,
  resultOf,
  seasonsOf,
  seasonSummary,
  venueSummary,
  venueTeam,
} from '../lib/stats';

// Charts pull in Recharts (~400kB); they stay in their own chunk and load
// only when someone opens the Charts view.
const SeasonCharts = lazy(() => import('../components/SeasonCharts'));

/** League points from a W-D-L summary. */
function pointsOf(summary) {
  return summary.won * 3 + summary.drawn;
}

export default function Season() {
  const { players, matches, appearances, teams, loading, error } = useData();
  const seasons = seasonsOf(matches);
  // Records links a season across as ?season=; the picker takes over from
  // there. Anything unrecognised — an old link, a hand-typed year — falls back
  // to the latest rather than rendering an empty season.
  const [params] = useSearchParams();
  const [picked, setSeason] = useState(() => params.get('season') ?? 'latest');
  const season = picked === 'all' || seasons.includes(picked) ? picked : 'latest';
  const [view, setView] = useState('results');
  const narrow = useIsNarrow();

  if (loading) return <Spinner />;
  if (error) return <ErrorNote message={error} />;

  const activeSeason = season === 'latest' ? seasons[0] : season;
  const pool = season === 'all' ? matches : matches.filter((m) => m.season === activeSeason);
  const summary = seasonSummary(pool);
  const results = playedMatches(pool);
  const upcoming = fixtures(pool);
  const homeAway = venueSummary(pool);
  const totals = playerTotals(players, pool, appearances);
  const gd = summary.goalsFor - summary.goalsAgainst;
  const isLatestSeason = season !== 'all' && activeSeason === seasons[0];

  // Games played plus whichever of "started"/"ended" is knowable from the
  // matches on record. Where the club finished is a standings question, and
  // the table below answers it — this line stays about our own results.
  let periodLabel = null;
  if (results.length > 0) {
    const oldest = results[results.length - 1];
    const newest = results[0];
    if (season === 'all') periodLabel = `since ${monthYear(oldest.date)}`;
    else if (isLatestSeason) periodLabel = `started ${monthYear(oldest.date)}`;
    else periodLabel = `ended ${monthYear(newest.date)}`;
  }

  return (
    <div>
      <div className="section-head">
        <h1>{season === 'all' ? 'All seasons' : `Season ${activeSeason ?? ''}`}</h1>
        <SeasonSelect
          seasons={seasons}
          value={season === 'latest' ? (seasons[0] ?? 'all') : season}
          onChange={setSeason}
        />
      </div>
      <p className="muted page-intro">
        {summary.played} played{periodLabel ? ` · ${periodLabel}` : ''}
      </p>

      <div className="season-layout">
        <div className="season-main">
          {/* The whole division, not the window Home shows. "All seasons" has
              no standings of its own, so it falls back to the latest — which
              is why the widget still names the season it's showing. */}
          <LeagueTable season={season === 'all' ? seasons[0] : activeSeason} full showSeasonLink={false} />

          <div className="card section">
            <h2>Results</h2>
            {narrow ? (
              <ResultList matches={results} emptyText="No results in this season yet." />
            ) : (
              <SortableTable
                filterable
                rows={results}
                rowKey={(m) => m.id}
                initialSort={{ key: 'date', dir: 'desc' }}
                emptyText="No results in this season yet."
                columns={[
                  { key: 'date', label: 'Date', render: (m) => formatDate(m.date) },
                  {
                    key: 'home',
                    label: 'Home',
                    sortValue: (m) => matchHomeAway(m).homeTeam,
                    render: (m) => {
                      const { homeTeam } = matchHomeAway(m);
                      return homeTeam === CLUB_NAME
                        ? <strong>{homeTeam}</strong>
                        : <Link to={`/matchday/${m.id}`}>{homeTeam}</Link>;
                    },
                  },
                  {
                    key: 'result',
                    label: 'Score',
                    num: true,
                    sortValue: (m) => m.goals_for - m.goals_against,
                    render: (m) => {
                      const { homeGoals, awayGoals } = matchHomeAway(m);
                      return (
                        <>
                          <strong>{homeGoals}–{awayGoals}</strong>{' '}
                          <span className={`result-pill ${resultOf(m)}`}>{resultOf(m)}</span>
                        </>
                      );
                    },
                  },
                  {
                    key: 'away',
                    label: 'Away',
                    sortValue: (m) => matchHomeAway(m).awayTeam,
                    render: (m) => {
                      const { awayTeam } = matchHomeAway(m);
                      return awayTeam === CLUB_NAME
                        ? <strong>{awayTeam}</strong>
                        : <Link to={`/matchday/${m.id}`}>{awayTeam}</Link>;
                    },
                  },
                  { key: 'competition', label: 'Competition', render: (m) => <span className="tag">{m.competition}</span> },
                  {
                    key: 'report',
                    label: '',
                    render: (m) => (m.report ? <Link className="more" to={`/matchday/${m.id}`}>Report →</Link> : ''),
                  },
                ]}
              />
            )}
          </div>

          {upcoming.length > 0 && (
            <div className="flat-block">
              <div className="label ruled">Upcoming</div>
              <div className="table-wrap">
                <table className="data">
                  <tbody>
                    {upcoming.map((m) => {
                      const kickoff = formatKickoff(m.kickoff_time);
                      const venue = venueTeam(m, teams);
                      const venueParts = venue
                        ? [venue.pitch_name, venue.pitch_address, venue.postcode].filter(Boolean)
                        : [];
                      return (
                        <tr key={m.id}>
                          <td>
                            {formatDate(m.date)}
                            {kickoff && <div className="muted">{kickoff}</div>}
                          </td>
                          <td>
                            <strong>
                              vs <Link to={`/opponents/${opponentSlug(teams, m)}`}>{m.opponent}</Link>
                            </strong>{' '}
                            <VenueBadge venue={m.venue} />
                            {(venueParts.length > 0 || venue?.map_url) && (
                              <div className="muted fixture-location">
                                {venueParts.join(', ')}
                                {venue.map_url && (
                                  <>
                                    {venueParts.length > 0 && ' · '}
                                    <a href={venue.map_url} target="_blank" rel="noreferrer">Map</a>
                                  </>
                                )}
                              </div>
                            )}
                          </td>
                          <td><span className="tag orange">{m.competition}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <aside className="card season-aside">
          <div className="flat-block">
            <div className="label ruled">Season at a glance</div>
            <div className="grid cols-4">
              <StatTile plain value={summary.played} label="Played" />
              <StatTile plain value={`${summary.won}-${summary.drawn}-${summary.lost}`} label="W-D-L" />
              <StatTile plain value={gd > 0 ? `+${gd}` : gd} label="Goal difference" />
              <StatTile
                plain
                value={summary.played ? `${Math.round((summary.won / summary.played) * 100)}%` : '—'}
                label="Win rate"
              />
            </div>
            <div className="table-wrap section">
              <table className="data">
                <thead>
                  <tr>
                    <th></th>
                    <th className="num">P</th>
                    <th className="num">W</th>
                    <th className="num">D</th>
                    <th className="num">L</th>
                    <th className="num">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Home</strong></td>
                    <td className="num">{homeAway.home.played}</td>
                    <td className="num">{homeAway.home.won}</td>
                    <td className="num">{homeAway.home.drawn}</td>
                    <td className="num">{homeAway.home.lost}</td>
                    <td className="num">{pointsOf(homeAway.home)}</td>
                  </tr>
                  <tr>
                    <td><strong>Away</strong></td>
                    <td className="num">{homeAway.away.played}</td>
                    <td className="num">{homeAway.away.won}</td>
                    <td className="num">{homeAway.away.drawn}</td>
                    <td className="num">{homeAway.away.lost}</td>
                    <td className="num">{pointsOf(homeAway.away)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="flat-block">
            <div className="label ruled">Most involved</div>
            <BarBoard rows={totals} statKey="appearances" limit={4} bare />
          </div>

          <div className="flat-block">
            <div className="label ruled">Charts</div>
            <div className="seg" role="tablist" aria-label="Season view">
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
            {view === 'charts' ? (
              <Suspense fallback={<Spinner />}>
                <SeasonCharts season={season} activeSeason={activeSeason} />
              </Suspense>
            ) : (
              <p className="muted" style={{ marginTop: '0.9rem' }}>
                Switch to Charts for the season trend, golden boot race and goals chart.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
