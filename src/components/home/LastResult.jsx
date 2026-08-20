import { Link } from 'react-router-dom';
import { VenueBadge } from '../bits';
import { formatDate } from '../../lib/format';
import { resultOf } from '../../lib/matches';

/** Home's one dark occasion: a teaser for Matchday's scoreboard treatment,
 *  not a second copy of it. */
export default function LastResult({ match, ctx }) {
  const motm = ctx?.motm[0] ?? null;
  return (
    <section className="board home-widget home-result">
      <div className="home-widget-head">
        <div>
          <span className="label">Last time out</span>
          <h2>{match ? <>{match.opponent} <VenueBadge venue={match.venue} /></> : 'Last time out'}</h2>
        </div>
        {match && <span className="home-widget-note">{formatDate(match.date)}</span>}
      </div>
      {match ? (
        <>
          <div className="hr-score">
            <span className="hr-score-value">{match.goals_for}–{match.goals_against}</span>
            <span className={`result-pill ${resultOf(match)}`}>{resultOf(match)}</span>
          </div>
          {ctx.scorers.length > 0 && (
            <p className="hr-line">
              {ctx.scorers.map((a) => `${a.player.name}${a.goals > 1 ? ` ×${a.goals}` : ''}`).join(', ')}
            </p>
          )}
          {motm && (
            <p className="hr-line">MOTM <strong>{motm.player.name}</strong></p>
          )}
          <Link className="more" to={`/matchday/${match.id}`}>Report & squad →</Link>
        </>
      ) : (
        <div className="empty">No results yet this season.</div>
      )}
    </section>
  );
}
