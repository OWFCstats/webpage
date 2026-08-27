import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import AdminList, { AdminRow } from '../../components/AdminList';
import { formatDate } from '../../lib/format';
import { isPlayed, resultOf, seasonsOf } from '../../lib/matches';

/**
 * Every match, newest first, with its three editors on the row. A season chip
 * row rather than a Season column: the column repeated one value eighteen
 * times, and the thing an admin actually wants is one season at a time.
 */
export default function MatchesAdmin() {
  const { matches, appearances } = useData();
  const seasons = seasonsOf(matches);
  const [season, setSeason] = useState('all');

  const appCount = new Map();
  for (const a of appearances) {
    appCount.set(a.match_id, (appCount.get(a.match_id) ?? 0) + 1);
  }

  const listed = matches
    .filter((m) => season === 'all' || m.season === season)
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="section">
      <div className="section-head">
        <h2>Matches</h2>
        <Link className="btn small" to="/admin/matches/new">Create match</Link>
      </div>
      <div className="sheet">
        {seasons.length > 1 && (
          <div className="chip-row" role="group" aria-label="Season">
            <button
              type="button"
              className={`chip-btn${season === 'all' ? ' active' : ''}`}
              aria-pressed={season === 'all'}
              onClick={() => setSeason('all')}
            >
              All
            </button>
            {seasons.map((s) => (
              <button
                key={s}
                type="button"
                className={`chip-btn${season === s ? ' active' : ''}`}
                aria-pressed={season === s}
                onClick={() => setSeason(s)}
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <AdminList
          filterable
          filterLabel="Find an opponent…"
          rows={listed}
          rowKey={(m) => m.id}
          filterValue={(m) => `${m.opponent} ${m.competition} ${m.season}`}
          emptyText="No matches yet — create the first one."
        >
          {(m) => (
            <AdminRow
              lead={
                isPlayed(m) ? (
                  <span className={`result-pill ${resultOf(m)}`}>{resultOf(m)}</span>
                ) : (
                  <span className="tag orange">fix</span>
                )
              }
              title={
                <>
                  {m.opponent}
                  {isPlayed(m) && (
                    <b className="admin-row-score">{m.goals_for}–{m.goals_against}</b>
                  )}
                  {m.walkover && <span className="tag">walkover</span>}
                </>
              }
              meta={
                <>
                  {formatDate(m.date)} · {m.competition}
                  {seasons.length > 1 && season === 'all' && ` · ${m.season}`}
                  {' · '}
                  {m.walkover
                    ? 'no team sheet'
                    : isPlayed(m) && (appCount.get(m.id) ?? 0) === 0
                      ? 'no lineup yet'
                      : `${appCount.get(m.id) ?? 0} players`}
                </>
              }
              actions={
                <>
                  <Link className="btn secondary small" to={`/admin/matches/${m.id}`}>Edit</Link>
                  <Link className="btn secondary small" to={`/admin/matches/${m.id}/lineup`}>Lineup</Link>
                  <Link className="btn secondary small" to={`/admin/matches/${m.id}/report`}>Report</Link>
                </>
              }
            />
          )}
        </AdminList>
      </div>
    </div>
  );
}
