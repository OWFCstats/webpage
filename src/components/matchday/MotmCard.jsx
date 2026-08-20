import { Link } from 'react-router-dom';
import { initials } from '../../lib/format';

/** The player-facing hook on a match page: who won it, what they did, and
 *  where the Golden Boot stood when they walked off. */
export default function MotmCard({ star, seasonAppCount, boot }) {
  return (
    <div className="sheet">
      <h3 className="label ruled">Man of the Match</h3>
      <div className="motm-feature">
        <span className="avatar">{initials(star.player.name)}</span>
        <span>
          <Link to={`/players/${star.player.id}`} className="motm-name">{star.player.name}</Link>
          <span className="muted motm-line">
            {[
              star.goals > 0 && `${star.goals} goal${star.goals > 1 ? 's' : ''}`,
              star.assists > 0 && `${star.assists} assist${star.assists > 1 ? 's' : ''}`,
              `appearance ${seasonAppCount.get(star.player_id) ?? '—'} of the season`,
            ].filter(Boolean).join(' · ')}
          </span>
        </span>
      </div>
      {boot.length > 0 && (
        <p className="muted boot-line">
          Golden Boot after this game:{' '}
          {boot.map((r) => `${r.player.name} ${r.goals}`).join(' · ')}
        </p>
      )}
    </div>
  );
}
