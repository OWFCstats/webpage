import { Link } from 'react-router-dom';

/**
 * Ranked bar board: name, proportional bar, total. The leader's bar is full and
 * everyone else is drawn relative to it, so the gap at the top is readable at a
 * glance. `accent` is a CSS colour for the fill. `bare` skips the card surface
 * and the title, for a board nested inside a caller's own card.
 */
export default function BarBoard({ title, rows, statKey, accent, limit = 8, bare = false }) {
  const ranked = rows
    .filter((r) => r[statKey] > 0)
    .sort((a, b) => b[statKey] - a[statKey] || a.player.name.localeCompare(b.player.name))
    .slice(0, limit);
  const max = ranked[0]?.[statKey] ?? 0;

  const body = ranked.length === 0 ? (
    <p className="muted">Nothing recorded yet.</p>
  ) : (
    <ol className="bar-list">
      {ranked.map((r) => (
        <li key={r.player.id} className="bar-row">
          <Link className="bar-name" to={`/players/${r.player.id}`}>{r.player.name}</Link>
          <span className="bar-value">{r[statKey]}</span>
          <span className="bar-track">
            <span
              className="bar-fill"
              style={{
                width: `${max ? (r[statKey] / max) * 100 : 0}%`,
                background: accent,
              }}
            />
          </span>
        </li>
      ))}
    </ol>
  );

  if (bare) return body;

  return (
    <section className="card bar-board">
      <h3>{title}</h3>
      {body}
    </section>
  );
}

/**
 * One ranked row: rank, name, tally, and a bar drawn relative to the leader so
 * the size of the gap at the top is readable, not just the order.
 */
export function ChaseRow({ rank, row, statKey, max, accent }) {
  const value = row[statKey];
  return (
    <div className="chase-row">
      {rank != null && <span className="chase-rank">{rank}</span>}
      <Link className="chase-name" to={`/players/${row.player.id}`}>{row.player.name}</Link>
      <span className="chase-value">{value}</span>
      <span className="chase-track">
        <span
          className="chase-fill"
          style={{ width: `${max ? (value / max) * 100 : 0}%`, background: accent }}
        />
      </span>
    </div>
  );
}

/**
 * Headline board: the leader gets the dark band and a large tally, the chasers
 * sit beneath. Used for the one stat the page is really about.
 */
export function LeadBoard({ title, rows, statKey, accent, unit, limit = 6 }) {
  const ranked = rows
    .filter((r) => r[statKey] > 0)
    .sort((a, b) => b[statKey] - a[statKey] || a.player.name.localeCompare(b.player.name))
    .slice(0, limit);

  if (ranked.length === 0) {
    return (
      <section className="card">
        <div className="section-head" style={{ marginBottom: '0.4rem' }}><h3>{title}</h3></div>
        <p className="muted">Nothing recorded yet this season.</p>
      </section>
    );
  }

  const [leader, ...chasers] = ranked;
  const max = leader[statKey];
  const perGame = leader.appearances ? (leader[statKey] / leader.appearances).toFixed(2) : null;

  return (
    <section className="card lead-card">
      <div className="lead-hero">
        <div>
          <div className="eyebrow">{title}</div>
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
            <ChaseRow key={r.player.id} rank={i + 2} row={r} statKey={statKey} max={max} accent={accent} />
          ))}
        </div>
      )}
    </section>
  );
}
