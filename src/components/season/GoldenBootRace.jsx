import { useMemo } from 'react';
import {
  CartesianGrid, Label, LabelList, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { stableColourSlots, topScorerRace } from '../../lib/charts';
import { series } from '../../lib/tokens';
import ChartCard from './ChartCard';
import ChartEndLabel from '../ChartEndLabel';
import { TooltipBox, chartColours, staggerOffsets, useChartAxis } from './chart-bits';

/** Who is leading, and by how much — a finding, not a description of the axes. */
function finding(race) {
  if (race.players.length >= 2 && race.players[0].goals === race.players[1].goals) {
    return `${race.players[0].name} and ${race.players[1].name} level on ${race.players[0].goals}.`;
  }
  if (race.players.length === 0) return null;
  const lead = race.players[0];
  const gap = race.players[1] ? lead.goals - race.players[1].goals : lead.goals;
  return `${lead.name} leads on ${lead.goals}, ${gap} clear.`;
}

/** Cumulative goals by matchday, one line a player. One season at a time: run
 *  across every season it would be a career board, and career boards are
 *  Records' (CLAUDE.md → *Sections*). */
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

  return (
    <ChartCard
      title="Golden Boot race"
      finding={finding(race)}
      empty={race.points.length < 2 || race.players.length === 0}
      table={
        <table className="data">
          <thead>
            <tr>
              <th>Match</th>
              {race.players.map((p) => <th key={p.id} className="num">{p.name}</th>)}
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
      <ResponsiveContainer>
        <LineChart data={race.points} margin={{ top: 8, right: labelGap(78), bottom: 24, left: 4 }}>
          <CartesianGrid stroke={c.grid} vertical={false} />
          <XAxis dataKey="matchday" tick={tick} axisLine={false} tickLine={false}>
            <Label value="Matchday" position="insideBottom" offset={-12} style={tick} />
          </XAxis>
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
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: c.dot }}
            >
              {!narrow && (
                <LabelList
                  dataKey={p.id}
                  content={
                    <ChartEndLabel
                      lastIndex={race.points.length - 1}
                      fill={colourFor(p.id, i)}
                      text={p.name.split(' ')[0]}
                      dy={offsets.get(p.id) ?? 0}
                    />
                  }
                />
              )}
            </Line>
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
