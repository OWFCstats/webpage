import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { formatDate, isPlayed } from '../../lib/stats';

/**
 * Opens with what's outstanding, not with navigation. A match saved without a
 * lineup, or a played match with no report, is work the admin hasn't finished
 * — the site knows it, so it says so and links straight there.
 */
export default function AdminHome() {
  const { players, matches, appearances } = useData();

  const withLineup = new Set(appearances.map((a) => a.match_id));
  const needLineup = matches.filter((m) => isPlayed(m) && !withLineup.has(m.id));
  const needReport = matches.filter((m) => isPlayed(m) && withLineup.has(m.id) && !m.report);

  return (
    <div className="section">
      <div className="card admin-cta">
        <div>
          <h2>Just played?</h2>
          <p className="muted">
            Score, squad, scorers, done — four steps, built for a phone.
          </p>
        </div>
        <Link className="btn" to="/admin/new-result">Add result</Link>
      </div>

      {(needLineup.length > 0 || needReport.length > 0) && (
        <div className="card section">
          <h2>Needs attention</h2>
          <ul className="attention">
            {needLineup.map((m) => (
              <li key={m.id}>
                <span>
                  <strong>vs {m.opponent}</strong> ({formatDate(m.date)}) has a
                  score but no lineup — no player gets credit for it yet.
                </span>
                <Link className="btn secondary small" to={`/admin/matches/${m.id}/lineup`}>
                  Enter lineup
                </Link>
              </li>
            ))}
            {needReport.map((m) => (
              <li key={m.id}>
                <span>
                  <strong>vs {m.opponent}</strong> ({formatDate(m.date)}) has no
                  match report.
                </span>
                <Link className="btn secondary small" to={`/admin/matches/${m.id}/report`}>
                  Write report
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid cols-2 section">
        <div className="card">
          <h2>Players</h2>
          <p className="muted">{players.length} in the squad list.</p>
          <p><Link className="btn small secondary" to="/admin/players">Manage players</Link></p>
        </div>
        <div className="card">
          <h2>Matches</h2>
          <p className="muted">
            {matches.length} recorded. Edit any match, its lineup or its report
            from the match list.
          </p>
          <p><Link className="btn small secondary" to="/admin/matches">All matches</Link></p>
        </div>
      </div>
    </div>
  );
}
