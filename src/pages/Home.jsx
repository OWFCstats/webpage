import { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useMe } from '../context/MeContext';
import { ErrorNote, Spinner } from '../components/bits';
import LeagueTable from '../components/LeagueTable';
import LastResult from '../components/home/LastResult';
import NextFixture from '../components/home/NextFixture';
import RecentForm from '../components/home/RecentForm';
import SeasonStats from '../components/home/SeasonStats';
import YourSeason from '../components/home/YourSeason';
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
import { meSummary } from '../lib/me';

export default function Home() {
  const { players, matches, appearances, loading, error } = useData();
  const { meId, pickMe, forgetMe } = useMe();

  // A pick the squad list no longer contains — a player deleted, or a cookie
  // from a previous club — falls back to the question rather than to an error.
  const me = players.find((p) => p.id === meId) ?? null;
  const mine = useMemo(
    () => (me ? meSummary(me, matches, appearances) : null),
    [me, matches, appearances],
  );

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
      {/* Home's top-level heading, and the only one it needs. It says the
          season rather than the club because the masthead already says the
          club (see home.css) — so this line, which was always the page's
          title, is now marked up as one. Unconditional: with players entered
          but no match yet there is no season to name, and a page with no h1
          at all is what this replaced. */}
      <h1 className="label home-season-note">
        {currentSeason
          ? `Season ${currentSeason}${seasonIsFinal ? ' · final' : ''}`
          : 'Old Wellingtonians FC'}
      </h1>

      <LastResult match={lastMatch} ctx={lastCtx} />

      {/* Second, under the result: the first screen owes the squad the last
          result and a name, and this is the section that makes one of those
          names the reader's own. */}
      <YourSeason
        players={players}
        player={me}
        summary={mine}
        onPick={pickMe}
        onForget={forgetMe}
      />

      <LeagueTable season={currentSeason} />

      <NextFixture next={next} />

      <RecentForm form={form} trend={trend} />

      <SeasonStats summary={summary} cleanSheets={cleanSheets} />
    </div>
  );
}
