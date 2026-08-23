import { Link } from 'react-router-dom';
import { statLeaders } from '../lib/players';
import { statToken } from '../lib/tokens';

// The bars read their colour from --bar-accent, so the token name goes in as a
// CSS custom property and the fill rules stay in bar-board.css.
const accentStyle = (statKey) => ({ '--bar-accent': `var(${statToken(statKey)})` });

/**
 * What the row limit left out at the same mark as the last name shown. A cut
 * that lands inside a tie makes the last name on the board read as the last
 * name there is, which is the one thing a leaderboard mustn't say.
 */
function LevelNote({ count, value }) {
  if (count === 0) return null;
  return <p className="muted card-foot">…and {count} more level on {value}.</p>;
}

/**
 * Ranked bar board: name, proportional bar, total. The leader's bar is full and
 * everyone else is drawn relative to it, so the gap at the top is readable at a
 * glance. `bare` skips the card surface and the title, for a board nested
 * inside a caller's own card.
 *
 * The fill colour comes from the stat itself rather than a per-call prop, so
 * goals are the same brass wherever they're ranked — see lib/tokens.js.
 *
 * This is Season's "Most involved" board now — the six-board leaderboard grid
 * on Players and Records moved onto the card format in `components/LeaderBoards.jsx`
 * in Phase 14, which is also where the bars themselves are argued against. This
 * one bar board is still live until Phase 18 gives Season the same treatment.
 */
export default function BarBoard({ title, rows, statKey, limit = 8, bare = false }) {
  const { ranked, value, alsoLevel } = statLeaders(rows, statKey, limit);

  const body = ranked.length === 0 ? (
    <p className="muted">Nothing recorded yet.</p>
  ) : (
    <>
      <ol className="bar-list" style={accentStyle(statKey)}>
        {ranked.map((r) => (
          <li key={r.player.id} className="bar-row">
            <Link className="bar-name" to={`/players/${r.player.id}`}>{r.player.name}</Link>
            <span className="bar-value">{r[statKey]}</span>
            <span className="bar-track">
              <span
                className="bar-fill"
                style={{ width: `${value ? (r[statKey] / value) * 100 : 0}%` }}
              />
            </span>
          </li>
        ))}
      </ol>
      <LevelNote count={alsoLevel} value={ranked[ranked.length - 1][statKey]} />
    </>
  );

  if (bare) return body;

  return (
    <section className="sheet bar-board">
      <h3>{title}</h3>
      {body}
    </section>
  );
}
