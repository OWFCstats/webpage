import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ErrorNote, Spinner } from '../components/bits';
import SortableTable from '../components/SortableTable';
import { fixtures, formatDate, isPlayed, playedMatches, resultOf } from '../lib/stats';

export default function Matches() {
  const { matches, loading, error } = useData();
  if (loading) return <Spinner />;
  if (error) return <ErrorNote message={error} />;

  const upcoming = fixtures(matches);
  const played = playedMatches(matches);

  return (
    <div>
      <h1>Fixtures & Results</h1>

      {upcoming.length > 0 && (
        <div className="section">
          <h2>Upcoming</h2>
          <div className="card">
            <table className="data">
              <tbody>
                {upcoming.map((m) => (
                  <tr key={m.id}>
                    <td>{formatDate(m.date)}</td>
                    <td><strong>vs {m.opponent}</strong></td>
                    <td><span className="tag orange">{m.competition}</span></td>
                    <td className="muted">{m.season}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="section">
        <h2>Results</h2>
        <div className="card">
          <SortableTable
            filterable
            rows={played}
            rowKey={(m) => m.id}
            initialSort={{ key: 'date', dir: 'desc' }}
            emptyText="No matches recorded yet."
            columns={[
              { key: 'date', label: 'Date', render: (m) => formatDate(m.date) },
              { key: 'season', label: 'Season' },
              {
                key: 'opponent',
                label: 'Opponent',
                render: (m) => <Link to={`/matches/${m.id}`}>{m.opponent}</Link>,
              },
              { key: 'competition', label: 'Competition', render: (m) => <span className="tag">{m.competition}</span> },
              {
                key: 'score',
                label: 'Score',
                num: true,
                sortValue: (m) => (isPlayed(m) ? m.goals_for - m.goals_against : null),
                render: (m) => (
                  <>
                    <span className={`result-pill ${resultOf(m)}`}>{resultOf(m)}</span>{' '}
                    <strong>{m.goals_for}–{m.goals_against}</strong>
                  </>
                ),
              },
              {
                key: 'report',
                label: 'Report',
                render: (m) => (m.report ? <Link className="more" to={`/matches/${m.id}`}>Read →</Link> : ''),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
