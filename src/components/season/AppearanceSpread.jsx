import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Label, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { appearanceSpread } from '../../lib/charts';
import { plural } from '../../lib/format';
import { statColour } from '../../lib/tokens';
import ChartCard from './ChartCard';
import { chartColours, useChartAxis } from './chart-bits';

function finding({ used, core, half, played }) {
  if (played === 0 || used === 0) return null;
  if (core === 0) return `Nobody has reached half the season yet — ${plural(half, 'game', 'games')}.`;
  return `${core} of the ${used} used played ${plural(half, 'game', 'games')} or more.`;
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

  return (
    <ChartCard
      title="Appearances across the squad"
      finding={finding(data)}
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
      <ResponsiveContainer>
        <BarChart data={data.bars} margin={{ top: 8, right: 16, bottom: 24, left: 4 }}>
          <CartesianGrid stroke={c.grid} vertical={false} />
          {/* A season's worth of bars is more ticks than a phone has room for,
              so the axis thins them itself — the ends are what the reader is
              placing the shape between. */}
          <XAxis dataKey="games" tick={tick} axisLine={false} tickLine={false} interval="preserveStartEnd">
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
          <Bar dataKey="players" name="Players" fill={statColour('appearances')} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
