import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { VenueBadge } from '../bits';
import { formatDate } from '../../lib/format';
import { matchHomeAway, opponentInitials, resultOf } from '../../lib/matches';

/** Home's one dark occasion: a teaser for Matchday's scoreboard treatment,
 *  not a second copy of it. Home and away sides always sit left/right (top/
 *  bottom on a phone) by venue, same as a real scoreboard reads — which side
 *  is "us" is carried by the badge, not by position, so the scoreline reads
 *  home-first too rather than us-first.
 *
 *  The scorers and the MOTM are links: this is the first screen, and what
 *  CLAUDE.md says it owes the squad is the last result and a name. A name
 *  that can't be tapped is half of that. */
export default function LastResult({ match, ctx }) {
  const motm = ctx?.motm[0] ?? null;
  const home = match ? matchHomeAway(match) : null;
  const weAreHome = match ? match.venue !== 'A' : null;
  const result = match ? resultOf(match) : null;
  const initials = match ? opponentInitials(match.opponent) : null;
  return (
    <section className="board home-widget home-result">
      <div className="home-widget-head">
        <div><span className="label">Last time out</span></div>
        {match && (
          <span className="home-widget-note">
            {formatDate(match.date)} <VenueBadge venue={match.venue} />
          </span>
        )}
      </div>
      {match ? (
        <>
          <div className="hr-hero">
            <div className="hr-side">
              {weAreHome
                ? <span className="hr-badge us">OW</span>
                : <span className="hr-badge them">{initials}</span>}
              <span className="hr-team">{home.homeTeam}</span>
            </div>
            <div className="hr-score">
              <span className="hr-score-value">{home.homeGoals}–{home.awayGoals}</span>
              <span className={`result-pill ${result}`}>{result}</span>
            </div>
            <div className="hr-side">
              <span className="hr-team">{home.awayTeam}</span>
              {weAreHome
                ? <span className="hr-badge them">{initials}</span>
                : <span className="hr-badge us">OW</span>}
            </div>
          </div>
          <div className="hr-footer">
            {ctx.scorers.length > 0 && (
              <p className="hr-line">
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
              <p className="hr-line">
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
