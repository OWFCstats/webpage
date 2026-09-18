import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Label, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { appearanceSpread } from '../../lib/charts';
import { plural, surname } from '../../lib/format';
import { fontPx } from '../../lib/tokens';
import { ChartSheet, chartColours, useChartAxis } from './chart-bits';

/** The one name the chart writes on itself: whoever is at the far end of it.
 *  Drawn over that bar rather than beside the axis, because the bar for an
 *  ever-present is a player tall and would otherwise be the least visible
 *  thing on a chart about turning up. */
function TopName({ x, y, width, index, at, name, fill }) {
  if (index !== at) return null;
  return (
    <text
      x={x + width / 2}
      y={y - 6}
      textAnchor="middle"
      fill={fill}
      fontSize={fontPx('--t-micro')}
      fontWeight={600}
    >
      {surname(name)}
    </text>
  );
}

/** How many players played how many games — the shape of who turns up. A club
 *  this size has a long tail of one-game players and a short core carrying the
 *  season, and the argument for every badge and leaderboard on the site is that
 *  the core should be bigger. One season at a time: run across every season
 *  these counts are a career total, which is Records' (CLAUDE.md → *Sections*). */
export default function AppearanceSpread({ season, players, matches, appearances }) {
  const c = chartColours();
  const { tick, yWidth } = useChartAxis();

  const data = useMemo(
    () => appearanceSpread(players, matches.filter((m) => m.season === season), appearances),
    [season, players, matches, appearances],
  );

  // `bars` runs 1..played, so the top bucket's bar is its game count less one.
  const topIndex = data.top ? data.top.games - 1 : -1;

  // Five counts evenly across the season, ends included — the mock's own axis,
  // and the same treatment the scoring race's dates get. Recharts' own thinning
  // fits as many single digits as the width allows, which on a phone is most of
  // them and reads as a ruler rather than a scale.
  const ticks = useMemo(() => {
    const n = data.bars.length;
    if (n === 0) return undefined;
    if (n <= 5) return data.bars.map((b) => b.games);
    return [0, 1, 2, 3, 4].map((i) => data.bars[Math.round((i * (n - 1)) / 4)].games);
  }, [data]);

  return (
    <ChartSheet
      label={`${plural(data.used, 'player', 'players')} used`}
      title="How often people played"
      empty={data.used === 0}
      table={
        <table className="data">
          <thead>
            <tr><th>Games</th><th className="num">Players</th></tr>
          </thead>
          <tbody>
            {data.bars.map((b) => (
              <tr key={b.games}><td>{b.games}</td><td className="num">{b.players}</td></tr>
            ))}
          </tbody>
        </table>
      }
    >
      <div className="chart-plot">
        <ResponsiveContainer>
          <BarChart data={data.bars} margin={{ top: 18, right: 16, bottom: 24, left: 4 }}>
            <CartesianGrid stroke={c.grid} vertical={false} />
            <XAxis dataKey="games" ticks={ticks} tick={tick} axisLine={false} tickLine={false} interval="preserveStartEnd">
              <Label value="Games played" position="insideBottom" offset={-12} style={tick} />
            </XAxis>
            <YAxis allowDecimals={false} tick={tick} axisLine={false} tickLine={false} width={yWidth} />
            <Tooltip
              cursor={{ fill: c.grid, fillOpacity: 0.4 }}
              content={({ active, payload, label }) => (!active || !payload?.length ? null : (
                <div className="chart-tip">
                  <div className="chart-tip-head">{plural(Number(label), 'game', 'games')}</div>
                  <div className="chart-tip-row">
                    <span>{plural(payload[0].value, 'player', 'players')}</span>
                  </div>
                </div>
              ))}
            />
            <Bar dataKey="players" name="Players" fill={c.gold} radius={[3, 3, 0, 0]}>
              {data.top && (
                <LabelList
                  dataKey="players"
                  content={<TopName at={topIndex} name={data.top.name} fill={c.mark} />}
                />
              )}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartSheet>
  );
}
