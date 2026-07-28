import { useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useData } from '../context/DataContext';
import { ErrorNote, SeasonSelect, Spinner } from '../components/bits';
import { formatDate, seasonsOf, seasonTrend, topScorerRace } from '../lib/stats';

const LINE_COLOURS = ['#b8860b', '#16171b', '#5ba3c9', '#e8772e', '#3d9a5f'];

function ChartCard({ title, children, empty }) {
  return (
    <div className="section card">
      <h2>{title}</h2>
      {empty ? <div className="empty">Not enough data yet.</div> : (
        <div style={{ width: '100%', height: 320 }}>{children}</div>
      )}
    </div>
  );
}

export default function Trends() {
  const { players, matches, appearances, loading, error } = useData();
  const seasons = seasonsOf(matches);
  const [season, setSeason] = useState('latest');
  if (loading) return <Spinner />;
  if (error) return <ErrorNote message={error} />;

  const activeSeason = season === 'latest' ? seasons[0] : season;
  const pool = season === 'all' ? matches : matches.filter((m) => m.season === activeSeason);
  const trend = seasonTrend(pool);
  const race = topScorerRace(players, pool, appearances);

  const axisProps = {
    dataKey: 'date',
    tickFormatter: (d) => formatDate(d).replace(/ \d{4}$/, ''),
    tick: { fontSize: 12 },
  };

  return (
    <div>
      <h1>Trends</h1>
      <SeasonSelect
        seasons={seasons}
        value={season === 'latest' ? (seasons[0] ?? 'all') : season}
        onChange={setSeason}
      />

      <ChartCard title="Points accumulated" empty={trend.length < 2}>
        <ResponsiveContainer>
          <LineChart data={trend} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="#e6e4dc" strokeDasharray="3 3" />
            <XAxis {...axisProps} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip
              labelFormatter={(d, payload) =>
                `${formatDate(d)} ${payload?.[0]?.payload?.label ?? ''}`
              }
            />
            <Line
              type="monotone"
              dataKey="points"
              name="Points (W=3, D=1)"
              stroke="#b8860b"
              strokeWidth={2.5}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Goals for and against, match by match" empty={trend.length < 2}>
        <ResponsiveContainer>
          <LineChart data={trend} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="#e6e4dc" strokeDasharray="3 3" />
            <XAxis {...axisProps} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip
              labelFormatter={(d, payload) =>
                `${formatDate(d)} ${payload?.[0]?.payload?.label ?? ''}`
              }
            />
            <Legend />
            <Line type="monotone" dataKey="goalsFor" name="Scored" stroke="#3d9a5f" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="goalsAgainst" name="Conceded" stroke="#c9463d" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Top scorer race" empty={race.points.length < 2 || race.players.length === 0}>
        <ResponsiveContainer>
          <LineChart data={race.points} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="#e6e4dc" strokeDasharray="3 3" />
            <XAxis {...axisProps} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip
              labelFormatter={(d, payload) =>
                `${formatDate(d)} ${payload?.[0]?.payload?.label ?? ''}`
              }
            />
            <Legend />
            {race.players.map((p, i) => (
              <Line
                key={p.id}
                type="stepAfter"
                dataKey={p.id}
                name={p.name}
                stroke={LINE_COLOURS[i % LINE_COLOURS.length]}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
