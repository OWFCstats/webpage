import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  BarChart,
  Bar,
  Label,
  LabelList,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';
import { useData } from '../context/DataContext';
import { ErrorNote, SeasonSelect, Spinner } from '../components/bits';
import {
  formatDate,
  involvementScatter,
  rate,
  seasonPointsComparison,
  seasonsOf,
  seasonTrend,
  stableColourSlots,
  topScorerRace,
} from '../lib/stats';

// Categorical series palette — validated for the white card surface: every slot
// clears the lightness/chroma bands, adjacent-pair CVD separation (worst 24.7
// protan), the normal-vision floor and 3:1 contrast. Order is the CVD-safety
// mechanism; assign in sequence and never cycle past the last slot.
const SERIES = ['#b8860b', '#4a3aa7', '#eb6834', '#2a78d6', '#008300'];

// Chart chrome — recessive, solid hairlines (never dashed).
const GRID = '#e6e4dc';
const AXIS = '#c3c2b7';
const MUTED = '#7c7a73';
// Past seasons: muted but still clearly legible behind the current campaign.
const PAST = '#9d9a92';
const POSITIVE = '#2a78d6';
const NEGATIVE = '#c9463d';

const axisStyle = { fontSize: 12, fill: MUTED };

function ChartCard({ title, subtitle, children, empty, table }) {
  const [showTable, setShowTable] = useState(false);
  return (
    <section className="card chart-card">
      <div className="chart-head">
        <div>
          <h2>{title}</h2>
          {subtitle && <p className="muted chart-sub">{subtitle}</p>}
        </div>
        {!empty && table && (
          <button className="secondary small" onClick={() => setShowTable((v) => !v)}>
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

/**
 * Spread labels that would land on the same spot. Takes entries keyed by a
 * collision bucket and returns id → vertical pixel offset, centred on the
 * original position so a lone label doesn't move at all.
 */
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

/** Direct label drawn only at a series' final point, so lines are identifiable
 *  without tracing back to the legend. */
function EndLabel({ x, y, value, index, lastIndex, fill, text, dy = 0 }) {
  if (index !== lastIndex) return null;
  return (
    <text x={x + 8} y={y + dy} dy={4} fill={fill} fontSize={12} fontWeight={700}>
      {text ?? value}
    </text>
  );
}

/** Labels only the handful of standout points on the scatter. */
function NotableLabel({ x, y, index, rows, notable, offsets }) {
  const d = rows?.[index];
  if (!d || !notable.has(d.id)) return null;
  return (
    <text
      x={x}
      y={y - 12 + (offsets?.get(d.id) ?? 0)}
      textAnchor="middle"
      fill={MUTED}
      fontSize={11}
      fontWeight={700}
    >
      {d.name}
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

export default function Trends() {
  const { players, matches, appearances, loading, error } = useData();
  const seasons = seasonsOf(matches);
  const [season, setSeason] = useState('latest');

  const colourSlots = useMemo(
    () => (loading ? new Map() : stableColourSlots(players, matches, appearances)),
    [loading, players, matches, appearances],
  );

  if (loading) return <Spinner />;
  if (error) return <ErrorNote message={error} />;

  const activeSeason = season === 'latest' ? seasons[0] : season;
  const pool = season === 'all' ? matches : matches.filter((m) => m.season === activeSeason);
  const trend = seasonTrend(pool);
  const race = topScorerRace(players, pool, appearances);
  const scatter = involvementScatter(players, pool, appearances);
  const comparison = seasonPointsComparison(matches);
  const currentSeason = seasons[0];

  // Scatter reference isolines: involvements per game at 0.5 and 1.0.
  const maxApps = Math.max(1, ...scatter.map((d) => d.appearances));
  const isoline = (r) => [
    { appearances: 0, goalInvolvements: 0 },
    { appearances: maxApps, goalInvolvements: maxApps * r },
  ];
  // Name only the few standout points so the plot stays readable, nudging apart
  // any that sit on top of each other.
  const notableRows = scatter
    .slice()
    .sort((a, b) => b.goalInvolvements - a.goalInvolvements)
    .slice(0, 4);
  const notable = new Set(notableRows.map((d) => d.id));
  const scatterOffsets = staggerOffsets(
    notableRows.map((d) => ({ id: d.id, bucket: `${d.appearances}:${d.goalInvolvements}` })),
    15,
  );

  // Race end-labels: players finishing on the same tally would otherwise overlap.
  const raceOffsets = staggerOffsets(
    race.players.map((p) => ({ id: p.id, bucket: p.goals })),
    15,
  );

  const colourFor = (playerId, fallbackIndex) =>
    SERIES[(colourSlots.get(playerId) ?? fallbackIndex) % SERIES.length];

  return (
    <div>
      <h1>Trends</h1>
      <p className="muted page-intro">
        Season shape and player output over time. Every chart reads from match
        data — hover any point for detail, or switch a card to its data table.
      </p>

      <SeasonSelect
        seasons={seasons}
        value={season === 'latest' ? (seasons[0] ?? 'all') : season}
        onChange={setSeason}
      />

      <div className="chart-stack">
        <ChartCard
          title="Points accumulated"
          subtitle={
            seasons.length > 1
              ? 'Every season on a shared matchday axis — the one you pick above leads, the rest sit behind it.'
              : 'Running points total, three for a win and one for a draw.'
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
            <LineChart data={comparison.points} margin={{ top: 8, right: 20, bottom: 24, left: 4 }}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="matchday" tick={axisStyle} stroke={AXIS} tickLine={false}>
                <Label value="Matchday" position="insideBottom" offset={-12} style={axisStyle} />
              </XAxis>
              <YAxis allowDecimals={false} tick={axisStyle} stroke={AXIS} tickLine={false} width={36} />
              <Tooltip content={<TooltipBox labelKey="__none" unit=" pts" />} />
              <Legend verticalAlign="top" align="right" iconType="plainline" wrapperStyle={{ fontSize: 12, paddingBottom: 8 }} />
              {/* Oldest first so the current season paints on top. */}
              {[...comparison.seasons].reverse().map((s) => {
                // The season picker drives which line is foregrounded, so this
                // chart responds to the filter like every other card.
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
          subtitle="Match by match, across the selected season."
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
            <AreaChart data={trend} margin={{ top: 8, right: 20, bottom: 24, left: 4 }}>
              <defs>
                <linearGradient id="gf" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={POSITIVE} stopOpacity={0.18} />
                  <stop offset="100%" stopColor={POSITIVE} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="matchday" tick={axisStyle} stroke={AXIS} tickLine={false}>
                <Label value="Matchday" position="insideBottom" offset={-12} style={axisStyle} />
              </XAxis>
              <YAxis allowDecimals={false} tick={axisStyle} stroke={AXIS} tickLine={false} width={36} />
              <Tooltip content={<TooltipBox labelKey="label" />} />
              <Legend verticalAlign="top" align="right" iconType="plainline" wrapperStyle={{ fontSize: 12, paddingBottom: 8 }} />
              {/* Linear, not smoothed: each point is a discrete match result and
                  a curve would imply scores between games. */}
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

        <ChartCard
          title="Goal difference"
          subtitle="Per-match margin in bars, with the running season total as a line above it."
          empty={trend.length < 2}
          table={
            <table className="data">
              <thead>
                <tr>
                  <th>Match</th><th>Opponent</th>
                  <th className="num">Margin</th><th className="num">Running GD</th>
                </tr>
              </thead>
              <tbody>
                {trend.map((d) => (
                  <tr key={d.matchday}>
                    <td>{d.matchday}</td>
                    <td>{d.label}</td>
                    <td className="num">{d.goalDifference > 0 ? `+${d.goalDifference}` : d.goalDifference}</td>
                    <td className="num">{d.cumulativeGD > 0 ? `+${d.cumulativeGD}` : d.cumulativeGD}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          }
        >
          <div className="chart-split">
            <ResponsiveContainer>
              <LineChart data={trend} margin={{ top: 8, right: 20, bottom: 0, left: 4 }}>
                <CartesianGrid stroke={GRID} vertical={false} />
                {/* Axis chrome lives on the lower plot; this one only shares its scale. */}
                <XAxis dataKey="matchday" tick={false} axisLine={false} tickLine={false} height={1} />
                <YAxis tick={axisStyle} stroke={AXIS} tickLine={false} width={36} />
                <Tooltip content={<TooltipBox labelKey="label" />} />
                <ReferenceLine y={0} stroke={AXIS} />
                <Line
                  type="linear" dataKey="cumulativeGD" name="Running goal difference"
                  stroke={SERIES[1]} strokeWidth={2.5}
                  dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
            <ResponsiveContainer>
              <BarChart data={trend} margin={{ top: 4, right: 20, bottom: 24, left: 4 }}>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="matchday" tick={axisStyle} stroke={AXIS} tickLine={false}>
                  <Label value="Matchday" position="insideBottom" offset={-12} style={axisStyle} />
                </XAxis>
                <YAxis tick={axisStyle} stroke={AXIS} tickLine={false} width={36} />
                <Tooltip content={<TooltipBox labelKey="label" />} />
                <ReferenceLine y={0} stroke={AXIS} />
                <Bar dataKey="goalDifference" name="Match margin" radius={[3, 3, 0, 0]}>
                  {trend.map((d) => (
                    <Cell
                      key={d.matchday}
                      fill={d.goalDifference >= 0 ? POSITIVE : NEGATIVE}
                      fillOpacity={0.85}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Golden Boot race"
          subtitle="Cumulative goals for the season's leading scorers as the campaign unfolds."
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
            <LineChart data={race.points} margin={{ top: 8, right: 78, bottom: 24, left: 4 }}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="matchday" tick={axisStyle} stroke={AXIS} tickLine={false}>
                <Label value="Matchday" position="insideBottom" offset={-12} style={axisStyle} />
              </XAxis>
              <YAxis allowDecimals={false} tick={axisStyle} stroke={AXIS} tickLine={false} width={36} />
              <Tooltip content={<TooltipBox labelKey="label" unit=" goals" />} />
              <Legend verticalAlign="top" align="right" iconType="plainline" wrapperStyle={{ fontSize: 12, paddingBottom: 8 }} />
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
                </Line>
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Output vs game time"
          subtitle="Each dot is a player: appearances across, goals plus assists up. Diagonals mark one involvement every game and every other game — above the line is above rate."
          empty={scatter.length === 0}
          table={
            <table className="data">
              <thead>
                <tr>
                  <th>Player</th><th className="num">Apps</th>
                  <th className="num">G+A</th><th className="num">G+A per game</th>
                </tr>
              </thead>
              <tbody>
                {scatter
                  .slice()
                  .sort((a, b) => b.involvementsPerGame - a.involvementsPerGame)
                  .map((d) => (
                    <tr key={d.id}>
                      <td>{d.name}</td>
                      <td className="num">{d.appearances}</td>
                      <td className="num">{d.goalInvolvements}</td>
                      <td className="num">{rate(d.involvementsPerGame)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          }
        >
          <ResponsiveContainer>
            <ScatterChart margin={{ top: 18, right: 30, bottom: 24, left: 12 }}>
              <CartesianGrid stroke={GRID} />
              <XAxis
                type="number" dataKey="appearances" name="Appearances"
                tick={axisStyle} stroke={AXIS} tickLine={false} allowDecimals={false}
              >
                <Label value="Appearances" position="insideBottom" offset={-12} style={axisStyle} />
              </XAxis>
              <YAxis
                type="number" dataKey="goalInvolvements" name="Goals + assists"
                tick={axisStyle} stroke={AXIS} tickLine={false} allowDecimals={false} width={36}
              >
                <Label value="G+A" angle={-90} position="insideLeft" style={axisStyle} />
              </YAxis>
              <ZAxis range={[90, 90]} />
              <Tooltip
                cursor={{ strokeDasharray: '0', stroke: GRID }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="chart-tip">
                      <div className="chart-tip-head">{d.name}</div>
                      <div className="chart-tip-row"><span>Appearances</span><strong>{d.appearances}</strong></div>
                      <div className="chart-tip-row"><span>Goals</span><strong>{d.goals}</strong></div>
                      <div className="chart-tip-row"><span>Assists</span><strong>{d.assists}</strong></div>
                      <div className="chart-tip-row"><span>G+A per game</span><strong>{rate(d.involvementsPerGame)}</strong></div>
                    </div>
                  );
                }}
              />
              <Scatter
                data={isoline(1)} line={{ stroke: AXIS, strokeWidth: 1 }} shape={() => null}
                legendType="none" isAnimationActive={false}
              />
              <Scatter
                data={isoline(0.5)} line={{ stroke: AXIS, strokeWidth: 1 }} shape={() => null}
                legendType="none" isAnimationActive={false}
              />
              <Scatter
                name="Players" data={scatter}
                fill={SERIES[0]} fillOpacity={0.85}
                stroke="#fff" strokeWidth={2}
              >
                <LabelList
                  content={<NotableLabel notable={notable} rows={scatter} offsets={scatterOffsets} />}
                />
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
