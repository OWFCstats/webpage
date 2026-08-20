import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ErrorNote, SeasonSelect, Spinner } from '../components/bits';
import BarBoard from '../components/BarBoard';
import LeagueTable from '../components/LeagueTable';
import ChartsPanel from '../components/season/ChartsPanel';
import ResultsTable from '../components/season/ResultsTable';
import SeasonSummary from '../components/season/SeasonSummary';
import UpcomingFixtures from '../components/season/UpcomingFixtures';
import { useIsNarrow } from '../lib/useIsNarrow';
import { monthYear } from '../lib/format';
import {
  fixtures,
  playedMatches,
  seasonsOf,
  seasonSummary,
  venueSummary,
} from '../lib/matches';
import { playerTotals } from '../lib/players';

export default function Season() {
  const { players, matches, appearances, teams, loading, error } = useData();
  const seasons = seasonsOf(matches);
  // Records links a season across as ?season=; the picker takes over from
  // there. Anything unrecognised — an old link, a hand-typed year — falls back
  // to the latest rather than rendering an empty season.
  const [params] = useSearchParams();
  const [picked, setSeason] = useState(() => params.get('season') ?? 'latest');
  const season = picked === 'all' || seasons.includes(picked) ? picked : 'latest';
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

          <ResultsTable results={results} narrow={narrow} />

          <UpcomingFixtures upcoming={upcoming} teams={teams} />
        </div>

        <aside className="sheet season-aside">
          <SeasonSummary summary={summary} homeAway={homeAway} />

          <div className="flat-block">
            <div className="label ruled">Most involved</div>
            <BarBoard rows={totals} statKey="appearances" limit={4} bare />
          </div>

          <ChartsPanel season={season} activeSeason={activeSeason} />
        </aside>
      </div>
    </div>
  );
}
