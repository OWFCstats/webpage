import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  CartesianGrid, Label, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip,
  XAxis, YAxis, ZAxis,
} from 'recharts';
import { contributionScatter } from '../../lib/charts';
import { plural, surname } from '../../lib/format';
import { fontPx, token } from '../../lib/tokens';
import { ChartSheet, chartColours, useChartAxis } from './chart-bits';

// A tooltip listing forty-eight names is a page, not a tooltip. The rest are
// counted, and the data table below the chart has all of them with their own
// links.
const NAMES_SHOWN = 6;

// Dot area in px², not radius: a dot for six players has to look like six, and
// area is what the eye reads as quantity.
const DOT_AREA = [46, 340];

/**
 * "One a game", written on the diagonal rather than beside it. Recharts places
 * a reference label from the line's bounding box, which for a diagonal is the
 * whole plot — `insideTopLeft` put the words in the top-left corner, where they
 * read as a label for the gridline they happened to land on. This sits them at
 * the line's midpoint, in the empty triangle above it: everything below the
 * line is dots.
 */
function DiagonalLabel({ viewBox, fill, size }) {
  if (!viewBox) return null;
  const { x = 0, y = 0, width = 0, height = 0 } = viewBox;
  return (
    <text
      x={x + width / 2 - 6}
      y={y + height / 2 - 7}
      textAnchor="end"
      fill={fill}
      fontSize={size}
    >
      One a game
    </text>
  );
}

/**
 * A gilded dot with its own surname beside it. Drawn as the Scatter's `shape`
 * rather than a `LabelList` so the dot and the name are positioned together,
 * and sized off the same `size` (an area) every other dot is, because the
 * card's note promises size means how many share the spot.
 *
 * The name flips to the left of the dot in the last third of the axis, where a
 * label drawn rightwards would run off the plot. Decided off the data rather
 * than off the rendered geometry: the plot's own width isn't a thing a shape
 * can read without reaching into Recharts' internals.
 */
function LeaderDot({ cx, cy, size, fill, payload, flipAt, nameFill }) {
  if (cx == null || cy == null) return null;
  const r = Math.sqrt((size ?? DOT_AREA[0]) / Math.PI);
  const left = payload.appearances >= flipAt;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={fill} stroke={fill} />
      <text
        x={left ? cx - r - 5 : cx + r + 5}
        y={cy}
        dy={4}
        textAnchor={left ? 'end' : 'start'}
        fill={nameFill}
        fontSize={fontPx('--t-micro')}
        fontWeight={600}
      >
        {surname(payload.leader.name)}
      </text>
    </g>
  );
}

/** One spot, and who is standing on it. */
function SpotTip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const spot = payload[0]?.payload;
  if (!spot) return null;
  const shown = spot.names.slice(0, NAMES_SHOWN);
  const rest = spot.names.length - shown.length;
  return (
    <div className="chart-tip">
      <div className="chart-tip-head">
        {plural(spot.appearances, 'game', 'games')}
        <span className="muted"> · {plural(spot.contributions, 'contribution', 'contributions')}</span>
      </div>
      <p className="chart-tip-names">
        {shown.join(', ')}
        {rest > 0 && ` and ${rest} more`}
      </p>
    </div>
  );
}

/**
 * Every player who turned up, plotted by how often against what they produced,
 * with a dashed diagonal at one goal or assist a game. The squad bunches — a
 * dozen players on one game and nothing — so players sharing a spot are one
 * dot sized by how many, rather than a dozen drawn on top of each other and
 * read as one.
 *
 * The season's leading contributors are gold and carry their surname; the rest
 * of the squad is the verdigris pile behind them (docs/DESIGN.md → *Charts*).
 *
 * One season at a time, the same reason as the scoring race above it: across
 * every season this is a career board, and career boards are Records'
 * (CLAUDE.md → *Sections*).
 */
export default function GamesAgainstContributions({ season, players, matches, appearances }) {
  const c = chartColours();
  const { tick, yWidth } = useChartAxis();

  const data = useMemo(
    () => contributionScatter(players, matches.filter((m) => m.season === season), appearances),
    [season, players, matches, appearances],
  );

  const maxCount = Math.max(1, ...data.points.map((p) => p.count));
  // Four even intervals on both axes, so they read 0/3/6/9/12 rather than the
  // 0/3/6/10 Recharts lands on when it divides a raw maximum four ways and
  // rounds each tick separately.
  const ceiling = (n) => Math.max(4, Math.ceil(n / 4) * 4);
  const pile = data.points.filter((p) => !p.leader);
  const leaders = data.points.filter((p) => p.leader);
  // Measured against the axis, not against the busiest player: the axis rounds
  // up past the last dot, so a leader two thirds of the way along the data can
  // still have half the plot to his right to write a name in.
  const flipAt = ceiling(data.maxApps) * 0.72;

  return (
    <ChartSheet
      label="Every player who has appeared"
      title="Games against contributions"
      note="Dot size: how many players share the spot."
      empty={data.rows.length === 0}
      table={
        <table className="data">
          <thead>
            {/* The league table's own column codes: five words of header is
                68px more than a 375px screen has, and P/G/A are letters this
                site already teaches on every standings table. */}
            <tr>
              <th>Player</th>
              <th className="num">P</th>
              <th className="num">G</th>
              <th className="num">A</th>
              <th className="num">G+A</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((r) => (
              <tr key={r.id}>
                <td><Link to={`/players/${r.id}`}>{r.name}</Link></td>
                <td className="num">{r.appearances}</td>
                <td className="num">{r.goals}</td>
                <td className="num">{r.assists}</td>
                <td className="num">{r.contributions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    >
      <div className="chart-plot">
        <ResponsiveContainer>
          <ScatterChart margin={{ top: 8, right: 20, bottom: 24, left: 4 }}>
            <CartesianGrid stroke={c.grid} vertical={false} />
            <XAxis
              type="number"
              dataKey="appearances"
              allowDecimals={false}
              domain={[0, ceiling(data.maxApps)]}
              tickCount={5}
              tick={tick}
              axisLine={false}
              tickLine={false}
            >
              <Label value="Appearances" position="insideBottom" offset={-12} style={tick} />
            </XAxis>
            <YAxis
              type="number"
              dataKey="contributions"
              allowDecimals={false}
              domain={[0, ceiling(data.maxContributions)]}
              tickCount={5}
              tick={tick}
              axisLine={false}
              tickLine={false}
              width={yWidth}
            />
            <ZAxis
              type="number"
              dataKey="count"
              // A floor of 2 on the domain so a season where nobody shares a spot
              // draws every dot at the small end rather than all of them at the
              // large one.
              domain={[1, Math.max(2, maxCount)]}
              range={DOT_AREA}
            />
            {data.reference > 0 && (
              <ReferenceLine
                segment={[{ x: 0, y: 0 }, { x: data.reference, y: data.reference }]}
                stroke={c.muted}
                strokeDasharray="4 4"
                label={<DiagonalLabel fill={c.muted} size={fontPx('--t-micro')} />}
              />
            )}
            <Tooltip content={<SpotTip />} cursor={false} />
            <Scatter
              data={pile}
              name="Players"
              fill={c.pile}
              fillOpacity={0.75}
              stroke={c.pile}
            />
            <Scatter
              data={leaders}
              name="Leading contributors"
              fill={c.gold}
              shape={<LeaderDot flipAt={flipAt} nameFill={token('--ink')} />}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </ChartSheet>
  );
}
