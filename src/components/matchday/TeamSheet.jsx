import { Link } from 'react-router-dom';
import { BallMark } from '../bits';
import { ordinal, plural } from '../../lib/format';

/** Goals and assists, the only two facts this column carries — cards moved
 *  to the footer, because the ball and the star are the only two marks a
 *  name can carry on this sheet. */
function did(a) {
  return [
    a.goals > 0 && plural(a.goals, 'goal', 'goals'),
    a.assists > 0 && plural(a.assists, 'assist', 'assists'),
  ].filter(Boolean).join(', ');
}

/**
 * A ruled ledger, one row a player: their name and its two marks, what they
 * did this game, and where this appearance sits in their own season. The
 * app column does double duty as the debut flag — a "1st" there is a debut,
 * so "Worth noting" no longer has to print it separately.
 */
export default function TeamSheet({ squad, seasonAppCount, debutIds, dropoutNames }) {
  if (squad.length === 0) return null;

  const subs = squad.filter((a) => a.started === false).length;
  const goals = squad.reduce((n, a) => n + a.goals, 0);
  const assists = squad.reduce((n, a) => n + a.assists, 0);
  const yellows = squad.reduce((n, a) => n + a.yellows, 0);
  const reds = squad.reduce((n, a) => n + a.reds, 0);
  const debuts = squad.filter((a) => debutIds.has(a.player_id)).length;

  const cards = yellows === 0 && reds === 0
    ? 'No cards'
    : [
      yellows > 0 && plural(yellows, 'yellow card', 'yellow cards'),
      reds > 0 && plural(reds, 'red card', 'red cards'),
    ].filter(Boolean).join(', ');

  return (
    <div className="section sheet">
      <span className="label">
        Team sheet · {squad.length} named{subs === 0 ? ', all started' : `, ${subs} from the bench`}
      </span>
      <ul className="team-sheet">
        <li className="head">
          <span className="label">Player</span>
          <span className="label">This game</span>
          <span className="label">App</span>
        </li>
        {squad.map((a) => (
          <li key={a.id} className={a.motm ? 'motm' : undefined}>
            <span className="who">
              <Link to={`/players/${a.player.id}`} className="nm">{a.player.name}</Link>
              {a.goals > 0 && <BallMark />}
              {a.motm && <span className="star" aria-hidden="true">★</span>}
            </span>
            <span className="did">{did(a)}</span>
            <span className="ap">{ordinal(seasonAppCount.get(a.player_id))}</span>
          </li>
        ))}
      </ul>
      <p className="sheet-foot">
        <span>{plural(goals, 'goal', 'goals')}</span>
        <span>{plural(assists, 'assist', 'assists')}</span>
        <span>{cards}</span>
        <span>{debuts === 0 ? 'No debuts' : plural(debuts, 'debut', 'debuts')}</span>
        {dropoutNames.length > 0 && <span>Dropout: {dropoutNames.join(', ')}</span>}
      </p>
    </div>
  );
}
