import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Label,
  LabelList,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useData } from '../context/DataContext';
import { useIsNarrow } from '../lib/useIsNarrow';
import { formatDate } from '../lib/format';
import {
  seasonPointsComparison,
  seasonTrend,
  stableColourSlots,
  topScorerRace,
} from '../lib/charts';
import { fontPx, series, token } from '../lib/tokens';

// Recharts writes these into SVG attributes, where var() is invalid, so they
// are read out of tokens.css rather than written down again here. Read at
// render rather than at module load: the stylesheet has to be applied first.
const chartColours = () => ({
  grid: token('--rule'),
  axis: token('--rule-firm'),
  muted: token('--ink-soft'),
  past: token('--ink-faint'),
  positive: token('--series-2'),
  negative: token('--loss'),
  dot: token('--paper'),
});

/** Card with a finding as its subtitle — a sentence, not a description of the
 *  axes — and the data table one press away. */
function ChartCard({ title, finding, children, empty, table }) {
  const [showTable, setShowTable] = useState(false);
  return (
    <section className="sheet chart-card">
      <div className="chart-head">
        <div>
          <h2>{title}</h2>
          {finding && <p className="muted chart-sub">{finding}</p>}
        </div>
        {!empty && table && (
          <button type="button" className="secondary small" onClick={() => setShowTable((v) => !v)}>
            {showTable ? 'Show chart' : 'Show data'}
          </button>
        )}
      </div>
      {empty ? (
        <div className="empty">Not enough data yet — this fills in as matches are recorded.</div>
      ) : showTable ? (
        <div className="table-wrap">{table}</div>
      ) : (
        <div className="chart-body">{children}</div>
      )}
    </section>
  );
}

function staggerOffsets(entries, gap = 14) {
  const buckets = new Map();
  for (const { id, bucket } of entries) {
    if (!buckets.has(bucket)) buckets.set(bucket, []);
    buckets.get(bucket).push(id);
  }
  const offsets = new Map();
  for (const ids of buckets.values()) {
    ids.forEach((id, i) => offsets.set(id, (i - (ids.length - 1) / 2) * gap));
  }
  return offsets;
}

function EndLabel({ x, y, value, index, lastIndex, fill, text, dy = 0 }) {
  if (index !== lastIndex) return null;
  return (
    <text x={x + 8} y={y + dy} dy={4} fill={fill} fontSize={fontPx('--t-micro')} fontWeight={600}>
      {text ?? value}
    </text>
  );
}

function TooltipBox({ active, payload, label, labelKey, unit }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload ?? {};
  return (
    <div className="chart-tip">
      <div className="chart-tip-head">
        Match {label}
        {row[labelKey] && <span className="muted"> · {row[labelKey]}</span>}
        {row.date && <span className="muted"> · {formatDate(row.date)}</span>}
      </div>
      {payload.map((p) => (
        <div key={p.dataKey} className="chart-tip-row">
          <span className="chart-tip-swatch" style={{ background: p.color }} />
          <span>{p.name}</span>
          <strong>{p.value}{unit ?? ''}</strong>
        </div>
      ))}
    </div>
  );
}

/** The season's finding sentences, written from the data rather than the axes. */
function findings(race, trend) {
  const out = {};
  if (race.players.length >= 2 && race.players[0].goals === race.players[1].goals) {
    out.boot = `${race.players[0].name} and ${race.players[1].name} level on ${race.players[0].goals}.`;
  } else if (race.players.length > 0) {
    const lead = race.players[0];
    const gap = race.players[1] ? lead.goals - race.players[1].goals : lead.goals;
    out.boot = `${lead.name} leads on ${lead.goals}, ${gap} clear.`;
  }
  if (trend.length > 0) {
    const last = trend[trend.length - 1];
    out.points = `${last.points} points from ${trend.length} played.`;
    const heavy = trend.filter((d) => d.goalsAgainst >= 4).length;
    out.goals = heavy > 0
      ? `Conceded four or more in ${heavy} of ${trend.length}.`
      : `Never conceded more than three.`;
  }
  return out;
}

export default function SeasonCharts({ season, activeSeason }) {
  const { players, matches, appearances } = useData();
  const narrow = useIsNarrow();
  const c = chartColours();

  const colourSlots = useMemo(
    () => stableColourSlots(players, matches, appearances),
    [players, matches, appearances],
  );

  const charts = useMemo(() => {
    const pool =
      season === 'all' ? matches : matches.filter((m) => m.season === activeSeason);
    const race = topScorerRace(players, pool, appearances);
    const trend = seasonTrend(pool);
    return {
      race,
      trend,
      comparison: seasonPointsComparison(matches),
      raceOffsets: staggerOffsets(
        race.players.map((p) => ({ id: p.id, bucket: p.goals })),
        15,
      ),
      text: findings(race, trend),
    };
  }, [season, activeSeason, players, matches, appearances]);

  const { race, trend, comparison, raceOffsets, text } = charts;
  const currentSeason = comparison.seasons[0];

  // 0.75rem is the floor everywhere, charts included — a 10px axis tick was
  // the smallest type on the site.
  const tick = { fontSize: fontPx('--t-micro'), fill: c.muted };
  // 26 was sized for a 10px tick; two digits at the 0.75rem floor need 30.
  const yWidth = narrow ? 30 : 36;
  const rightGap = narrow ? 12 : 20;
  const raceRightGap = narrow ? 12 : 78;
  const legendStyle = { fontSize: fontPx('--t-micro'), paddingTop: 6 };

  const colourFor = (playerId, fallbackIndex) =>
    series(colourSlots.get(playerId) ?? fallbackIndex);

  return (
    <div className="chart-stack section">
      <ChartCard
        title="Golden Boot race"
        finding={text.boot}
        empty={race.points.length < 2 || race.players.length === 0}
        table={
          <table className="data">
            <thead>
              <tr>
                <th>Match</th>
                {race.players.map((p) => <th key={p.id} className="num">{p.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {race.points.map((row) => (
                <tr key={row.matchday}>
                  <td>{row.matchday}</td>
                  {race.players.map((p) => <td key={p.id} className="num">{row[p.id]}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        }
      >
        <ResponsiveContainer>
          {/* Right margin leaves room for the end-of-line name labels. */}
          <LineChart data={race.points} margin={{ top: 8, right: raceRightGap, bottom: 24, left: 4 }}>
            <CartesianGrid stroke={c.grid} vertical={false} />
            <XAxis dataKey="matchday" tick={tick} stroke={c.axis} tickLine={false}>
              <Label value="Matchday" position="insideBottom" offset={-12} style={tick} />
            </XAxis>
            <YAxis allowDecimals={false} tick={tick} stroke={c.axis} tickLine={false} width={yWidth} />
            <Tooltip content={<TooltipBox labelKey="label" unit=" goals" />} />
            <Legend verticalAlign="bottom" iconType="plainline" wrapperStyle={legendStyle} />
            {race.players.map((p, i) => (
              <Line
                key={p.id}
                type="monotone"
                dataKey={p.id}
                name={p.name}
                stroke={colourFor(p.id, i)}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: c.dot }}
              >
                {!narrow && (
                  <LabelList
                    dataKey={p.id}
                    content={
                      <EndLabel
                        lastIndex={race.points.length - 1}
                        fill={colourFor(p.id, i)}
                        text={p.name.split(' ')[0]}
                        dy={raceOffsets.get(p.id) ?? 0}
                      />
                    }
                  />
                )}
              </Line>
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Points accumulated"
        finding={
          comparison.seasons.length > 1
            ? 'Every season on a shared matchday axis — the one picked above leads.'
            : text.points
        }
        empty={comparison.points.length < 2}
        table={
          <table className="data">
            <thead>
              <tr>
                <th>Match</th>
                {comparison.seasons.map((s) => <th key={s} className="num">{s}</th>)}
              </tr>
            </thead>
            <tbody>
              {comparison.points.map((row) => (
                <tr key={row.matchday}>
                  <td>{row.matchday}</td>
                  {comparison.seasons.map((s) => (
                    <td key={s} className="num">{row[s] ?? ''}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        }
      >
        <ResponsiveContainer>
          <LineChart data={comparison.points} margin={{ top: 8, right: rightGap, bottom: 24, left: 4 }}>
            <CartesianGrid stroke={c.grid} vertical={false} />
            <XAxis dataKey="matchday" tick={tick} stroke={c.axis} tickLine={false}>
              <Label value="Matchday" position="insideBottom" offset={-12} style={tick} />
            </XAxis>
            <YAxis allowDecimals={false} tick={tick} stroke={c.axis} tickLine={false} width={yWidth} />
            <Tooltip content={<TooltipBox labelKey="__none" unit=" pts" />} />
            <Legend verticalAlign="bottom" iconType="plainline" wrapperStyle={legendStyle} />
            {/* Oldest first so the focused season paints on top. */}
            {[...comparison.seasons].reverse().map((s) => {
              const isFocused = s === (season === 'all' ? currentSeason : activeSeason);
              return (
                <Line
                  key={s}
                  type="linear"
                  dataKey={s}
                  name={s}
                  stroke={isFocused ? series(0) : c.past}
                  strokeWidth={isFocused ? 2.5 : 1.75}
                  strokeOpacity={isFocused ? 1 : 0.8}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: c.dot }}
                  connectNulls={false}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Goals scored and conceded"
        finding={text.goals}
        empty={trend.length < 2}
        table={
          <table className="data">
            <thead>
              <tr>
                <th>Match</th><th>Opponent</th>
                <th className="num">Scored</th><th className="num">Conceded</th>
              </tr>
            </thead>
            <tbody>
              {trend.map((d) => (
                <tr key={d.matchday}>
                  <td>{d.matchday}</td>
                  <td>{d.label}</td>
                  <td className="num">{d.goalsFor}</td>
                  <td className="num">{d.goalsAgainst}</td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      >
        <ResponsiveContainer>
          <AreaChart data={trend} margin={{ top: 8, right: rightGap, bottom: 24, left: 4 }}>
            <defs>
              <linearGradient id="gf" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={c.positive} stopOpacity={0.18} />
                <stop offset="100%" stopColor={c.positive} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={c.grid} vertical={false} />
            <XAxis dataKey="matchday" tick={tick} stroke={c.axis} tickLine={false}>
              <Label value="Matchday" position="insideBottom" offset={-12} style={tick} />
            </XAxis>
            <YAxis allowDecimals={false} tick={tick} stroke={c.axis} tickLine={false} width={yWidth} />
            <Tooltip content={<TooltipBox labelKey="label" />} />
            <Legend verticalAlign="bottom" iconType="plainline" wrapperStyle={legendStyle} />
            {/* Linear, not smoothed: each point is a discrete match result. */}
            <Area
              type="linear" dataKey="goalsFor" name="Scored"
              stroke={c.positive} strokeWidth={2} fill="url(#gf)"
              dot={{ r: 2.5, fill: c.positive, strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: c.dot }}
            />
            <Area
              type="linear" dataKey="goalsAgainst" name="Conceded"
              stroke={c.negative} strokeWidth={2} fill="none" strokeOpacity={0.9}
              dot={{ r: 2.5, fill: c.negative, strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: c.dot }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
