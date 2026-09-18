import { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useMe } from '../context/MeContext';
import { ErrorNote, Spinner } from '../components/bits';
import LeagueTable from '../components/LeagueTable';
import ClubBand from '../components/home/ClubBand';
import FormCard from '../components/home/FormCard';
import LastGameBar from '../components/home/LastGameBar';
import MatchOutlook from '../components/home/MatchOutlook';
import NextFixture from '../components/home/NextFixture';
import SeasonSoFar from '../components/home/SeasonSoFar';
import YourSeason from '../components/home/YourSeason';
import {
  currentSeasonOf,
  fixtures,
  latestResult,
  matchContext,
  playedMatches,
  recentFormLine,
  scorerLine,
  seasonsOf,
  seasonSummary,
  venueTeam,
} from '../lib/matches';
import { leagueStandings } from '../lib/league';
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
    // The outlook's two groups — most recent results and soonest fixtures,
    // across a season boundary like the next-fixture card always has, so
    // entering next season's diary doesn't strand either list empty early.
    const upcoming = fixtures(matches);
    return {
      currentSeason,
      // True once a newer season has a row (even just a fixture) — the label
      // says "final" so the summary below it doesn't read as live.
      seasonIsFinal: currentSeason != null && seasonsOf(matches)[0] !== currentSeason,
      division: standings.division,
      summary: seasonSummary(seasonMatches),
      formLine: recentFormLine(seasonMatches),
      position: ourRow?.rank ?? null,
      points: ourRow?.points ?? null,
      divisionSize: ranked.length,
      next: upcoming[0],
      // The outlook's own second line (DESIGN.md → *Match outlook*): who
      // scored for a result, the ground for a fixture — ResultList's
      // `outlook` variant just renders whatever `note` it's handed.
      recentResults: playedMatches(matches).slice(0, 3)
        .map((m) => ({ ...m, note: scorerLine(m, players, appearances) })),
      upcomingFixtures: upcoming.slice(0, 3)
        .map((m) => ({ ...m, note: venueTeam(m, teams)?.pitch_name ?? null })),
      lastMatch,
      lastCtx: lastMatch ? matchContext(lastMatch, players, matches, appearances) : null,
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
    currentSeason, seasonIsFinal, division, summary, formLine, position, points, divisionSize,
    next, recentResults, upcomingFixtures, lastMatch, lastCtx,
  } = view;

  // The form plate's own first line (Phase 67) — this was Home's standalone
  // <h1>, moved onto the plate rather than dropped: it's still the page's
  // only heading, and the one-h1 rule is kept by moving it, not doubling it.
  const seasonLabel = currentSeason
    ? `Season ${currentSeason}${seasonIsFinal ? ' · final' : ''}${division ? ` · ${division}` : ''}`
    : 'Old Wellingtonians FC';

  return (
    <div className="home">
      {/* The club band: directly under the masthead, flush and full-bleed —
          the next fixture is what decides whether a reader turns up, which
          is why it leads rather than the result behind it. The form card
          (Phase 58) is the band's other slot. */}
      <ClubBand
        form={<FormCard label={seasonLabel} position={position} of={divisionSize} points={points} form={formLine} />}
        fixture={<NextFixture next={next} teams={teams} />}
      />

      {/* The last result, full-bleed like the band above it — the site's
          second such strip (Phase 68, DESIGN.md → *The club band, under the
          masthead*) — so the first screen leads with a result before
          anything asks the reader to scroll. */}
      <LastGameBar match={lastMatch} ctx={lastCtx} />

      {/* Everything else sits in the page's ordinary column — main.page
          itself has none for Home, now the band and the bar above own being
          full-bleed (styles/layout.css). */}
      <div className="home-column">
        {/* First in the column: the first screen owes the squad the last
            result and a name, and this is the section that makes one of those
            names the reader's own. */}
        <YourSeason
          players={players}
          player={me}
          summary={mine}
          onPick={pickMe}
          onForget={forgetMe}
        />

        {/* Below Your season: the outlook spans both rows on the left, the
            league snapshot and the season's own numbers stack on the right —
            a two-column grid past 900px (the mock's own breakpoint), one
            column on a phone. */}
        <div className="home-grid">
          <MatchOutlook recent={recentResults} upcoming={upcomingFixtures} />
          <LeagueTable season={currentSeason} compact />
          <SeasonSoFar summary={summary} />
        </div>
      </div>
    </div>
  );
}
