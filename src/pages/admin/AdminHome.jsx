import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import WalkoverForm from '../../components/WalkoverForm';
import { formatDate, formatKickoff } from '../../lib/format';
import { outstanding, todayISO } from '../../lib/admin';
import { currentSeasonOf, fixtures } from '../../lib/matches';

/**
 * Opens with what's outstanding, not with navigation.
 *
 * The list used to nag about one thing — a score with no lineup — which is
 * real but is not what actually goes wrong. What goes wrong is a game being
 * played and nobody entering it: the fixture stays on the site and Home counts
 * down to a match that finished a fortnight ago. `lib/admin.js` owns the order
 * these come in and why.
 *
 * What is no longer here: two cards linking to Players and Matches, which the
 * nav directly above already does. A page whose job is "what needs doing"
 * shouldn't spend its bottom half saying "or you could go somewhere else".
 */
export default function AdminHome() {
  const data = useData();
  const { players, matches } = data;
  const [showWalkover, setShowWalkover] = useState(false);

  const today = todayISO();
  const jobs = outstanding(data, today);
  const next = fixtures(matches).find((m) => m.date >= today) ?? null;
  const season = currentSeasonOf(matches);

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

      <div className="sheet section">
        <h2>Needs attention</h2>
        {jobs.length === 0 ? (
          <div className="empty">
            Nothing outstanding — every result has a lineup and a Man of the Match.
            {next && (
              <>
                {' '}Next up is <strong>{next.opponent}</strong> on {formatDate(next.date)}
                {next.kickoff_time ? `, ${formatKickoff(next.kickoff_time)}` : ''}.
              </>
            )}
          </div>
        ) : (
          <ul className="attention">
            {jobs.map((job) => (
              <li key={`${job.kind}:${job.match?.id ?? job.to}`} className={`job-${job.kind}`}>
                <span>
                  <strong>{job.title}</strong>
                  {job.match && ` (${formatDate(job.match.date)})`} {job.line}
                </span>
                <Link className="btn secondary small" to={job.to}>{job.action}</Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="muted admin-glance">
        {season ?? 'No season'} · {matches.length} match{matches.length === 1 ? '' : 'es'} ·{' '}
        {players.length} in the squad list.
      </p>
    </div>
  );
}
