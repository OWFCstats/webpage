import { Link } from 'react-router-dom';
import { VenueBadge } from '../bits';
import { formatKickoff, weekdayDate } from '../../lib/format';
import { isPlayed, opponentInitials, opponentSlug, resultOf, venueTeam } from '../../lib/matches';

/**
 * The page's one dark occasion: each row carries its own score, so the number
 * is never floating between the two teams it belongs to. A fixture that
 * hasn't been played keeps the same two rows and puts a dash where the score
 * goes — the shape of the page shouldn't change on kick-off. The pitch
 * address lives with the fixture (the "Next up" card) and the opponent's own
 * page, not with a result that's already in the book; the pitch name alone —
 * which side is us — still belongs on the result itself.
 */
export default function Scoreboard({ match, matchNumber, teams }) {
  const played = isPlayed(match);
  const result = resultOf(match);
  const kickoff = formatKickoff(match.kickoff_time);
  const pitch = venueTeam(match, teams)?.pitch_name;
  return (
    <div className="board scoreboard">
      <div className="sb-top">
        <div className="sb-head">
          <span className="block burnt">{match.competition}</span>
          <span className="label">
            {played ? `Matchday ${matchNumber} · ${match.season}` : match.season}
          </span>
          {played && <span className={`result-pill ${result}`}>{result}</span>}
        </div>
        <div className="sb-row us">
          <span className="badge">OW</span>
          <div className="sb-info">
            <span className="team">Old Wellingtonians</span>
          </div>
          <span className={`score${played ? '' : ' upcoming'}`}>{played ? match.goals_for : '–'}</span>
        </div>
        <div className="sb-row them">
          <span className="badge">{opponentInitials(match.opponent)}</span>
          <div className="sb-info">
            <Link to={`/opponents/${opponentSlug(teams, match)}`} className="team">{match.opponent}</Link>
          </div>
          <span className={`score${played ? '' : ' upcoming'}`}>{played ? match.goals_against : '–'}</span>
        </div>
        <p className="sb-meta">
          {played ? (match.walkover ? 'Awarded (walkover)' : 'Full time') : 'Kick-off'}
          {' · '}{weekdayDate(match.date)}{kickoff && `, ${kickoff}`}
          {pitch && ` · ${pitch}`}{' '}
          <VenueBadge venue={match.venue} />
        </p>
      </div>
      {played && match.own_goals_for > 0 && (
        <div className="sb-strip">
          <span>Own goals <strong>{match.own_goals_for}</strong></span>
        </div>
      )}
    </div>
  );
}
