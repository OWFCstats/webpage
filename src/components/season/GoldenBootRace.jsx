import { useMemo } from 'react';
import {
  CartesianGrid, LabelList, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { stableColourSlots, topScorerRace } from '../../lib/charts';
import { dayMonth, surname } from '../../lib/format';
import { series } from '../../lib/tokens';
import ChartEndLabel from '../ChartEndLabel';
import { ChartSheet, TooltipBox, chartColours, staggerOffsets, useChartAxis } from './chart-bits';

/** The mark at the end of a line — nothing at the points before it. */
function EndDot({ cx, cy, index, lastIndex, stroke, ring }) {
  if (index !== lastIndex || cx == null || cy == null) return null;
  return <circle cx={cx} cy={cy} r={4} fill={stroke} stroke={ring} strokeWidth={2} />;
}

/** Cumulative goals by matchday, one line a player. The one chart on the site
 *  that draws from the five-series palette, because it is the one chart whose
 *  lines label themselves (docs/DESIGN.md → *Chart series*).
 *
 *  One season at a time: run across every season it would be a career board,
 *  and career boards are Records' (CLAUDE.md → *Sections*). */
export default function GoldenBootRace({ season, players, matches, appearances }) {
  const c = chartColours();
  const { narrow, tick, yWidth, labelGap } = useChartAxis();

  // Keyed on player identity across all seasons, so changing the season filter
  // never repaints the players who remain.
  const colourSlots = useMemo(
    () => stableColourSlots(players, matches, appearances),
    [players, matches, appearances],
  );

  const { race, offsets } = useMemo(() => {
    const race = topScorerRace(players, matches.filter((m) => m.season === season), appearances);
    return {
      race,
      offsets: staggerOffsets(race.players.map((p) => ({ id: p.id, bucket: p.goals })), 15),
    };
  }, [season, players, matches, appearances]);

  const colourFor = (playerId, fallbackIndex) => series(colourSlots.get(playerId) ?? fallbackIndex);

  // Five dates evenly across the season, ends included — the mock's own axis.
  // A tick a match is sixteen dates on one line; letting Recharts thin them
  // keeps whichever it drops arbitrary, and the first and last game are the two
  // the reader is placing everything else between.
  const ticks = useMemo(() => {
    const n = race.points.length;
    if (n === 0) return undefined;
    if (n <= 5) return race.points.map((p) => p.matchday);
    return [0, 1, 2, 3, 4].map((i) => race.points[Math.round((i * (n - 1)) / 4)].matchday);
  }, [race]);

  // `wideTable`: one column a tracked scorer, so the width of that table is
  // data rather than design — five surnames is 420px at 375 and no header can
  // be shortened, because the headers are people. It is the second and last
  // table on the site allowed a scrollbar (DESIGN.md → *Mobile*).
  return (
    <ChartSheet
      label="Cumulative goals, matchday by matchday"
      title="The golden boot race"
      empty={race.points.length < 2 || race.players.length === 0}
      wideTable
      table={
        <table className="data">
          <thead>
            <tr>
              <th>#</th>
              {/* Surnames, the same as the line labels: five full names is a
                  table a phone can only side-scroll. */}
              {race.players.map((p) => <th key={p.id} className="num">{surname(p.name)}</th>)}
            </tr>
          </thead>
          <tbody>
            {race.points.map((row) => (
              <tr key={row.matchday}>
                <td>{row.matchday}</td>
                {race.players.map((p) => <td key={p.id} className="num">{row[p.id]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      }
    >
      {/* Draft D carries a legend above the plot as well as the end labels, and
          the site drops end labels below 700px — so on a phone this is the only
          thing naming a line, which is why it is drawn at both widths rather
          than swapped in for the labels it duplicates. */}
      <ul className="legend">
        {race.players.map((p, i) => (
          <li key={p.id}>
            <i style={{ background: colourFor(p.id, i) }} aria-hidden="true" />
            {p.name}
          </li>
        ))}
      </ul>
      <div className="chart-plot">
        <ResponsiveContainer>
          <LineChart data={race.points} margin={{ top: 8, right: labelGap(88), bottom: 4, left: 4 }}>
            <CartesianGrid stroke={c.grid} vertical={false} />
            {/* Dates, not matchday numbers, and so no axis caption to say which:
                a race is read against when it happened — "he scored four in
                September" — and "matchday 11" is a number the reader has to
                translate first. Keyed on matchday still, so the tooltip and the
                data table below both stay a match count. */}
            <XAxis
              dataKey="matchday"
              tickFormatter={(md) => dayMonth(race.points[md - 1]?.date)}
              ticks={ticks}
              interval="preserveStartEnd"
              tick={tick}
              axisLine={false}
              tickLine={false}
            />
            <YAxis allowDecimals={false} tick={tick} axisLine={false} tickLine={false} width={yWidth} />
            <Tooltip content={<TooltipBox labelKey="label" unit=" goals" />} />
            {race.players.map((p, i) => (
              <Line
                key={p.id}
                type="linear"
                dataKey={p.id}
                name={p.name}
                stroke={colourFor(p.id, i)}
                strokeWidth={2}
                // A dot where the line stops, as the mock draws it. It is the
                // only mark on a phone, where the end labels come off and two
                // players finishing level are two lines ending on one pixel.
                dot={<EndDot lastIndex={race.points.length - 1} ring={c.dot} />}
                activeDot={{ r: 4, strokeWidth: 2, stroke: c.dot }}
              >
                {!narrow && (
                  <LabelList
                    dataKey={p.id}
                    content={
                      <ChartEndLabel
                        lastIndex={race.points.length - 1}
                        fill={colourFor(p.id, i)}
                        // Surname and total, as the mock draws it: the legend
                        // beside it already carries the full name, so what the
                        // end of a line still has to say is where it finished.
                        text={`${surname(p.name)} ${p.goals}`}
                        dy={offsets.get(p.id) ?? 0}
                      />
                    }
                  />
                )}
              </Line>
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartSheet>
  );
}
