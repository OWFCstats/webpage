import { Link } from 'react-router-dom';
import { ordinal, plural } from '../../lib/format';

/** The player-facing hook on a match page: who won it and what they did,
 *  gilded on the club's own dark ground rather than carried on a card. No
 *  monogram — the name is the whole point — and no Golden Boot line: Phase
 *  14 gave every stat its own leader row on Players, and this was the last
 *  place repeating one. */
export default function MotmPlate({ star, seasonAppCount }) {
  const app = seasonAppCount.get(star.player_id);
  return (
    <div className="board motm-plate">
      <span className="label">Man of the match</span>
      <Link to={`/players/${star.player.id}`} className="name">{star.player.name}</Link>
      <span className="did">
        {[
          star.goals > 0 && plural(star.goals, 'goal', 'goals'),
          star.assists > 0 && plural(star.assists, 'assist', 'assists'),
          app != null && `${ordinal(app)} appearance of the season`,
        ].filter(Boolean).join(' · ')}
      </span>
    </div>
  );
}
