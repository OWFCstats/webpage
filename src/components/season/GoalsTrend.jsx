import { useMemo } from 'react';
import {
  Area, AreaChart, CartesianGrid, Label, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { seasonTrend } from '../../lib/charts';
import ChartCard from './ChartCard';
import ChartEndLabel from '../ChartEndLabel';
import { TooltipBox, chartColours, useChartAxis } from './chart-bits';

/** How the defence held up, in one sentence. */
function finding(trend) {
  if (trend.length === 0) return null;
  const heavy = trend.filter((d) => d.goalsAgainst >= 4).length;
  return heavy > 0
    ? `Conceded four or more in ${heavy} of ${trend.length}.`
    : 'Never conceded more than three.';
}

/** Goals for and against, match by match. One season at a time, for the same
 *  reason the Golden Boot race is: across every season it is a club timeline,
 *  and that is Records'. */
export default function GoalsTrend({ season, matches }) {
  const c = chartColours();
  const { narrow, tick, yWidth, labelGap } = useChartAxis();

  const trend = useMemo(
    () => seasonTrend(matches.filter((m) => m.season === season)),
    [season, matches],
  );

  return (
    <ChartCard
      title="Goals scored and conceded"
      finding={finding(trend)}
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
        <AreaChart data={trend} margin={{ top: 8, right: labelGap(64), bottom: 24, left: 4 }}>
          <CartesianGrid stroke={c.grid} vertical={false} />
          <XAxis dataKey="matchday" tick={tick} axisLine={false} tickLine={false}>
            <Label value="Matchday" position="insideBottom" offset={-12} style={tick} />
          </XAxis>
          <YAxis allowDecimals={false} tick={tick} axisLine={false} tickLine={false} width={yWidth} />
          <Tooltip content={<TooltipBox labelKey="label" />} />
          {/* Linear, not smoothed: each point is a discrete match result. A flat
              low-alpha fill, not a gradient, per the chart rules. */}
          <Area
            type="linear" dataKey="goalsFor" name="Scored"
            stroke={c.positive} strokeWidth={2} fill={c.positive} fillOpacity={0.12}
            dot={{ r: 2.5, fill: c.positive, strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 2, stroke: c.dot }}
          >
            {!narrow && (
              <LabelList
                dataKey="goalsFor"
                content={<ChartEndLabel lastIndex={trend.length - 1} fill={c.positive} text="Scored" />}
              />
            )}
          </Area>
          <Area
            type="linear" dataKey="goalsAgainst" name="Conceded"
            stroke={c.negative} strokeWidth={2} fill="none" strokeOpacity={0.9}
            dot={{ r: 2.5, fill: c.negative, strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 2, stroke: c.dot }}
          >
            {!narrow && (
              <LabelList
                dataKey="goalsAgainst"
                content={<ChartEndLabel lastIndex={trend.length - 1} fill={c.negative} text="Conceded" dy={-10} />}
              />
            )}
          </Area>
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
