import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import SortableTable from '../../components/SortableTable';
import { formatDate, isPlayed, resultOf } from '../../lib/stats';

export default function MatchesAdmin() {
  const { matches, appearances } = useData();
  const appCount = new Map();
  for (const a of appearances) {
    appCount.set(a.match_id, (appCount.get(a.match_id) ?? 0) + 1);
  }

  return (
    <div className="section">
      <div className="section-head">
        <h2>Matches</h2>
        <Link className="btn small" to="/admin/matches/new">Create match</Link>
      </div>
      <div className="sheet">
        <SortableTable
          filterable
          rows={matches}
          rowKey={(m) => m.id}
          initialSort={{ key: 'date', dir: 'desc' }}
          emptyText="No matches yet — create the first one."
          columns={[
            { key: 'date', label: 'Date', render: (m) => formatDate(m.date) },
            { key: 'season', label: 'Season' },
            { key: 'opponent', label: 'Opponent' },
            { key: 'competition', label: 'Competition' },
            {
              key: 'score',
              label: 'Score',
              sortValue: (m) => (isPlayed(m) ? m.goals_for - m.goals_against : null),
              render: (m) =>
                isPlayed(m) ? (
                  <>
                    <span className={`result-pill ${resultOf(m)}`}>{resultOf(m)}</span>{' '}
                    {m.goals_for}–{m.goals_against}
                    {m.walkover && <> <span className="tag">walkover</span></>}
                  </>
                ) : (
                  <span className="tag orange">fixture</span>
                ),
            },
            {
              key: 'lineup',
              label: 'Lineup',
              num: true,
              sortValue: (m) => appCount.get(m.id) ?? 0,
              render: (m) => (m.walkover ? '— (walkover)' : `${appCount.get(m.id) ?? 0} players`),
            },
            {
              key: 'actions',
              label: '',
              render: (m) => (
                <span className="controls" style={{ marginBottom: 0 }}>
                  <Link className="btn secondary small" to={`/admin/matches/${m.id}`}>Edit</Link>
                  <Link className="btn secondary small" to={`/admin/matches/${m.id}/lineup`}>Lineup & stats</Link>
                  <Link className="btn secondary small" to={`/admin/matches/${m.id}/report`}>Report</Link>
                </span>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
