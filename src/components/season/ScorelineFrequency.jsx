import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { scorelineFrequency } from '../../lib/matches';
import { plural } from '../../lib/format';
import ChartCard from './ChartCard';
import { chartColours, useChartAxis } from './chart-bits';

// Past this many distinct scorelines the chart itself would be taller than the
// finding it's illustrating; the full list is still one tap away in the table.
const SHOWN = 8;

function finding(entries) {
  if (entries.length === 0) return null;
  const top = entries[0];
  if (top.count === 1) return 'No scoreline has repeated yet.';
  const tied = entries.filter((e) => e.count === top.count);
  if (tied.length > 1) return `${plural(tied.length, 'scoreline', 'scorelines')} tied on ${top.count}.`;
  return `${top.scoreline} has come up ${plural(top.count, 'time', 'times')}.`;
}

/** Which final scores have actually come round again. One season at a time —
 *  across every season this is a career tally, and that's Records' (CLAUDE.md
 *  → Sections). */
export default function ScorelineFrequency({ season, matches }) {
  const c = chartColours();
  const { tick } = useChartAxis();

  const entries = useMemo(
    () => scorelineFrequency(matches.filter((m) => m.season === season)),
    [season, matches],
  );

  return (
    <ChartCard
      title="Common scorelines"
      finding={finding(entries)}
      empty={entries.length === 0}
      table={
        <table className="data">
          <thead>
            <tr><th>Scoreline</th><th className="num">Times</th></tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.scoreline}><td>{e.scoreline}</td><td className="num">{e.count}</td></tr>
            ))}
          </tbody>
        </table>
      }
    >
      <ResponsiveContainer>
        <BarChart data={entries.slice(0, SHOWN)} layout="vertical" margin={{ top: 8, right: 28, bottom: 8, left: 4 }}>
          <CartesianGrid stroke={c.grid} horizontal={false} />
          <XAxis type="number" allowDecimals={false} tick={tick} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="scoreline" tick={tick} axisLine={false} tickLine={false} width={48} />
          <Bar dataKey="count" name="Times" fill={c.positive} radius={[0, 3, 3, 0]}>
            <LabelList dataKey="count" position="right" style={tick} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
