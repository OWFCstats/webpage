import { Link } from 'react-router-dom';

/**
 * Ranked bar board: name, proportional bar, total. The leader's bar is full and
 * everyone else is drawn relative to it, so the gap at the top is readable at a
 * glance. `accent` is a CSS colour for the fill.
 */
export default function BarBoard({ title, rows, statKey, accent, limit = 8 }) {
  const ranked = rows
    .filter((r) => r[statKey] > 0)
    .sort((a, b) => b[statKey] - a[statKey] || a.player.name.localeCompare(b.player.name))
    .slice(0, limit);
  const max = ranked[0]?.[statKey] ?? 0;

  return (
    <section className="card bar-board">
      <h3>{title}</h3>
      {ranked.length === 0 ? (
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
      )}
    </section>
  );
}
