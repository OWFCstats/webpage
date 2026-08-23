import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { ErrorNote, Spinner } from '../components/bits';
import ComparisonCard from '../components/matchday/ComparisonCard';
import FormAndNext from '../components/matchday/FormAndNext';
import MatchReport from '../components/matchday/MatchReport';
import MatchdayNav from '../components/matchday/MatchdayNav';
import MotmCard from '../components/matchday/MotmCard';
import Scoreboard from '../components/matchday/Scoreboard';
import SquadPills from '../components/matchday/SquadPills';
import WorthNoting from '../components/matchday/WorthNoting';
import {
  currentSeasonOf,
  fixtures,
  formOf,
  isPlayed,
  latestResult,
  matchContext,
} from '../lib/matches';

export default function Matchday() {
  const { matchId } = useParams();
  const { players, matches, appearances, teams, loading, error } = useData();
  const { session } = useAuth();

  const view = useMemo(() => {
    const currentSeason = currentSeasonOf(matches);

    // With no id in the URL, land on the most recent PLAYED match in the
    // current season. A season that hasn't kicked off yet has none — that's
    // handled by the caller, not by falling back to an older season.
    const match = matchId
      ? matches.find((m) => m.id === matchId) ?? null
      : latestResult(currentSeason ? matches.filter((m) => m.season === currentSeason) : []);

    const season = match ? match.season : currentSeason;
    const seasonMatches = season ? matches.filter((m) => m.season === season) : [];
    const seasonOrdered = seasonMatches.slice().sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    const seasonPlayed = seasonOrdered.filter(isPlayed);
    const idx = match ? seasonPlayed.findIndex((m) => m.id === match.id) : -1;

    const currentSeasonMatches = currentSeason ? matches.filter((m) => m.season === currentSeason) : [];

    return {
      currentSeason,
      season,
      match,
      seasonOrdered,
      prevMatch: idx > 0 ? seasonPlayed[idx - 1] : null,
      nextMatch: idx !== -1 && idx < seasonPlayed.length - 1 ? seasonPlayed[idx + 1] : null,
      ctx: match ? matchContext(match, players, matches, appearances) : null,
      form: formOf(currentSeasonMatches),
      nextFixture: fixtures(matches)[0],
    };
  }, [matchId, players, matches, appearances]);

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

  const { currentSeason, season, match, seasonOrdered, prevMatch, nextMatch, ctx, form, nextFixture } = view;

  if (matchId && !match) {
    return <div className="empty sheet">Match not found. <Link className="more" to="/season">Full season →</Link></div>;
  }

  if (!match) {
    return (
      <div>
        <div className="section-head">
          <h1>{currentSeason ? `Season ${currentSeason}` : 'Old Wellingtonians FC'}</h1>
        </div>
        <p className="muted">{currentSeason ?? 'The new season'} hasn’t started yet.</p>
        <FormAndNext form={form} next={nextFixture} teams={teams} />
      </div>
    );
  }

  const played = isPlayed(match);
  const {
    squad, scorers, motm, dropoutNames, debutIds, seasonAppCount, boot,
    avgFor, avgAgainst, priorMeetings, matchNumber, seasonGames,
  } = ctx;
  const star = motm[0];

  return (
    <div>
      <Scoreboard match={match} squad={squad} scorers={scorers} teams={teams} />

      <MatchdayNav
        match={match}
        season={season}
        seasonOrdered={seasonOrdered}
        prevMatch={prevMatch}
        nextMatch={nextMatch}
        matchNumber={matchNumber}
        seasonGames={seasonGames}
      />

      <FormAndNext form={form} next={nextFixture} teams={teams} />

      {played && (star || avgFor != null) && (
        <div className="grid match-cards section">
          {star && <MotmCard star={star} seasonAppCount={seasonAppCount} boot={boot} />}
          {avgFor != null && (
            <ComparisonCard
              match={match}
              avgFor={avgFor}
              avgAgainst={avgAgainst}
              priorMeetings={priorMeetings}
              teams={teams}
            />
          )}
        </div>
      )}

      <WorthNoting match={match} ctx={ctx} />

      <MatchReport match={match} canWrite={played && Boolean(session)} />

      <SquadPills squad={squad} debutIds={debutIds} dropoutNames={dropoutNames} />
    </div>
  );
}
