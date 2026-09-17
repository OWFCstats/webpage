import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Label, LabelList, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { extremeMargins, marginBuckets } from '../../lib/matches';
import ChartCard from './ChartCard';
import { chartColours, useChartAxis } from './chart-bits';

function finding({ biggestWin, heaviestLoss }) {
  if (biggestWin == null && heaviestLoss == null) return null;
  if (heaviestLoss == null) return `Biggest win by ${biggestWin} — nothing lost yet.`;
  if (biggestWin == null) return `Heaviest defeat by ${heaviestLoss}.`;
  return `Biggest win by ${biggestWin}, heaviest defeat by ${heaviestLoss}.`;
}

/** How the season's decided games tended to go — a goal either way is the
 *  common case everywhere, and this is where that stops being true. Draws
 *  carry no margin, so they don't appear here at all. */
export default function MatchMargins({ season, matches }) {
  const c = chartColours();
  const { tick, yWidth } = useChartAxis();

  const { buckets, extremes } = useMemo(() => {
    const pool = matches.filter((m) => m.season === season);
    return { buckets: marginBuckets(pool), extremes: extremeMargins(pool) };
  }, [season, matches]);

  const hasData = buckets.some((b) => b.wins > 0 || b.losses > 0);
  const label = (v) => (v > 0 ? v : '');

  return (
    <ChartCard
      title="Winning and losing margins"
      finding={finding(extremes)}
      empty={!hasData}
      table={
        <table className="data">
          <thead>
            <tr><th>Margin</th><th className="num">Wins</th><th className="num">Losses</th></tr>
          </thead>
          <tbody>
            {buckets.map((b) => (
              <tr key={b.margin}>
                <td>{b.margin}</td><td className="num">{b.wins}</td><td className="num">{b.losses}</td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    >
      <ResponsiveContainer>
        <BarChart data={buckets} margin={{ top: 20, right: 16, bottom: 24, left: 4 }}>
          <CartesianGrid stroke={c.grid} vertical={false} />
          <XAxis dataKey="margin" tick={tick} axisLine={false} tickLine={false}>
            <Label value="Goals" position="insideBottom" offset={-12} style={tick} />
          </XAxis>
          <YAxis allowDecimals={false} tick={tick} axisLine={false} tickLine={false} width={yWidth} />
          <Bar dataKey="wins" name="Won by" fill={c.win} radius={[3, 3, 0, 0]}>
            <LabelList dataKey="wins" position="top" style={tick} formatter={label} />
          </Bar>
          <Bar dataKey="losses" name="Lost by" fill={c.loss} radius={[3, 3, 0, 0]}>
            <LabelList dataKey="losses" position="top" style={tick} formatter={label} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
