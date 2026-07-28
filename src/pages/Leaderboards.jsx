import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ErrorNote, SeasonSelect, Spinner } from '../components/bits';
import SortableTable from '../components/SortableTable';
import { playerTotals, seasonsOf } from '../lib/stats';

const STATS = [
  { key: 'goals', label: 'Goals' },
  { key: 'assists', label: 'Assists' },
  { key: 'appearances', label: 'Appearances' },
  { key: 'motm', label: 'MOTM' },
  { key: 'cleanSheets', label: 'Clean sheets' },
];

export default function Leaderboards() {
  const { players, matches, appearances, loading, error } = useData();
  const [params, setParams] = useSearchParams();
  const [season, setSeason] = useState('all');
  const stat = STATS.some((s) => s.key === params.get('stat')) ? params.get('stat') : 'goals';

  if (loading) return <Spinner />;
  if (error) return <ErrorNote message={error} />;

  const seasons = seasonsOf(matches);
  const pool = season === 'all' ? matches : matches.filter((m) => m.season === season);
  const rows = playerTotals(players, pool, appearances).filter((r) => r.appearances > 0);

  return (
    <div>
      <h1>Leaderboards</h1>
      <div className="controls">
        {STATS.map((s) => (
          <button
            key={s.key}
            className={`small ${stat === s.key ? '' : 'secondary'}`}
            onClick={() => setParams({ stat: s.key })}
          >
            {s.label}
          </button>
        ))}
      </div>
      <SeasonSelect seasons={seasons} value={season} onChange={setSeason} />
      <div className="card">
        <p className="muted">
          Clean sheets are credited to goalkeepers and defenders who appeared in a
          match with no goals conceded. Click any column to sort.
        </p>
        <SortableTable
          key={stat}
          filterable
          rows={rows}
          rowKey={(r) => r.player.id}
          initialSort={{ key: stat, dir: 'desc' }}
          emptyText="No appearances recorded for this season yet."
          columns={[
            {
              key: 'name',
              label: 'Player',
              sortValue: (r) => r.player.name,
              filterValue: (r) => r.player.name,
              render: (r) => <Link to={`/players/${r.player.id}`}>{r.player.name}</Link>,
            },
            {
              key: 'position',
              label: 'Pos',
              sortValue: (r) => r.player.position,
              filterValue: (r) => r.player.position,
              render: (r) => r.player.position,
            },
            { key: 'appearances', label: 'Apps', num: true },
            { key: 'starts', label: 'Starts', num: true },
            { key: 'goals', label: 'Goals', num: true },
            { key: 'assists', label: 'Assists', num: true },
            { key: 'motm', label: 'MOTM', num: true },
            { key: 'cleanSheets', label: 'Clean sheets', num: true },
            { key: 'yellows', label: 'Yellows', num: true },
            { key: 'reds', label: 'Reds', num: true },
          ]}
        />
      </div>
    </div>
  );
}
