/**
 * Won, drawn, lost as the record — three display-face figures coloured by
 * result with a percentage under each — then the For/Against balance as
 * bars. Replaces `SeasonStats` (Phase 69): played, clean sheets and win rate
 * come off, because they're Stats' own tiles now, not this card's job.
 */
export default function SeasonSoFar({ summary }) {
  const pct = (n) => (summary.played ? Math.round((n / summary.played) * 100) : 0);
  const goalScale = Math.max(summary.goalsFor, summary.goalsAgainst, 1);
  return (
    <section className="sheet home-widget home-stats g-season">
      <div className="head">
        <h2>Season so far</h2>
        <span className="muted">{summary.played} played</span>
      </div>
      <div className="record">
        <div className="w">
          <b>{summary.won}</b>
          <span className="label">Won</span>
          <small>{pct(summary.won)}%</small>
        </div>
        <div className="d">
          <b>{summary.drawn}</b>
          <span className="label">Drawn</span>
          <small>{pct(summary.drawn)}%</small>
        </div>
        <div className="l">
          <b>{summary.lost}</b>
          <span className="label">Lost</span>
          <small>{pct(summary.lost)}%</small>
        </div>
      </div>
      <div className="home-bars">
        <div className="home-bar">
          <span className="home-bar-label">For</span>
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
    </section>
  );
}
