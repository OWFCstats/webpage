import { useMemo } from 'react';
import {
  CartesianGrid, Label, LabelList, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { lastDefinedIndex, seasonPointsComparison } from '../../lib/charts';
import { plural } from '../../lib/format';
import { series } from '../../lib/tokens';
import ChartCard from './ChartCard';
import ChartEndLabel from '../ChartEndLabel';
import { TooltipBox, chartColours, staggerOffsets, useChartAxis } from './chart-bits';

/** Each season's final league points, newest first — the same series the chart
 *  plots, read back for the finding sentence. */
function totalsOf(comparison) {
  return comparison.seasons
    .map((season) => {
      const i = lastDefinedIndex(comparison.points, season);
      return i < 0 ? null : { season, points: comparison.points[i][season], played: i + 1 };
    })
    .filter(Boolean);
}

/** With a season picked, that season's own haul — or, once there is more than
 *  one season behind it, what the grey lines are. Under All seasons, the best
 *  on record, a tie named as a tie rather than resolved (DESIGN.md → *Ties*). */
function finding(comparison, season) {
  if (season !== 'all') {
    if (comparison.seasons.length > 1) {
      return 'Every season on a shared matchday axis — the one picked above leads.';
    }
    const i = lastDefinedIndex(comparison.points, season);
    return i < 0 ? null : `${comparison.points[i][season]} points from ${i + 1} played.`;
  }
  const totals = totalsOf(comparison);
  if (totals.length === 0) return null;
  const best = Math.max(...totals.map((t) => t.points));
  const top = totals.filter((t) => t.points === best);
  if (top.length > 1) return `${plural(top.length, 'season', 'seasons')} level on ${best} points.`;
  return `${top[0].season} is the best on record: ${best} points from `
    + `${plural(top[0].played, 'league game', 'league games')}.`;
}

/**
 * Cumulative league points, every season on a shared matchday axis. `season` is
 * a year, or `'all'`.
 *
 * League matches only, because points accumulated is a league-table concept —
 * `seasonPointsComparison` does that filtering, and the finding says so.
 */
export default function PointsAccumulated({ season, matches }) {
  const c = chartColours();
  const { narrow, tick, yWidth, labelGap } = useChartAxis();
  const allSeasons = season === 'all';

  const { comparison, offsets } = useMemo(() => {
    const comparison = seasonPointsComparison(matches);
    return {
      comparison,
      // Seasons rarely end on the same matchday on the same points, but when
      // two do, their end labels land on each other.
      offsets: staggerOffsets(
        totalsOf(comparison).map((t) => ({ id: t.season, bucket: `${t.played}:${t.points}` })),
      ),
    };
  }, [matches]);

  return (
    <ChartCard
      title="Points accumulated"
      finding={finding(comparison, season)}
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
        <LineChart data={comparison.points} margin={{ top: 8, right: labelGap(64), bottom: 24, left: 4 }}>
          <CartesianGrid stroke={c.grid} vertical={false} />
          <XAxis dataKey="matchday" tick={tick} axisLine={false} tickLine={false}>
            <Label value="Matchday" position="insideBottom" offset={-12} style={tick} />
          </XAxis>
          <YAxis allowDecimals={false} tick={tick} axisLine={false} tickLine={false} width={yWidth} />
          <Tooltip content={<TooltipBox labelKey="__none" unit=" pts" />} />
          {/* Oldest first so the season in focus paints on top. With one picked
              the rest are unlabelled grey context; under All seasons nothing is
              context — telling the seasons apart is what the mode is for — so
              every line takes its own colour and its own end label
              (docs/DESIGN.md → *Charts*). `seasons` is newest first, so the
              newest keeps --series-1 either way. */}
          {[...comparison.seasons].reverse().map((s) => {
            const lit = allSeasons || s === season;
            const stroke = allSeasons
              ? series(comparison.seasons.indexOf(s))
              : lit ? series(0) : c.past;
            return (
              <Line
                key={s}
                type="linear"
                dataKey={s}
                name={s}
                stroke={stroke}
                strokeWidth={allSeasons ? 2 : lit ? 2.5 : 1.75}
                strokeOpacity={lit ? 1 : 0.8}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: c.dot }}
                connectNulls={false}
              >
                {lit && !narrow && (
                  <LabelList
                    dataKey={s}
                    content={
                      <ChartEndLabel
                        lastIndex={lastDefinedIndex(comparison.points, s)}
                        fill={stroke}
                        text={s}
                        dy={allSeasons ? offsets.get(s) ?? 0 : 0}
                      />
                    }
                  />
                )}
              </Line>
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
