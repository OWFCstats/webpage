import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ErrorNote, SeasonSelect, Spinner } from '../components/bits';
import SortableTable from '../components/SortableTable';
import { playerTotals, rate, seasonsOf } from '../lib/stats';

export default function InDepth() {
  const { players, matches, appearances, loading, error } = useData();
  const [season, setSeason] = useState('all');
  if (loading) return <Spinner />;
  if (error) return <ErrorNote message={error} />;

  const seasons = seasonsOf(matches);
  const pool = season === 'all' ? matches : matches.filter((m) => m.season === season);
  const rows = playerTotals(players, pool, appearances).filter(
    (r) => r.appearances > 0 || r.dropouts > 0,
  );

  return (
    <div>
      <h1>In-Depth Stats</h1>
      <p className="muted">
        Per-game rates count only matches actually played. “Dropouts” is the
        number of times a player was picked but withdrew within 24 hours of
        kick-off. Click any column to sort.
      </p>
      <SeasonSelect seasons={seasons} value={season} onChange={setSeason} />
      <div className="card">
        <SortableTable
          filterable
          rows={rows}
          rowKey={(r) => r.player.id}
          initialSort={{ key: 'goalInvolvements', dir: 'desc' }}
          emptyText="No appearances recorded for this season yet."
          columns={[
            {
              key: 'name',
              label: 'Player',
              sortValue: (r) => r.player.name,
              filterValue: (r) => r.player.name,
              render: (r) => <Link to={`/players/${r.player.id}`}>{r.player.name}</Link>,
            },
            { key: 'appearances', label: 'Apps', num: true },
            { key: 'goals', label: 'Goals', num: true },
            { key: 'assists', label: 'Assists', num: true },
            { key: 'goalInvolvements', label: 'G+A', num: true },
            {
              key: 'goalsPerGame',
              label: 'Goals/game',
              num: true,
              render: (r) => rate(r.goalsPerGame),
            },
            {
              key: 'assistsPerGame',
              label: 'Assists/game',
              num: true,
              render: (r) => rate(r.assistsPerGame),
            },
            {
              key: 'involvementsPerGame',
              label: 'G+A/game',
              num: true,
              render: (r) => rate(r.involvementsPerGame),
            },
            { key: 'motm', label: 'MOTM', num: true },
            { key: 'cleanSheets', label: 'Clean sheets', num: true },
            {
              key: 'dropouts',
              label: 'Dropouts (24h)',
              num: true,
              render: (r) => (r.dropouts > 0 ? <span className="tag orange">{r.dropouts}</span> : 0),
            },
          ]}
        />
      </div>
    </div>
  );
}
