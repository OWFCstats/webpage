import { ordinal, rate } from '../../lib/format';
import { statColour, statToken } from '../../lib/tokens';

/** Season-by-season shape for one stat. Flat when there's only one season to
 *  draw — better than an empty box that looks like a rendering failure. */
function Sparkline({ values, colour }) {
  if (values.length === 0) return null;
  const max = Math.max(1, ...values);
  const step = values.length > 1 ? 96 / (values.length - 1) : 0;
  const points = values
    .map((v, i) => `${2 + i * step},${24 - (v / max) * 20}`)
    .join(' ');
  return (
    <svg className="spark" viewBox="0 0 100 28" aria-hidden="true">
      {values.length > 1 ? (
        <polyline points={points} fill="none" stroke={colour} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      ) : null}
      <circle cx={2 + (values.length - 1) * step} cy={24 - (values[values.length - 1] / max) * 20} r="2.5" fill={colour} />
    </svg>
  );
}

// Each cell's colour comes from its stat, in lib/tokens.js — the same one the
// leaderboard bar and the career chart use for it.
const STAT_CELLS = [
  { key: 'goals', label: 'Goals' },
  { key: 'appearances', label: 'Appearances' },
  { key: 'assists', label: 'Assists' },
  { key: 'cleanSheets', label: 'Clean sheets' },
  { key: 'goalInvolvements', label: 'G+A' },
  { key: 'motm', label: 'MOTM' },
  { key: 'starts', label: 'Starts' },
  { key: 'goalsPerGame', label: 'Goals / game', decimal: true },
];

export default function StatGrid({ career, seasons, ranks, squadAverage, squadMax }) {
  const oldestFirst = seasons.slice().reverse();
  const rankByKey = new Map(ranks.map((r) => [r.key, r]));
  return (
    <div className="stat-grid">
      {STAT_CELLS.map((c) => {
        const value = career[c.key];
        const avg = squadAverage[c.key] ?? 0;
        const max = squadMax[c.key] ?? 0;
        const rank = rankByKey.get(c.key);
        return (
          <div key={c.key} className="sheet stat-cell">
            <div className="sc-top">
              <span className="sc-v">{c.decimal ? rate(value) : value}</span>
              {rank?.rank != null && <span className="sc-rank">{ordinal(rank.rank)}</span>}
            </div>
            <div className="label">{c.label}</div>
            <Sparkline values={oldestFirst.map((s) => s[c.key])} colour={statColour(c.key)} />
            <div className="sc-vs">
              <span>squad avg {c.decimal ? rate(avg) : Math.round(avg * 10) / 10}</span>
              <span className="sc-bar">
                <i style={{ width: `${max > 0 ? Math.round((value / max) * 100) : 0}%`, background: `var(${statToken(c.key)})` }} />
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
