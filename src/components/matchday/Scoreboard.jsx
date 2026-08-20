import { Link } from 'react-router-dom';
import { VenueBadge } from '../bits';
import { formatDate, formatKickoff } from '../../lib/format';
import { isPlayed, opponentSlug, resultOf, venueTeam } from '../../lib/matches';

/** Opponent monograms come off the club name rather than a person's name, so
 *  "Old King's Scholars" has to skip the word that's only punctuation. */
function opponentInitials(name) {
  const words = name.split(' ').filter((w) => /[a-z0-9]/i.test(w));
  return words.map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?';
}

/**
 * The page's one dark occasion: us, them, and the score. A fixture that hasn't
 * been played keeps the same frame and puts the date where the score goes —
 * the shape of the page shouldn't change on kick-off.
 */
export default function Scoreboard({ match, squad, scorers, teams }) {
  const played = isPlayed(match);
  const kickoff = formatKickoff(match.kickoff_time);
  const venue = venueTeam(match, teams);
  const venueParts = venue
    ? [venue.pitch_name, venue.pitch_address, venue.postcode].filter(Boolean)
    : [];
  return (
    <div className="board scoreboard">
      <div className="sb-top">
        <div className="sb-side us">
          <span className="badge">OW</span>
          <span className="team">Old Wellingtonians</span>
          <span className="sub">{squad.length > 0 ? `${squad.length} in the squad` : match.season}</span>
        </div>
        <div className="sb-mid">
          {played ? (
            <>
              <span className="score">{match.goals_for}–{match.goals_against}</span>
              <span className="state label">
                {match.walkover ? 'Awarded (walkover)' : 'Full time'} · {match.competition}{' '}
                <span className={`result-pill ${resultOf(match)}`}>{resultOf(match)}</span>
              </span>
            </>
          ) : (
            <>
              <span className="score upcoming">v</span>
              <span className="state label">{formatDate(match.date)} · {match.competition}</span>
            </>
          )}
        </div>
        <div className="sb-side them">
          <span className="badge">{opponentInitials(match.opponent)}</span>
          <Link to={`/opponents/${opponentSlug(teams, match)}`} className="team">{match.opponent}</Link>
          <span className="sub">
            {formatDate(match.date)}{kickoff && ` · ${kickoff}`} <VenueBadge venue={match.venue} />
          </span>
          {(venueParts.length > 0 || venue?.map_url) && (
            <span className="sub">
              {venueParts.join(', ')}
              {venue.map_url && (
                <>
                  {venueParts.length > 0 && ' · '}
                  <a href={venue.map_url} target="_blank" rel="noreferrer">Map</a>
                </>
              )}
            </span>
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
