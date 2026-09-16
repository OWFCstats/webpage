import { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useMe } from '../context/MeContext';
import { ErrorNote, Spinner } from '../components/bits';
import LeagueTable from '../components/LeagueTable';
import ClubBand from '../components/home/ClubBand';
import FormCard from '../components/home/FormCard';
import LastGameBar from '../components/home/LastGameBar';
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
  recentFormLine,
  seasonsOf,
  seasonSummary,
} from '../lib/matches';
import { leagueStandings } from '../lib/league';
import { seasonTrend } from '../lib/charts';
import { meSummary } from '../lib/me';

export default function Home() {
  const { players, matches, appearances, teams, leagueRows, loading, error } = useData();
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
    // Same rank line LeagueTable.jsx draws its own table from — Phase 51 owns
    // pulling the two into one place (ROADMAP.md → Next).
    const standings = leagueStandings(leagueRows, teams, currentSeason);
    const ranked = standings.rows.map((r, i) => ({ ...r, rank: r.position ?? i + 1 }));
    const ourRow = ranked.find((r) => r.isUs) ?? null;
    return {
      currentSeason,
      // True once a newer season has a row (even just a fixture) — the label
      // says "final" so the summary below it doesn't read as live.
      seasonIsFinal: currentSeason != null && seasonsOf(matches)[0] !== currentSeason,
      summary: seasonSummary(seasonMatches),
      form: formOf(seasonMatches),
      formLine: recentFormLine(seasonMatches),
      position: ourRow?.rank ?? null,
      divisionSize: ranked.length,
      next: fixtures(matches)[0],
      trend: seasonTrend(seasonMatches),
      lastMatch,
      lastCtx: lastMatch ? matchContext(lastMatch, players, matches, appearances) : null,
      cleanSheets: seasonMatches.filter((m) => isPlayed(m) && m.goals_against === 0).length,
    };
  }, [players, matches, appearances, leagueRows, teams]);

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
    currentSeason, seasonIsFinal, summary, form, formLine, position, divisionSize,
    next, trend, lastMatch, lastCtx, cleanSheets,
  } = view;

  return (
    <div className="home">
      {/* The club band: directly under the masthead, and the first thing on
          the page — the next fixture is what decides whether a reader turns
          up, which is why it leads rather than the result behind it. The
          form card (Phase 58) is the band's other slot. */}
      <ClubBand
        form={<FormCard position={position} of={divisionSize} form={formLine} />}
        fixture={<NextFixture next={next} teams={teams} />}
      />

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

      <LastGameBar match={lastMatch} ctx={lastCtx} />

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

      <RecentForm form={form} trend={trend} />

      <SeasonStats summary={summary} cleanSheets={cleanSheets} />
    </div>
  );
}
