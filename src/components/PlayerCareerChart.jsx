import { useState } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Label,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatDate } from '../lib/stats';
import { useIsNarrow } from '../lib/useIsNarrow';

// Same three colours the leaderboard chips use for these stats, taken from the
// validated series palette so they clear 3:1 on the white card.
const INVOLVEMENTS = '#eb6834';
const GOALS = '#b8860b';
const ASSISTS = '#2a78d6';
const GRID = '#e6e4dc';
const AXIS = '#c3c2b7';
const MUTED = '#7c7a73';

function ArcTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload ?? {};
  return (
    <div className="chart-tip">
      <div className="chart-tip-head">
        Appearance {label}
        {row.label && <span className="muted"> · {row.label}</span>}
        {row.date && <span className="muted"> · {formatDate(row.date)}</span>}
      </div>
      {payload.map((p) => (
        <div key={p.dataKey} className="chart-tip-row">
          <span className="chart-tip-swatch" style={{ background: p.color }} />
          <span>{p.name}</span>
          <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
}

/**
 * A career as a shape: goal involvements carry the chart as a filled area,
 * with the goals and assists that make them up drawn behind as thin lines.
 * The x-axis is appearance number rather than date, so a player who missed
 * half a season doesn't get a flat stretch that reads as a slump.
 */
export default function PlayerCareerChart({ arc, career }) {
  const [showTable, setShowTable] = useState(false);
  const narrow = useIsNarrow();
  const tick = { fontSize: narrow ? 10 : 12, fill: MUTED };
  const enough = arc.length >= 2 && career.goalInvolvements > 0;

  const finding = enough
    ? `${career.goalInvolvements} goal involvement${career.goalInvolvements === 1 ? '' : 's'} in ${career.appearances} appearance${career.appearances === 1 ? '' : 's'} — ${career.goals} scored, ${career.assists} created.`
    : null;

  return (
    <section className="card chart-card">
      <div className="chart-head">
        <div>
          <h2>Career arc</h2>
          {finding && <p className="muted chart-sub">{finding}</p>}
        </div>
        {enough && (
          <button type="button" className="secondary small" onClick={() => setShowTable((v) => !v)}>
            {showTable ? 'Show chart' : 'Show data'}
          </button>
        )}
      </div>

      {!enough ? (
        <div className="empty">
          Not enough played yet — this fills in once there are a couple of appearances
          with a goal or an assist in them.
        </div>
      ) : showTable ? (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th className="num">App</th>
                <th>Match</th>
                <th className="num">Goals</th>
                <th className="num">Assists</th>
                <th className="num">G+A</th>
              </tr>
            </thead>
            <tbody>
              {arc.map((d) => (
                <tr key={d.n}>
                  <td className="num">{d.n}</td>
                  <td>{d.label}</td>
                  <td className="num">{d.goals}</td>
                  <td className="num">{d.assists}</td>
                  <td className="num">{d.involvements}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="chart-body">
          <ResponsiveContainer>
            {/* Deeper bottom margin than the season charts: this one carries an
                axis label and a three-series legend, which collide at 24. */}
            <ComposedChart data={arc} margin={{ top: 8, right: narrow ? 12 : 20, bottom: 44, left: 4 }}>
              <defs>
                <linearGradient id="arc-ga" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={INVOLVEMENTS} stopOpacity={0.22} />
                  <stop offset="100%" stopColor={INVOLVEMENTS} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="n" tick={tick} stroke={AXIS} tickLine={false}>
                <Label value="Appearance" position="insideBottom" offset={-12} style={tick} />
              </XAxis>
              <YAxis allowDecimals={false} tick={tick} stroke={AXIS} tickLine={false} width={narrow ? 26 : 36} />
              <Tooltip content={<ArcTooltip />} />
              <Legend verticalAlign="bottom" iconType="plainline" wrapperStyle={{ fontSize: narrow ? 11 : 12, paddingTop: 20 }} />
              <Area
                type="monotone"
                dataKey="involvements"
                name="Goal involvements"
                stroke={INVOLVEMENTS}
                strokeWidth={2.75}
                fill="url(#arc-ga)"
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
              />
              <Line
                type="monotone" dataKey="goals" name="Goals"
                stroke={GOALS} strokeWidth={1.75} strokeOpacity={0.9} dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
              />
              <Line
                type="monotone" dataKey="assists" name="Assists"
                stroke={ASSISTS} strokeWidth={1.75} strokeOpacity={0.9} dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
