import { Link } from 'react-router-dom';
import ResultList from '../ResultList';
import SortableTable from '../SortableTable';
import { formatDate } from '../../lib/format';
import { CLUB_NAME, matchHomeAway, resultOf } from '../../lib/matches';

/**
 * Every result in the season. A phone gets the list — a six-column table of
 * club names can't be read at 375px — and anything wider gets the sortable
 * table, where the point is comparing rows rather than reading one.
 */
export default function ResultsTable({ results, narrow }) {
  return (
    <div className="sheet section">
      <h2>Results</h2>
      {narrow ? (
        <ResultList matches={results} emptyText="No results in this season yet." />
      ) : (
        <SortableTable
          filterable
          rows={results}
          rowKey={(m) => m.id}
          initialSort={{ key: 'date', dir: 'desc' }}
          emptyText="No results in this season yet."
          columns={[
            { key: 'date', label: 'Date', render: (m) => formatDate(m.date) },
            {
              key: 'home',
              label: 'Home',
              sortValue: (m) => matchHomeAway(m).homeTeam,
              render: (m) => {
                const { homeTeam } = matchHomeAway(m);
                return homeTeam === CLUB_NAME
                  ? <strong>{homeTeam}</strong>
                  : <Link to={`/matchday/${m.id}`}>{homeTeam}</Link>;
              },
            },
            {
              key: 'result',
              label: 'Score',
              num: true,
              sortValue: (m) => m.goals_for - m.goals_against,
              render: (m) => {
                const { homeGoals, awayGoals } = matchHomeAway(m);
                return (
                  <>
                    <strong>{homeGoals}–{awayGoals}</strong>{' '}
                    <span className={`result-pill ${resultOf(m)}`}>{resultOf(m)}</span>
                  </>
                );
              },
            },
            {
              key: 'away',
              label: 'Away',
              sortValue: (m) => matchHomeAway(m).awayTeam,
              render: (m) => {
                const { awayTeam } = matchHomeAway(m);
                return awayTeam === CLUB_NAME
                  ? <strong>{awayTeam}</strong>
                  : <Link to={`/matchday/${m.id}`}>{awayTeam}</Link>;
              },
            },
            { key: 'competition', label: 'Competition', render: (m) => <span className="tag">{m.competition}</span> },
            {
              key: 'report',
              label: '',
              render: (m) => (m.report ? <Link className="more" to={`/matchday/${m.id}`}>Report →</Link> : ''),
            },
          ]}
        />
      )}
    </div>
  );
}
