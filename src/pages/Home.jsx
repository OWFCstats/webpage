import { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { ErrorNote, Spinner } from '../components/bits';
import LeagueTable from '../components/LeagueTable';
import LastResult from '../components/home/LastResult';
import NextFixture from '../components/home/NextFixture';
import RecentForm from '../components/home/RecentForm';
import SeasonStats from '../components/home/SeasonStats';
import {
  currentSeasonOf,
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
  const { players, matches, appearances, loading, error } = useData();

  const view = useMemo(() => {
    const currentSeason = currentSeasonOf(matches);
    const seasonMatches = currentSeason
      ? matches.filter((m) => m.season === currentSeason)
      : [];
    const lastMatch = latestResult(seasonMatches);
    return {
      currentSeason,
      // True once a newer season has a row (even just a fixture) — the label
      // says "final" so the summary below it doesn't read as live.
      seasonIsFinal: currentSeason != null && seasonsOf(matches)[0] !== currentSeason,
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
        <p>No data yet. Once the first players and matches are entered, stats will appear here.</p>
      </div>
    );
  }

  const {
    currentSeason, seasonIsFinal, summary, form, next, trend, lastMatch, lastCtx, cleanSheets,
  } = view;

  return (
    <div className="home">
      {currentSeason && (
        <p className="label home-season-note">
          Season {currentSeason}{seasonIsFinal ? ' · final' : ''}
        </p>
      )}

      <LastResult match={lastMatch} ctx={lastCtx} />

      <LeagueTable season={currentSeason} />

      <NextFixture next={next} />

      <RecentForm form={form} trend={trend} />

      <SeasonStats summary={summary} cleanSheets={cleanSheets} />
    </div>
  );
}
