import { Link } from 'react-router-dom';
import { VenueBadge } from '../bits';
import { formatDate, formatKickoff } from '../../lib/format';
import { isPlayed, opponentSlug, resultOf } from '../../lib/matches';

/** Opponent monograms come off the club name rather than a person's name, so
 *  "Old King's Scholars" has to skip the word that's only punctuation. */
function opponentInitials(name) {
  const words = name.split(' ').filter((w) => /[a-z0-9]/i.test(w));
  return words.map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?';
}

/**
 * The page's one dark occasion: each row carries its own score, so the number
 * is never floating between the two teams it belongs to. A fixture that
 * hasn't been played keeps the same two rows and puts a dash where the score
 * goes — the shape of the page shouldn't change on kick-off. The pitch
 * address lives with the fixture (the "Next up" card) and the opponent's own
 * page, not with a result that's already in the book.
 */
export default function Scoreboard({ match, squad, scorers, teams }) {
  const played = isPlayed(match);
  const kickoff = formatKickoff(match.kickoff_time);
  return (
    <div className="board scoreboard">
      <div className="sb-top">
        <div className="sb-row us">
          <span className="badge">OW</span>
          <div className="sb-info">
            <span className="team">Old Wellingtonians</span>
            <span className="sub">{squad.length > 0 ? `${squad.length} in the squad` : match.season}</span>
          </div>
          <span className={`score${played ? '' : ' upcoming'}`}>{played ? match.goals_for : '–'}</span>
        </div>
        <div className="sb-row them">
          <span className="badge">{opponentInitials(match.opponent)}</span>
          <div className="sb-info">
            <Link to={`/opponents/${opponentSlug(teams, match)}`} className="team">{match.opponent}</Link>
            <span className="sub">
              {formatDate(match.date)}{kickoff && ` · ${kickoff}`} <VenueBadge venue={match.venue} />
            </span>
          </div>
          <span className={`score${played ? '' : ' upcoming'}`}>{played ? match.goals_against : '–'}</span>
        </div>
        <div className="sb-state label">
          {played ? (
            <>
              {match.walkover ? 'Awarded (walkover)' : 'Full time'} · {match.competition}{' '}
              <span className={`result-pill ${resultOf(match)}`}>{resultOf(match)}</span>
            </>
          ) : (
            match.competition
          )}
        </div>
      </div>
      {played && (scorers.length > 0 || match.own_goals_for > 0) && (
        <div className="sb-strip">
          {scorers.length > 0 && (
            <span>
              Scorers{' '}
              <strong>
                {scorers.map((a) => `${a.player.name}${a.goals > 1 ? ` ×${a.goals}` : ''}`).join(', ')}
              </strong>
            </span>
          )}
          {match.own_goals_for > 0 && <span>Own goals <strong>{match.own_goals_for}</strong></span>}
        </div>
      )}
    </div>
  );
}
