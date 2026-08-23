import { Link } from 'react-router-dom';
import { initials } from '../../lib/format';

export default function MatesCard({ teammates }) {
  return (
    <div className="sheet">
      <h3 className="block board">Most played alongside</h3>
      <ul className="mate-list">
        {teammates.map((t) => (
          <li key={t.player.id}>
            <span className="avatar">{initials(t.player.name)}</span>
            <Link to={`/players/${t.player.id}`} className="mate-name">{t.player.name}</Link>
            <span className="mate-count">{t.games} <em>games</em></span>
          </li>
        ))}
      </ul>
      {teammates.length === 0 && <div className="empty">No shared appearances yet.</div>}
    </div>
  );
}
