import { Link } from 'react-router-dom';
import { formatDate, resultOf } from '../lib/stats';

export function Spinner() {
  return <div className="spinner" aria-label="Loading" />;
}

export function ErrorNote({ message }) {
  return <div className="notice error">Couldn’t load data: {message}</div>;
}

export function FormBadges({ matches }) {
  if (matches.length === 0) return <span className="muted">No results yet</span>;
  return (
    <div className="form-row">
      {matches.map((m) => {
        const r = resultOf(m);
        return (
          <Link
            key={m.id}
            to={`/matches/${m.id}`}
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

export function StatTile({ value, label }) {
  return (
    <div className="card stat-tile">
      <div className="value">{value}</div>
      <div className="label">{label}</div>
    </div>
  );
}

export function SeasonSelect({ seasons, value, onChange, allowAll = true }) {
  return (
    <div className="controls">
      <label htmlFor="season-select">Season</label>
      <select id="season-select" value={value} onChange={(e) => onChange(e.target.value)}>
        {allowAll && <option value="all">All seasons</option>}
        {seasons.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  );
}
