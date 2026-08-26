import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../lib/format';
import { resultOf } from '../lib/matches';

export function Spinner() {
  return <div className="spinner" aria-label="Loading" />;
}

/** The club supplies public/crest.png; until it exists (or on a broken path)
 *  this falls back to an "OW" monogram. Shared by the masthead and Home's
 *  next-fixture row — the only two places that draw the crest itself. */
export function Crest() {
  const [missing, setMissing] = useState(false);
  if (missing) return <span className="crest-fallback">OW</span>;
  return (
    <img
      src={`${import.meta.env.BASE_URL}crest.png`}
      alt="Wellington College crest"
      onError={() => setMissing(true)}
    />
  );
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

/** A scorer's mark on the team sheet, beside the goal count rather than
 *  instead of it. Drawn, not an emoji ball — every other mark on the site is
 *  engraved or gilded, and an emoji renders in whatever the phone feels
 *  like. `currentColor` throughout, so it takes its row's own ink. */
export function BallMark() {
  return (
    <svg className="ball-mark" viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
      <circle cx="8" cy="8" r="6.6" fill="none" stroke="currentColor" strokeWidth="1.25" />
      <path d="M8 4.9 10.95 7.04 9.82 10.51H6.18L5.05 7.04z" fill="currentColor" />
      <path
        d="M8 4.9V2.4M10.95 7.04 13.33 6.27M9.82 10.51 11.29 12.53M6.18 10.51 4.71 12.53M5.05 7.04 2.67 6.27"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
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

/** `plain` drops the card surface — for tiles nested inside another card. */
export function StatTile({ value, label, plain = false }) {
  return (
    <div className={plain ? 'stat-tile' : 'sheet stat-tile'}>
      <div className="value">{value}</div>
      <div className="label">{label}</div>
    </div>
  );
}

export function SeasonSelect({ seasons, value, onChange, allowAll = true, allLabel = 'All seasons' }) {
  // Generated, not hardcoded: two pickers on one page would otherwise share an
  // id and the second label would point at the first select.
  const id = useId();
  return (
    <div className="controls">
      <label htmlFor={id}>Season</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        {/* "All time" where the option is a leaderboard rather than a filter —
            a career total isn't a season you can pick. */}
        {allowAll && <option value="all">{allLabel}</option>}
        {seasons.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  );
}
