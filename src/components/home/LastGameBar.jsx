import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { weekdayDayMonth } from '../../lib/format';
import { resultOf } from '../../lib/matches';

/**
 * The last result, as the mock's `.last-bar` (Phase 68): a full-bleed strip
 * of its own between the club band and the page column, not a card inside
 * it — the site's second full-bleed section, so the first screen leads with
 * a result before anything else asks the reader to scroll. It still reads
 * ours-first like every row on the site (Phase 58's ruling stands): the pill
 * and our score lead, the opponent and date follow as context, not the
 * subject. The scorers and the MOTM sit beside it as links — the first
 * screen, and what CLAUDE.md says it owes the squad is the last result and
 * a name.
 */
export default function LastGameBar({ match, ctx }) {
  const motm = ctx?.motm[0] ?? null;
  const result = match ? resultOf(match) : null;
  return (
    <section className="last-bar">
      <div className="last-bar-inner">
        {match ? (
          <>
            <div className="lb-score">
              <span className={`result-pill ${result}`}>{result}</span>
              <b>{match.goals_for}–{match.goals_against}</b>
              <span className="muted">v {match.opponent} · {weekdayDayMonth(match.date)}</span>
            </div>
            <div className="lb-facts">
              {ctx.scorers.length > 0 && (
                <div>
                  <span className="label">Goals</span>
                  {ctx.scorers.map((a, i) => (
                    <Fragment key={a.player.id}>
                      {i > 0 && ', '}
                      <Link to={`/players/${a.player.id}`}>{a.player.name}</Link>
                      {a.goals > 1 && ` ×${a.goals}`}
                    </Fragment>
                  ))}
                </div>
              )}
              {motm && (
                <div>
                  <span className="label">Man of the match</span>
                  <Link to={`/players/${motm.player.id}`}>{motm.player.name}</Link>
                </div>
              )}
            </div>
            <Link className="lb-more" to={`/matchday/${match.id}`}>Full match →</Link>
          </>
        ) : (
          <div className="empty">No results yet this season.</div>
        )}
      </div>
    </section>
  );
}
