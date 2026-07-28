import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ErrorNote, Spinner } from '../components/bits';
import SortableTable from '../components/SortableTable';
import { playerTotals } from '../lib/stats';

export default function Players() {
  const { players, matches, appearances, loading, error } = useData();
  if (loading) return <Spinner />;
  if (error) return <ErrorNote message={error} />;

  const rows = playerTotals(players, matches, appearances);

  return (
    <div>
      <h1>Players</h1>
      <div className="card">
        <SortableTable
          filterable
          rows={rows}
          rowKey={(r) => r.player.id}
          initialSort={{ key: 'name', dir: 'asc' }}
          emptyText="No players yet."
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
            {
              key: 'status',
              label: 'Status',
              sortValue: (r) => r.player.status,
              filterValue: (r) => r.player.status,
              render: (r) =>
                r.player.status === 'active' ? <span className="tag">active</span> : <span className="muted">inactive</span>,
            },
            { key: 'appearances', label: 'Apps', num: true },
            { key: 'goals', label: 'Goals', num: true },
            { key: 'assists', label: 'Assists', num: true },
            { key: 'motm', label: 'MOTM', num: true },
          ]}
        />
      </div>
    </div>
  );
}
