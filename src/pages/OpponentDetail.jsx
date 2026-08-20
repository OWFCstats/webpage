import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ErrorNote, Spinner } from '../components/bits';
import HeadToHeadTable from '../components/opponent-detail/HeadToHeadTable';
import MeetingsTable from '../components/opponent-detail/MeetingsTable';
import PitchDetails from '../components/opponent-detail/PitchDetails';
import {
  CLUB_NAME,
  currentStreak,
  opponentMatches,
  seasonSummary,
  venueSummary,
} from '../lib/matches';

function streakSentence(streak) {
  if (!streak) return null;
  const verb = { W: 'Won', D: 'Drawn', L: 'Lost' }[streak.result];
  const noun = streak.count === 1 ? 'the last meeting' : `the last ${streak.count} meetings`;
  return `${verb} ${noun}`;
}

export default function OpponentDetail() {
  const { name } = useParams();
  const { matches, teams, loading, error } = useData();

  const resolved = useMemo(() => opponentMatches(matches, teams, name), [matches, teams, name]);

  if (loading) return <Spinner />;
  if (error) return <ErrorNote message={error} />;
  if (!resolved) {
    return (
      <div className="empty sheet">
        Opponent not found. <Link className="more" to="/season">Full season →</Link>
      </div>
    );
  }

  const { team, matches: oppMatches } = resolved;
  const overall = seasonSummary(oppMatches);
  const { home, away } = venueSummary(oppMatches);
  const meetings = oppMatches.slice().sort((a, b) => (a.date < b.date ? -1 : 1));
  const sentence = streakSentence(currentStreak(oppMatches));

  return (
    <div>
      <div className="section-head">
        <h1>{team.name}</h1>
      </div>
      <p className="muted page-intro">Head-to-head record against {CLUB_NAME}.</p>
      {sentence && <p className="muted">{sentence}.</p>}

      <PitchDetails team={team} />

      <HeadToHeadTable overall={overall} home={home} away={away} />

      <MeetingsTable team={team} meetings={meetings} />
    </div>
  );
}
