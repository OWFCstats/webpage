import { Link } from 'react-router-dom';
import BadgeIcon from '../BadgeIcon';

/** A trophy is shown as the years it was won in: two Golden Boots is the same
 *  trophy twice, and a "×2" would imply the second one is bigger. */
function Held({ badge, mark }) {
  return (
    <Link className="badge-stack" to={`/records/badges/${badge.key}`}>
      <BadgeIcon badge={badge.key} metal="gold" size={30} />
      <span className="times">{mark}</span>
    </Link>
  );
}

/**
 * One player's shelf. The four career badges are always all four, held or not:
 * an unearned badge is a silhouette with what's left to go beside it, because
 * a badge you can't see is not an incentive — that is the whole reason the
 * ladder this replaced was rebuilt.
 *
 * Events and honours only appear once they exist. A row of empty trophies
 * under a debutant's name is a list of things they haven't done.
 */
export default function BadgeShelf({ badges }) {
  const events = badges.events.filter((b) => b.count > 0);
  const trophies = badges.trophies.filter((b) => b.seasons.length > 0);
  return (
    <div className="sheet">
      <div className="badge-shelf">
        {badges.career.map((badge) => (
          <Link key={badge.key} className="badge-held" to={`/records/badges/${badge.key}`}>
            <BadgeIcon badge={badge.key} metal={badge.metal} size={34} />
            <span className="what">
              <strong>{badge.label}</strong>{' '}
              <span className="metal">
                {badge.metal ? `${badge.metal}${badge.since ? ` · ${badge.since}` : ''}` : 'not yet'}
              </span>
            </span>
            <span className="to-go">
              {badge.next ? `${badge.next.need} to ${badge.next.metal}` : 'top tier'}
            </span>
          </Link>
        ))}
      </div>

      {events.length + trophies.length > 0 && (
        <div className="badge-row section">
          {events.map((badge) => (
            <Held key={badge.key} badge={badge} mark={`×${badge.count}`} />
          ))}
          {trophies.map((badge) => (
            <Held key={badge.key} badge={badge} mark={badge.seasons.join(', ')} />
          ))}
        </div>
      )}
    </div>
  );
}
