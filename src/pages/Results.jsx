import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ErrorNote, FormBadges, SeasonSelect, Spinner, StatTile } from '../components/bits';
import SortableTable from '../components/SortableTable';
import { formatDate, formOf, playedMatches, resultOf, seasonsOf, seasonSummary } from '../lib/stats';

export default function Results() {
  const { matches, loading, error } = useData();
  const seasons = seasonsOf(matches);
  const [season, setSeason] = useState('latest');
  if (loading) return <Spinner />;
  if (error) return <ErrorNote message={error} />;

  const activeSeason = season === 'latest' ? seasons[0] : season;
  const pool = season === 'all' ? matches : matches.filter((m) => m.season === activeSeason);
  const summary = seasonSummary(pool);
  const results = playedMatches(pool);

  return (
    <div>
      <div className="section-head">
        <h1>Results & Form</h1>
        <FormBadges matches={formOf(pool)} />
      </div>
      <SeasonSelect
        seasons={seasons}
        value={season === 'latest' ? (seasons[0] ?? 'all') : season}
        onChange={setSeason}
      />
      <div className="grid cols-4">
        <StatTile value={summary.played} label="Played" />
        <StatTile value={`${summary.won}-${summary.drawn}-${summary.lost}`} label="W-D-L" />
        <StatTile value={summary.goalsFor - summary.goalsAgainst > 0 ? `+${summary.goalsFor - summary.goalsAgainst}` : summary.goalsFor - summary.goalsAgainst} label="Goal difference" />
        <StatTile
          value={summary.played ? `${Math.round((summary.won / summary.played) * 100)}%` : '—'}
          label="Win rate"
        />
      </div>

      <div className="card section">
        <SortableTable
          filterable
          rows={results}
          rowKey={(m) => m.id}
          initialSort={{ key: 'date', dir: 'desc' }}
          emptyText="No results in this season yet."
          columns={[
            { key: 'date', label: 'Date', render: (m) => formatDate(m.date) },
            {
              key: 'opponent',
              label: 'Opponent',
              render: (m) => <Link to={`/matches/${m.id}`}>{m.opponent}</Link>,
            },
            { key: 'competition', label: 'Competition', render: (m) => <span className="tag">{m.competition}</span> },
            {
              key: 'result',
              label: 'Result',
              sortValue: (m) => ({ W: 2, D: 1, L: 0 })[resultOf(m)],
              render: (m) => <span className={`result-pill ${resultOf(m)}`}>{resultOf(m)}</span>,
            },
            {
              key: 'score',
              label: 'Score',
              num: true,
              sortValue: (m) => m.goals_for - m.goals_against,
              render: (m) => <strong>{m.goals_for}–{m.goals_against}</strong>,
            },
          ]}
        />
      </div>
    </div>
  );
}
