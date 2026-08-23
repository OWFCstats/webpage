import { Link } from 'react-router-dom';
import { plural } from '../../lib/format';

/** A stackable badge is a count, so its page is a list of counts: everyone who
 *  has one, most first. No tiers to split it into — a hat-trick is a thing that
 *  happened, and the third one is the same badge as the first. */
export default function EventHolders({ badge, awarded, holders, more }) {
  if (awarded === 0) {
    return (
      <div className="empty sheet">
        Nobody has one yet. {badge.line}
      </div>
    );
  }
  return (
    <div className="sheet">
      <p className="muted">
        Awarded {plural(awarded, 'time', 'times')} to{' '}
        {plural(holders.length + more, 'player', 'players')}.
      </p>
      <ul className="badge-names">
        {holders.map((holder) => (
          <li key={holder.player.id}>
            <Link to={`/players/${holder.player.id}`}>{holder.player.name}</Link>{' '}
            <span className="when">×{holder.count}</span>
          </li>
        ))}
        {more > 0 && <li className="when">+{more} more</li>}
      </ul>
    </div>
  );
}
