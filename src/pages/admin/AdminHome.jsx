import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { formatDate } from '../../lib/format';
import { isPlayed } from '../../lib/matches';
import WalkoverForm from '../../components/WalkoverForm';

/**
 * Opens with what's outstanding, not with navigation. A match saved without a
 * lineup is broken data — no player gets credit for it — so the site nags
 * about it. A missing report is just optional colour and never nags. A
 * walkover is the one case with no lineup by design, so it's excluded from
 * that nag rather than satisfying it.
 */
export default function AdminHome() {
  const { players, matches, appearances } = useData();
  const [showWalkover, setShowWalkover] = useState(false);

  const withLineup = new Set(appearances.map((a) => a.match_id));
  const needLineup = matches.filter((m) => isPlayed(m) && !m.walkover && !withLineup.has(m.id));

  return (
    <div className="section">
      <div className="sheet admin-cta">
        <div>
          <h2>Just played?</h2>
          <p className="muted">
            Score, squad, scorers, done — four steps, built for a phone.
          </p>
        </div>
        <div className="controls" style={{ marginBottom: 0 }}>
          <button type="button" className="secondary" onClick={() => setShowWalkover((v) => !v)}>
            Walkover
          </button>
          <Link className="btn" to="/admin/new-result">Add result</Link>
        </div>
      </div>

      {showWalkover && (
        <WalkoverForm
          onDone={() => setShowWalkover(false)}
          onCancel={() => setShowWalkover(false)}
        />
      )}

      {needLineup.length > 0 && (
        <div className="sheet section">
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
          </ul>
        </div>
      )}

      <div className="grid cols-2 section">
        <div className="sheet">
          <h2>Players</h2>
          <p className="muted">{players.length} in the squad list.</p>
          <p><Link className="btn small secondary" to="/admin/players">Manage players</Link></p>
        </div>
        <div className="sheet">
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
