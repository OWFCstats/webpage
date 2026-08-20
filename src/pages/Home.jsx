import { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { ErrorNote, Spinner } from '../components/bits';
import LeagueTable from '../components/LeagueTable';
import LastResult from '../components/home/LastResult';
import NextFixture from '../components/home/NextFixture';
import RecentForm from '../components/home/RecentForm';
import SeasonStats from '../components/home/SeasonStats';
import {
  fixtures,
  formOf,
  isPlayed,
  latestResult,
  matchContext,
  seasonsOf,
  seasonSummary,
} from '../lib/matches';
import { seasonTrend } from '../lib/charts';

export default function Home() {
  const { players, matches, appearances, teams, loading, error } = useData();

  const view = useMemo(() => {
    const currentSeason = seasonsOf(matches)[0];
    const seasonMatches = currentSeason
      ? matches.filter((m) => m.season === currentSeason)
      : [];
    const lastMatch = latestResult(seasonMatches);
    return {
      currentSeason,
      summary: seasonSummary(seasonMatches),
      form: formOf(seasonMatches),
      next: fixtures(matches)[0],
      trend: seasonTrend(seasonMatches),
      lastMatch,
      lastCtx: lastMatch ? matchContext(lastMatch, players, matches, appearances) : null,
      cleanSheets: seasonMatches.filter((m) => isPlayed(m) && m.goals_against === 0).length,
    };
  }, [players, matches, appearances]);

  if (loading) return <Spinner />;
  if (error) return <ErrorNote message={error} />;

  if (matches.length === 0 && players.length === 0) {
    return (
      <div className="empty sheet">
        <h1>Old Wellingtonians FC</h1>
        <p>No data yet. Once the first players and matches are entered, stats will appear here.</p>
      </div>
    );
  }

  const {
    currentSeason, summary, form, next, trend, lastMatch, lastCtx, cleanSheets,
  } = view;

  return (
    <div className="home">
      <div className="home-head">
        <h1>Old Wellingtonians FC</h1>
        {currentSeason && <span className="label">Season {currentSeason}</span>}
      </div>

      <div className="home-grid">
        <NextFixture next={next} teams={teams} />
        <LastResult match={lastMatch} ctx={lastCtx} />
      </div>

      <LeagueTable season={currentSeason} />

      <RecentForm form={form} trend={trend} />

      <SeasonStats summary={summary} cleanSheets={cleanSheets} />
    </div>
  );
}
