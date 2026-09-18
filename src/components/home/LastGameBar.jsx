import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { VenueBadge } from '../bits';
import { formatDate } from '../../lib/format';
import { resultOf } from '../../lib/matches';

/**
 * The last result, folded from a board into a full-width paper bar (Phase
 * 58) — losing that board took Home from five to four (DESIGN.md → Board).
 * It no longer stages a scoreboard, so it reads the way every other
 * scoreline on the site does: opponent, our score first, venue as a letter
 * (DESIGN.md → "A result is a row, not a sentence") — home-first was a
 * concession to this being an occasion, and it stopped being one. The
 * scorers and the MOTM sit underneath as links: the first screen, and what
 * CLAUDE.md says it owes the squad is the last result and a name.
 */
export default function LastGameBar({ match, ctx }) {
  const motm = ctx?.motm[0] ?? null;
  const result = match ? resultOf(match) : null;
  return (
    <section className="sheet home-widget last-game-bar">
      <div className="head">
        <div><span className="label">Last time out</span></div>
        {match && <span className="home-widget-note">{formatDate(match.date)}</span>}
      </div>
      {match ? (
        <>
          <div className="result-row lgb-row">
            <span className={`result-pill ${result}`}>{result}</span>
            <span className="result-opponent">{match.opponent}</span>
            <span className="result-score">{match.goals_for}–{match.goals_against}</span>
            <VenueBadge venue={match.venue} />
          </div>
          <div className="lgb-foot">
            {ctx.scorers.length > 0 && (
              <p className="lgb-line">
                Goals{' '}
                {ctx.scorers.map((a, i) => (
                  <Fragment key={a.player.id}>
                    {i > 0 && ', '}
                    <Link to={`/players/${a.player.id}`}>{a.player.name}</Link>
                    {a.goals > 1 && ` ×${a.goals}`}
                  </Fragment>
                ))}
              </p>
            )}
            {motm && (
              <p className="lgb-line">
                MOTM <Link to={`/players/${motm.player.id}`}>{motm.player.name}</Link>
              </p>
            )}
            <Link className="more" to={`/matchday/${match.id}`}>Report &amp; squad →</Link>
          </div>
        </>
      ) : (
        <div className="empty">No results yet this season.</div>
      )}
    </section>
  );
}
