import { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { seasonSummary } from '../../lib/matches';
import { plural } from '../../lib/format';
import ChartCard from './ChartCard';
import { chartColours } from './chart-bits';

function finding(summary) {
  if (summary.played === 0) return null;
  return `${plural(summary.won, 'win', 'wins')}, ${plural(summary.drawn, 'draw', 'draws')}, `
    + `${plural(summary.lost, 'loss', 'losses')}.`;
}

/**
 * Won, drawn and lost as a share of the season, in the one W/D/L convention
 * every reader already reads on the form strip. Kept in `--win`/`--draw`/
 * `--loss` rather than the chart series order — these three colours mean
 * something specific everywhere else on the site (DESIGN.md → Chart series)
 * and a donut of them is never themed.
 *
 * A pie has no line end to label directly, so the count sits in a caption row
 * under the chart instead — not a dropped legend, since there was never a
 * multi-line plot here to read one off.
 */
export default function ResultSplit({ season, matches }) {
  const c = chartColours();
  const summary = useMemo(
    () => seasonSummary(matches.filter((m) => m.season === season)),
    [season, matches],
  );

  const data = [
    { name: 'Won', value: summary.won, colour: c.win },
    { name: 'Drawn', value: summary.drawn, colour: c.draw },
    { name: 'Lost', value: summary.lost, colour: c.loss },
  ].filter((d) => d.value > 0);

  return (
    <ChartCard
      title="Results"
      finding={finding(summary)}
      empty={summary.played === 0}
      bodyClassName="chart-body-donut"
      table={
        <table className="data">
          <thead>
            <tr><th></th><th className="num">Games</th></tr>
          </thead>
          <tbody>
            <tr><td>Won</td><td className="num">{summary.won}</td></tr>
            <tr><td>Drawn</td><td className="num">{summary.drawn}</td></tr>
            <tr><td>Lost</td><td className="num">{summary.lost}</td></tr>
          </tbody>
        </table>
      }
    >
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="58%"
            outerRadius="90%"
            paddingAngle={data.length > 1 ? 2 : 0}
            stroke="none"
          >
            {data.map((d) => <Cell key={d.name} fill={d.colour} />)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <ul className="chart-donut-key">
        {data.map((d) => (
          <li key={d.name}>
            <span className="chart-donut-swatch" style={{ background: d.colour }} />
            {d.name} <strong>{d.value}</strong>
          </li>
        ))}
      </ul>
    </ChartCard>
  );
}
