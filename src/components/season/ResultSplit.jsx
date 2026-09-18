import { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { seasonSummary } from '../../lib/matches';
import { chartColours } from './chart-bits';

/**
 * Won, drawn and lost as a share of the season — a 128px donut beside a key
 * that carries every figure printed, so the card needs no data table (Draft
 * D: *Charts* → the tiles, these four, the ranked list). Kept in
 * `--win`/`--draw`/`--loss` rather than the chart series order — those three
 * colours mean something specific everywhere else on the site (DESIGN.md →
 * *Chart series*) and a result split is never themed.
 */
export default function ResultSplit({ season, matches }) {
  const c = chartColours();
  const summary = useMemo(
    () => seasonSummary(matches.filter((m) => m.season === season)),
    [season, matches],
  );

  const pct = (n) => (summary.played ? Math.round((n / summary.played) * 100) : 0);
  const data = [
    { name: 'Won', value: summary.won, colour: c.win },
    { name: 'Drawn', value: summary.drawn, colour: c.draw },
    { name: 'Lost', value: summary.lost, colour: c.loss },
  ].filter((d) => d.value > 0);

  return (
    <section className="sheet">
      <span className="label ruled">How the games finished</span>
      {summary.played === 0 ? (
        <div className="empty">Not enough data yet — this fills in as matches are recorded.</div>
      ) : (
        <div className="donut-wrap">
          <ResponsiveContainer width={128} height={128}>
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
          <div className="donut-key">
            <div>
              <span><i style={{ background: c.win }} />Won</span>
              <b>{summary.won} · {pct(summary.won)}%</b>
            </div>
            <div>
              <span><i style={{ background: c.draw }} />Drawn</span>
              <b>{summary.drawn} · {pct(summary.drawn)}%</b>
            </div>
            <div>
              <span><i style={{ background: c.loss }} />Lost</span>
              <b>{summary.lost} · {pct(summary.lost)}%</b>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
