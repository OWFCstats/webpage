import { Link } from 'react-router-dom';
import { statToken } from '../lib/tokens';

// The bars read their colour from --bar-accent, so the token name goes in as a
// CSS custom property and the fill rules stay in bar-board.css.
const accentStyle = (statKey) => ({ '--bar-accent': `var(${statToken(statKey)})` });

/**
 * Ranked bar board: name, proportional bar, total. The leader's bar is full and
 * everyone else is drawn relative to it, so the gap at the top is readable at a
 * glance. `bare` skips the card surface and the title, for a board nested
 * inside a caller's own card.
 *
 * The fill colour comes from the stat itself rather than a per-call prop, so
 * goals are the same brass wherever they're ranked — see lib/tokens.js.
 */
export default function BarBoard({ title, rows, statKey, limit = 8, bare = false }) {
  const ranked = rows
    .filter((r) => r[statKey] > 0)
    .sort((a, b) => b[statKey] - a[statKey] || a.player.name.localeCompare(b.player.name))
    .slice(0, limit);
  const max = ranked[0]?.[statKey] ?? 0;

  const body = ranked.length === 0 ? (
    <p className="muted">Nothing recorded yet.</p>
  ) : (
    <ol className="bar-list" style={accentStyle(statKey)}>
      {ranked.map((r) => (
        <li key={r.player.id} className="bar-row">
          <Link className="bar-name" to={`/players/${r.player.id}`}>{r.player.name}</Link>
          <span className="bar-value">{r[statKey]}</span>
          <span className="bar-track">
            <span
              className="bar-fill"
              style={{ width: `${max ? (r[statKey] / max) * 100 : 0}%` }}
            />
          </span>
        </li>
      ))}
    </ol>
  );

  if (bare) return body;

  return (
    <section className="sheet bar-board">
      <h3>{title}</h3>
      {body}
    </section>
  );
}

/**
 * One ranked row: rank, name, tally, and a bar drawn relative to the leader so
 * the size of the gap at the top is readable, not just the order.
 */
export function ChaseRow({ rank, row, statKey, max }) {
  const value = row[statKey];
  return (
    <div className="chase-row">
      {rank != null && <span className="chase-rank">{rank}</span>}
      <Link className="chase-name" to={`/players/${row.player.id}`}>{row.player.name}</Link>
      <span className="chase-value">{value}</span>
      <span className="chase-track">
        <span
          className="chase-fill"
          style={{ width: `${max ? (value / max) * 100 : 0}%` }}
        />
      </span>
    </div>
  );
}

/**
 * Headline board: the leader gets the dark band and a large tally, the chasers
 * sit beneath. Used for the one stat the page is really about.
 */
export function LeadBoard({ title, rows, statKey, unit, limit = 6 }) {
  const ranked = rows
    .filter((r) => r[statKey] > 0)
    .sort((a, b) => b[statKey] - a[statKey] || a.player.name.localeCompare(b.player.name))
    .slice(0, limit);

  if (ranked.length === 0) {
    return (
      <section className="sheet">
        <div className="section-head" style={{ marginBottom: '0.4rem' }}><h3>{title}</h3></div>
        <p className="muted">Nothing recorded yet this season.</p>
      </section>
    );
  }

  const [leader, ...chasers] = ranked;
  const max = leader[statKey];
  const perGame = leader.appearances ? (leader[statKey] / leader.appearances).toFixed(2) : null;

  return (
    <section className="sheet lead-card" style={accentStyle(statKey)}>
      <div className="board lead-hero">
        <div>
          <div className="label">{title}</div>
          <Link className="who" to={`/players/${leader.player.id}`}>{leader.player.name}</Link>
          <div className="rate">
            {perGame && `${perGame} ${unit} per game · `}
            {leader.appearances} appearance{leader.appearances === 1 ? '' : 's'}
          </div>
        </div>
        <div className="tally">{max}</div>
      </div>
      {chasers.length > 0 && (
        <div className="lead-chase">
          {chasers.map((r, i) => (
            <ChaseRow key={r.player.id} rank={i + 2} row={r} statKey={statKey} max={max} />
          ))}
        </div>
      )}
    </section>
  );
}
