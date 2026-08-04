import { useEffect, useMemo, useState } from 'react';
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
import {
  formatDate,
  seasonPointsComparison,
  seasonTrend,
  stableColourSlots,
  topScorerRace,
} from '../lib/stats';

// Categorical series palette — validated for the white card surface: every slot
// clears the lightness/chroma bands, adjacent-pair CVD separation, the
// normal-vision floor and 3:1 contrast. Assign in sequence, never cycle.
const SERIES = ['#b8860b', '#4a3aa7', '#eb6834', '#2a78d6', '#008300'];
const GRID = '#e6e4dc';
const AXIS = '#c3c2b7';
const MUTED = '#7c7a73';
const PAST = '#9d9a92';
const POSITIVE = '#2a78d6';
const NEGATIVE = '#c9463d';

const axisStyle = { fontSize: 12, fill: MUTED };
const axisStyleNarrow = { fontSize: 10, fill: MUTED };

/** True on phone-width screens; Recharts needs the breakpoint in JS too. */
function useIsNarrow(query = '(max-width: 700px)') {
  const [narrow, setNarrow] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e) => setNarrow(e.matches);
    mq.addEventListener('change', onChange);
    setNarrow((prev) => (prev === mq.matches ? prev : mq.matches));
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return narrow;
}

/** Card with a finding as its subtitle — a sentence, not a description of the
 *  axes — and the data table one press away. */
function ChartCard({ title, finding, children, empty, table }) {
  const [showTable, setShowTable] = useState(false);
  return (
    <section className="card chart-card">
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
    <text x={x + 8} y={y + dy} dy={4} fill={fill} fontSize={12} fontWeight={700}>
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

  const tick = narrow ? axisStyleNarrow : axisStyle;
  const yWidth = narrow ? 26 : 36;
  const rightGap = narrow ? 12 : 20;
  const raceRightGap = narrow ? 12 : 78;
  const legendStyle = { fontSize: narrow ? 11 : 12, paddingTop: 6 };

  const colourFor = (playerId, fallbackIndex) =>
    SERIES[(colourSlots.get(playerId) ?? fallbackIndex) % SERIES.length];

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
            <CartesianGrid stroke={GRID} vertical={false} />
            <XAxis dataKey="matchday" tick={tick} stroke={AXIS} tickLine={false}>
              <Label value="Matchday" position="insideBottom" offset={-12} style={tick} />
            </XAxis>
            <YAxis allowDecimals={false} tick={tick} stroke={AXIS} tickLine={false} width={yWidth} />
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
                activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
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
            <CartesianGrid stroke={GRID} vertical={false} />
            <XAxis dataKey="matchday" tick={tick} stroke={AXIS} tickLine={false}>
              <Label value="Matchday" position="insideBottom" offset={-12} style={tick} />
            </XAxis>
            <YAxis allowDecimals={false} tick={tick} stroke={AXIS} tickLine={false} width={yWidth} />
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
                  stroke={isFocused ? SERIES[0] : PAST}
                  strokeWidth={isFocused ? 2.5 : 1.75}
                  strokeOpacity={isFocused ? 1 : 0.8}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
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
                <stop offset="0%" stopColor={POSITIVE} stopOpacity={0.18} />
                <stop offset="100%" stopColor={POSITIVE} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={GRID} vertical={false} />
            <XAxis dataKey="matchday" tick={tick} stroke={AXIS} tickLine={false}>
              <Label value="Matchday" position="insideBottom" offset={-12} style={tick} />
            </XAxis>
            <YAxis allowDecimals={false} tick={tick} stroke={AXIS} tickLine={false} width={yWidth} />
            <Tooltip content={<TooltipBox labelKey="label" />} />
            <Legend verticalAlign="bottom" iconType="plainline" wrapperStyle={legendStyle} />
            {/* Linear, not smoothed: each point is a discrete match result. */}
            <Area
              type="linear" dataKey="goalsFor" name="Scored"
              stroke={POSITIVE} strokeWidth={2} fill="url(#gf)"
              dot={{ r: 2.5, fill: POSITIVE, strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
            />
            <Area
              type="linear" dataKey="goalsAgainst" name="Conceded"
              stroke={NEGATIVE} strokeWidth={2} fill="none" strokeOpacity={0.9}
              dot={{ r: 2.5, fill: NEGATIVE, strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
