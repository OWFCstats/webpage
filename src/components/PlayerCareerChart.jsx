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
import { fontPx, statColour, token } from '../lib/tokens';

// The same colours these three stats wear everywhere else, and the frame
// colours, read out of tokens.css — Recharts puts them in SVG attributes,
// where var() is invalid. See lib/tokens.js.
const chartColours = () => ({
  involvements: statColour('goalInvolvements'),
  goals: statColour('goals'),
  assists: statColour('assists'),
  grid: token('--rule'),
  axis: token('--rule-firm'),
  muted: token('--ink-soft'),
  dot: token('--paper'),
});

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
  const c = chartColours();
  // The 0.75rem floor applies to the axis too, not just to HTML.
  const tick = { fontSize: fontPx('--t-micro'), fill: c.muted };
  const enough = arc.length >= 2 && career.goalInvolvements > 0;

  const finding = enough
    ? `${career.goalInvolvements} goal involvement${career.goalInvolvements === 1 ? '' : 's'} in ${career.appearances} appearance${career.appearances === 1 ? '' : 's'} — ${career.goals} scored, ${career.assists} created.`
    : null;

  return (
    <section className="sheet chart-card">
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
                  <stop offset="0%" stopColor={c.involvements} stopOpacity={0.22} />
                  <stop offset="100%" stopColor={c.involvements} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={c.grid} vertical={false} />
              <XAxis dataKey="n" tick={tick} stroke={c.axis} tickLine={false}>
                <Label value="Appearance" position="insideBottom" offset={-12} style={tick} />
              </XAxis>
              <YAxis allowDecimals={false} tick={tick} stroke={c.axis} tickLine={false} width={narrow ? 30 : 36} />
              <Tooltip content={<ArcTooltip />} />
              <Legend verticalAlign="bottom" iconType="plainline" wrapperStyle={{ fontSize: fontPx('--t-micro'), paddingTop: 20 }} />
              <Area
                type="monotone"
                dataKey="involvements"
                name="Goal involvements"
                stroke={c.involvements}
                strokeWidth={2.75}
                fill="url(#arc-ga)"
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2, stroke: c.dot }}
              />
              <Line
                type="monotone" dataKey="goals" name="Goals"
                stroke={c.goals} strokeWidth={1.75} strokeOpacity={0.9} dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: c.dot }}
              />
              <Line
                type="monotone" dataKey="assists" name="Assists"
                stroke={c.assists} strokeWidth={1.75} strokeOpacity={0.9} dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: c.dot }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
