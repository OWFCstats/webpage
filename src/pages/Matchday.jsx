import { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { ErrorNote, Spinner } from '../components/bits';
import HeadToHead from '../components/matchday/HeadToHead';
import MatchReport from '../components/matchday/MatchReport';
import MotmPlate from '../components/matchday/MotmPlate';
import Scoreboard from '../components/matchday/Scoreboard';
import SeasonLadder from '../components/SeasonLadder';
import TeamSheet from '../components/matchday/TeamSheet';
import { twoRows } from '../lib/league';
import { useIsNarrow } from '../lib/useIsNarrow';
import {
  currentSeasonOf,
  isPlayed,
  latestResult,
  matchContext,
  seasonLadder,
} from '../lib/matches';

export default function Matchday() {
  const { matchId } = useParams();
  const { players, matches, appearances, teams, leagueRows, loading, error } = useData();
  const { session } = useAuth();
  // The rail is a real two-column layout, so the panel is a child of the
  // ladder below 900px and a child of the detail column above it. CSS can
  // restyle a box but it cannot reparent one, and the alternative — leaving
  // the panel inside the ladder and dissolving the ladder with
  // `display: contents` — is what made the open rung stretch to the panel's
  // height. Same hook the charts already use for the same reason.
  const stacked = useIsNarrow('(max-width: 899px)');
  // The report's clamp control, held here rather than in MatchReport: the
  // line above unmounts it when the window crosses 900px, and an opened
  // report should survive a resize.
  const [reportOpen, setReportOpen] = useState(false);

  const view = useMemo(() => {
    const currentSeason = currentSeasonOf(matches);

    // With no id in the URL, land on the most recent PLAYED match in the
    // current season. A season that hasn't kicked off yet has none — that's
    // handled by the caller, not by falling back to an older season.
    const match = matchId
      ? matches.find((m) => m.id === matchId) ?? null
      : latestResult(currentSeason ? matches.filter((m) => m.season === currentSeason) : []);

    const season = match ? match.season : currentSeason;

    return {
      currentSeason,
      season,
      match,
      // Scoped to the match's own season, not to every row: the ladder is this
      // season's archive, and next season's fixtures belong to next season's.
      rungs: season ? seasonLadder(matches, season) : [],
      ctx: match ? matchContext(match, players, matches, appearances) : null,
      rows: match ? twoRows(leagueRows, teams, match.season, match.opponent_team_id) : null,
    };
  }, [matchId, players, matches, appearances, leagueRows, teams]);

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

  const { currentSeason, season, match, rungs, ctx, rows } = view;

  if (matchId && !match) {
    return <div className="empty sheet">Match not found. <Link className="more" to="/season">Full season →</Link></div>;
  }

  // Nothing played in the current season yet: the ladder is every fixture
  // ahead, which is the whole page and the truest thing it can show.
  if (!match) {
    return (
      <div>
        <div className="section-head">
          <h1>{currentSeason ? `Season ${currentSeason}` : 'Old Wellingtonians FC'}</h1>
        </div>
        <p className="muted">{currentSeason ?? 'The new season'} hasn’t started yet.</p>
        <SeasonLadder rungs={rungs} season={season} teams={teams} />
      </div>
    );
  }

  const played = isPlayed(match);
  const {
    squad, motm, dropoutNames, debutIds, seasonAppCount,
    avgFor, avgAgainst, priorMeetings, matchNumber,
  } = ctx;
  const star = motm[0];

  // The match, built once and placed by whichever layout is live. The flat
  // renders it twice and hides one per width, which is fine in a flat and not
  // in a component.
  const scoreboard = <Scoreboard match={match} matchNumber={matchNumber} teams={teams} />;
  const plate = played && star ? <MotmPlate star={star} seasonAppCount={seasonAppCount} /> : null;
  const sheet = (
    <TeamSheet
      squad={squad}
      seasonAppCount={seasonAppCount}
      debutIds={debutIds}
      dropoutNames={dropoutNames}
    />
  );
  const h2h = played ? (
    <HeadToHead
      match={match}
      teams={teams}
      priorMeetings={priorMeetings}
      avgFor={avgFor}
      avgAgainst={avgAgainst}
      us={rows.us}
      them={rows.them}
      division={rows.division}
      updatedAt={rows.updatedAt}
    />
  ) : null;
  const report = (
    <MatchReport
      match={match}
      canWrite={played && Boolean(session)}
      open={reportOpen}
      onToggle={() => setReportOpen((o) => !o)}
    />
  );

  // Stacked: the ladder is the page's spine — the fixtures ahead, the match
  // being read, everything that match has to say, and then the season behind
  // it.
  if (stacked) {
    return (
      <div>
        {scoreboard}
        <SeasonLadder rungs={rungs} season={season} currentId={match.id} teams={teams}>
          <div className="ladder-panel">{plate}{sheet}{h2h}{report}</div>
        </SeasonLadder>
      </div>
    );
  }

  // The rail: the season whole on the left, one match read on the right. The
  // two stacks inside the match sit side by side once the column is wide
  // enough for both — the squad first, because that is what a player opened
  // the page for. See .detail-cols in styles/pages/matchday.css.
  return (
    <div className="matchday-rail">
      <SeasonLadder rungs={rungs} season={season} currentId={match.id} teams={teams} />
      <div className="match-detail">
        {scoreboard}
        <div className="detail-cols">
          <div>{plate}{sheet}</div>
          <div>{h2h}{report}</div>
        </div>
      </div>
    </div>
  );
}
