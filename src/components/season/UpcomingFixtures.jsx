import { Link } from 'react-router-dom';
import { VenueBadge } from '../bits';
import { formatDate, formatKickoff } from '../../lib/format';
import { opponentSlug, venueTeam } from '../../lib/matches';

/** What's still to play. Renders nothing at the end of a season rather than an
 *  empty table. */
export default function UpcomingFixtures({ upcoming, teams }) {
  if (upcoming.length === 0) return null;
  return (
    <div className="flat-block">
      <div className="block burnt">Upcoming</div>
      <div className="table-wrap">
        <table className="data">
          <tbody>
            {upcoming.map((m) => {
              const kickoff = formatKickoff(m.kickoff_time);
              const venue = venueTeam(m, teams);
              const venueParts = venue
                ? [venue.pitch_name, venue.pitch_address, venue.postcode].filter(Boolean)
                : [];
              return (
                <tr key={m.id}>
                  <td>
                    {formatDate(m.date)}
                    {kickoff && <div className="muted">{kickoff}</div>}
                  </td>
                  <td>
                    <strong>
                      vs <Link to={`/opponents/${opponentSlug(teams, m)}`}>{m.opponent}</Link>
                    </strong>{' '}
                    <VenueBadge venue={m.venue} />
                    {(venueParts.length > 0 || venue?.map_url) && (
                      <div className="muted fixture-location">
                        {venueParts.join(', ')}
                        {venue.map_url && (
                          <>
                            {venueParts.length > 0 && ' · '}
                            <a href={venue.map_url} target="_blank" rel="noreferrer">Map</a>
                          </>
                        )}
                      </div>
                    )}
                  </td>
                  <td><span className="tag orange">{m.competition}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
