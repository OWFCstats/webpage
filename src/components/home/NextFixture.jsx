import { Link } from 'react-router-dom';
import { VenueBadge } from '../bits';
import { countdownLabel, formatDate, formatKickoff, initials } from '../../lib/format';
import { opponentSlug, venueTeam } from '../../lib/matches';

/** The first thing a player wants on a Sunday: who, when, and where. */
export default function NextFixture({ next, teams }) {
  const countdown = next ? countdownLabel(next.date) : null;
  const kickoff = next ? formatKickoff(next.kickoff_time) : '';
  const venue = next ? venueTeam(next, teams) : null;
  const venueParts = venue
    ? [venue.pitch_name, venue.pitch_address, venue.postcode].filter(Boolean)
    : [];
  return (
    <section className="sheet home-widget home-next">
      <div className="home-widget-head">
        <div>
          <span className="label">Upcoming</span>
          <h2>{next ? <>{next.opponent} <VenueBadge venue={next.venue} /></> : 'Next fixture'}</h2>
        </div>
      </div>
      {next ? (
        <>
          <div className="fixture-teams">
            <span className="fixture-side">
              <span className="fixture-badge us">OW</span>
              <span className="fixture-team">Old Wellingtonians</span>
            </span>
            <span className="fixture-vs label">v</span>
            <span className="fixture-side">
              <span className="fixture-badge them">{initials(next.opponent)}</span>
              <Link to={`/opponents/${opponentSlug(teams, next)}`} className="fixture-team">
                {next.opponent}
              </Link>
            </span>
          </div>
          <div className="fixture-meta">
            <span><strong>{formatDate(next.date)}</strong>{kickoff && ` · ${kickoff}`}</span>
            <span>{next.competition} <VenueBadge venue={next.venue} /></span>
          </div>
          {(venueParts.length > 0 || venue?.map_url) && (
            <p className="muted fixture-location">
              {venueParts.join(', ')}
              {venue.map_url && (
                <>
                  {venueParts.length > 0 && ' · '}
                  <a href={venue.map_url} target="_blank" rel="noreferrer">Map</a>
                </>
              )}
            </p>
          )}
          {countdown && <span className="fixture-countdown">{countdown}</span>}
        </>
      ) : (
        <div className="empty">No fixture scheduled.</div>
      )}
    </section>
  );
}
