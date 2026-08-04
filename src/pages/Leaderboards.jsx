import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ErrorNote, SeasonSelect, Spinner } from '../components/bits';
import SortableTable from '../components/SortableTable';
import BarBoard from '../components/BarBoard';
import { playerTotals, seasonsOf } from '../lib/stats';

// Club gold leads; the light-blue and orange accents appear sparingly so the
// boards stay distinguishable without turning into a colour chart.
const STATS = [
  { key: 'goals', label: 'Goals', accent: '#b8860b' },
  { key: 'assists', label: 'Assists', accent: '#5ba3c9' },
  { key: 'goalInvolvements', label: 'G+A', accent: '#e8772e' },
  { key: 'appearances', label: 'Appearances', accent: '#3f4149' },
  { key: 'motm', label: 'MOTM', accent: '#b8860b' },
  { key: 'cleanSheets', label: 'Clean sheets', accent: '#5ba3c9' },
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

      <div className="grid boards section">
        {STATS.map((s) => (
          <BarBoard
            key={s.key}
            title={s.label}
            rows={rows}
            statKey={s.key}
            accent={s.accent}
          />
        ))}
      </div>

      <div className="card section">
        <p className="muted">
          Clean sheets are credited to everyone who played in a match with no
          goals conceded. Click any column to sort.
        </p>
        <SortableTable
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
              render: (r) => r.player.position ?? '—',
            },
            { key: 'appearances', label: 'Apps', num: true },
            { key: 'starts', label: 'Starts', num: true },
            { key: 'goals', label: 'Goals', num: true },
            { key: 'assists', label: 'Assists', num: true },
            { key: 'goalInvolvements', label: 'G+A', num: true },
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
