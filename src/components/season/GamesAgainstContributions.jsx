import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  CartesianGrid, Label, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip,
  XAxis, YAxis, ZAxis,
} from 'recharts';
import { contributionScatter } from '../../lib/charts';
import { plural } from '../../lib/format';
import { fontPx, statColour } from '../../lib/tokens';
import ChartCard from './ChartCard';
import { chartColours, useChartAxis } from './chart-bits';

// A tooltip listing forty-eight names is a page, not a tooltip. The rest are
// counted, and the data table below the chart has all of them with their own
// links.
const NAMES_SHOWN = 6;

// Dot area in px², not radius: a dot for six players has to look like six, and
// area is what the eye reads as quantity.
const DOT_AREA = [46, 340];

function finding({ leader, above, rows }) {
  if (!leader) return null;
  const lead = `${leader.name} leads on ${leader.contributions} `
    + `from ${plural(leader.appearances, 'game', 'games')}`;
  if (above === 0) return `${lead}. Nobody is at one a game yet.`;
  return `${lead} — ${above} of ${rows.length} ${above === 1 ? 'is' : 'are'} `
    + 'at one a game or better.';
}

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
 * One season at a time, the same reason as the scoring race beside it: across
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

  return (
    <ChartCard
      title="Games against contributions"
      finding={finding(data)}
      empty={data.rows.length === 0}
      table={
        <table className="data">
          <thead>
            <tr>
              <th>Player</th>
              <th className="num">Games</th>
              <th className="num">Goals</th>
              <th className="num">Assists</th>
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
      <ResponsiveContainer>
        <ScatterChart margin={{ top: 8, right: 20, bottom: 24, left: 4 }}>
          <CartesianGrid stroke={c.grid} vertical={false} />
          <XAxis
            type="number"
            dataKey="appearances"
            allowDecimals={false}
            domain={[0, 'dataMax']}
            tick={tick}
            axisLine={false}
            tickLine={false}
          >
            <Label value="Games played" position="insideBottom" offset={-12} style={tick} />
          </XAxis>
          <YAxis
            type="number"
            dataKey="contributions"
            allowDecimals={false}
            domain={[0, 'dataMax']}
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
            data={data.points}
            name="Players"
            fill={statColour('goalInvolvements')}
            fillOpacity={0.7}
            stroke={statColour('goalInvolvements')}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
