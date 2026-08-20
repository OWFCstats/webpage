import { Link } from 'react-router-dom';
import { FormBadges, VenueBadge } from '../bits';
import { formatDate, formatKickoff } from '../../lib/format';
import { opponentSlug, venueTeam } from '../../lib/matches';

/** Next-up fixture: shared between the normal view and the
 *  season-hasn't-started state, so there's one place that knows its shape. */
function NextUp({ next, teams }) {
  if (!next) return null;
  const kickoff = formatKickoff(next.kickoff_time);
  const venue = venueTeam(next, teams);
  const venueParts = venue
    ? [venue.pitch_name, venue.pitch_address, venue.postcode].filter(Boolean)
    : [];
  return (
    <div className="next-up">
      <div className="label">Next up</div>
      <strong>
        <Link to={`/opponents/${opponentSlug(teams, next)}`}>{next.opponent}</Link>{' '}
        <VenueBadge venue={next.venue} />
      </strong>
      <span className="muted">
        {formatDate(next.date)}{kickoff && ` · ${kickoff}`} · {next.competition}
      </span>
      {(venueParts.length > 0 || venue?.map_url) && (
        <span className="muted fixture-location">
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
  );
}

/** Where the season is and what's next, in one strip. The season that hasn't
 *  kicked off yet shows the same strip, which is the whole page in that state. */
export default function FormAndNext({ form, next, teams }) {
  return (
    <div className="sheet section form-next">
      <div>
        <div className="label">Form</div>
        <FormBadges matches={form} />
      </div>
      <NextUp next={next} teams={teams} />
    </div>
  );
}
