import { useId } from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../lib/format';
import { resultOf } from '../lib/matches';

export function Spinner() {
  return <div className="spinner" aria-label="Loading" />;
}

export function ErrorNote({ message }) {
  return <div className="notice error">Couldn’t load data: {message}</div>;
}

export function FormBadges({ matches }) {
  if (matches.length === 0) return <span className="muted">No results yet</span>;
  // Callers pass newest-first (formOf); reversing here rather than at each call
  // site is what keeps every page reading oldest → newest.
  const oldestFirst = [...matches].reverse();
  return (
    <div className="form-row">
      {oldestFirst.map((m) => {
        const r = resultOf(m);
        return (
          <Link
            key={m.id}
            to={`/matchday/${m.id}`}
            className={`form-badge ${r}`}
            title={`${formatDate(m.date)} vs ${m.opponent} (${m.goals_for}–${m.goals_against})`}
          >
            {r}
          </Link>
        );
      })}
    </div>
  );
}

/** Small H/A icon for a fixture row. Renders nothing for neutral or
 * unrecorded venues rather than guessing. */
export function VenueBadge({ venue }) {
  if (venue !== 'H' && venue !== 'A') return null;
  return (
    <span className="venue-badge" title={venue === 'H' ? 'Home' : 'Away'}>
      {venue}
    </span>
  );
}

/**
 * Badge grid: earned ones gold and captioned with whoever holds them, the rest
 * quiet. Shared by a player's own honours and the club Hall of Fame, which is
 * the same idea one level up.
 */
export function HonourGrid({ honours }) {
  return (
    <div className="honours">
      {honours.map((h) => (
        <div key={h.key} className={`honour${h.earned ? ' earned' : ''}`}>
          <span className="hn">{h.name}</span>
          <span className="hd">{h.detail}</span>
        </div>
      ))}
    </div>
  );
}

/** `plain` drops the card surface — for tiles nested inside another card. */
export function StatTile({ value, label, plain = false }) {
  return (
    <div className={plain ? 'stat-tile' : 'sheet stat-tile'}>
      <div className="value">{value}</div>
      <div className="label">{label}</div>
    </div>
  );
}

export function SeasonSelect({ seasons, value, onChange, allowAll = true }) {
  // Generated, not hardcoded: two pickers on one page would otherwise share an
  // id and the second label would point at the first select.
  const id = useId();
  return (
    <div className="controls">
      <label htmlFor={id}>Season</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        {allowAll && <option value="all">All seasons</option>}
        {seasons.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  );
}
