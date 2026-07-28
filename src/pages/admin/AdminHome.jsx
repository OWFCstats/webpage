import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';

export default function AdminHome() {
  const { players, matches } = useData();
  return (
    <div className="grid cols-2 section">
      <div className="card">
        <h2>Players</h2>
        <p className="muted">{players.length} in the squad list.</p>
        <p><Link className="btn small" to="/admin/players">Manage players</Link></p>
      </div>
      <div className="card">
        <h2>Matches</h2>
        <p className="muted">
          {matches.length} recorded. Create a match, then pick the lineup and
          enter each player’s stats from the match list.
        </p>
        <p><Link className="btn small" to="/admin/matches/new">Create match</Link></p>
      </div>
    </div>
  );
}
