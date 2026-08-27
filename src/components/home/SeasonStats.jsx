import { Link } from 'react-router-dom';

/** Three figures and the goal balance — the season in one glance, with the
 *  full thing a tap away. */
export default function SeasonStats({ summary, cleanSheets }) {
  const winRate = summary.played ? Math.round((summary.won / summary.played) * 100) : null;
  const goalScale = Math.max(summary.goalsFor, summary.goalsAgainst, 1);
  return (
    <section className="sheet home-widget home-stats">
      <div className="home-widget-head">
        <div>
          <span className="label">Overview</span>
          <h2>Season stats</h2>
        </div>
        <Link className="more" to="/season">Full season →</Link>
      </div>
      <div className="home-stats-body">
        <div className="home-stat-tiles">
          <div className="home-stat-tile">
            <b>{summary.played}</b>
            <em className="label">Played</em>
          </div>
          <div className="home-stat-tile">
            <b>{cleanSheets}</b>
            <em className="label">Clean sheets</em>
          </div>
          <div className="home-stat-tile">
            <b>{winRate === null ? '—' : `${winRate}%`}</b>
            <em className="label">Win rate</em>
          </div>
        </div>
        <div className="home-bars">
          <div className="home-bar">
            <span className="home-bar-label">Goals for</span>
            <span className="home-bar-track">
              {/* The fraction goes in as a custom property rather than a width:
                  home.css scales the bar with a transform, and an inline
                  transform would outrank the @starting-style that gives it
                  something to grow from. */}
              <i className="home-bar-fill gf" style={{ '--fill': (summary.goalsFor / goalScale).toFixed(3) }} />
            </span>
            <span className="home-bar-value">{summary.goalsFor}</span>
          </div>
          <div className="home-bar">
            <span className="home-bar-label">Against</span>
            <span className="home-bar-track">
              <i className="home-bar-fill ga" style={{ '--fill': (summary.goalsAgainst / goalScale).toFixed(3) }} />
            </span>
            <span className="home-bar-value">{summary.goalsAgainst}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
