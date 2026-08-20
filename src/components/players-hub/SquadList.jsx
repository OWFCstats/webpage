import { useState } from 'react';
import { Link } from 'react-router-dom';
import SortableTable from '../SortableTable';
import { initials, rate } from '../../lib/format';

// The roster leads with the regulars; the long tail of one-game players
// collapses behind one honest link instead of padding the page with zeroes.
const SHOW_FIRST = 12;

/**
 * One roster row. A team sheet, not three tallies bolted to a name: the figures
 * sit in fixed columns under a single set of heads, so goals line up down the
 * page and a name can be found by its row rather than read for its labels.
 *
 * Apps first, because turning up is the thing this club is trying to reward.
 * MOTM isn't here — four figure columns leave a phone no room for a name, and
 * MOTM has a board of its own one tap away.
 */
function SquadRow({ row }) {
  const { player } = row;
  return (
    <li>
      <Link className="player-row" to={`/players/${player.id}`}>
        <span className="avatar">{initials(player.name)}</span>
        <span className="who">{player.name}</span>
        <Figure value={row.appearances} />
        <Figure value={row.goals} />
        <Figure value={row.assists} />
      </Link>
    </li>
  );
}

/** A zero is the quietest thing in the row: it's true, and it isn't the point. */
function Figure({ value }) {
  return <span className={`fig${value === 0 ? ' nil' : ''}`}>{value}</span>;
}

/**
 * The squad as a list, with the full table a tap behind it. The list is for
 * finding your own name; the table is for arguing about whose season it was.
 *
 * `scope` names the season the rows were filtered to, so a search that finds
 * nobody can say where it looked — the trap otherwise is a player who only
 * appears in an earlier season reading as a player who was never here.
 */
export default function SquadList({ rows, scope = null, emptyText = 'No appearances recorded yet.' }) {
  const [full, setFull] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const listed = rows
    .filter((r) => !q || r.player.name.toLowerCase().includes(q))
    .sort(
      (a, b) =>
        b.appearances - a.appearances ||
        b.goalInvolvements - a.goalInvolvements ||
        a.player.name.localeCompare(b.player.name),
    );
  const visible = q || showAll ? listed : listed.slice(0, SHOW_FIRST);
  const hidden = listed.length - visible.length;

  return (
    <div className="sheet">
      <div className="controls squad-controls">
        {!full && (
          <input
            type="text"
            placeholder="Search the squad…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search players"
          />
        )}
        <button type="button" className="secondary small" onClick={() => setFull((v) => !v)}>
          {full ? 'Simple list' : 'Full table'}
        </button>
      </div>

      {full ? (
        <>
          <p className="muted">
            Per-game rates count only matches actually played. “Dropouts” is the
            number of times a player was picked but withdrew within 24 hours of
            kick-off. Click any column to sort.
          </p>
          <SortableTable
            filterable
            rows={rows}
            rowKey={(r) => r.player.id}
            initialSort={{ key: 'appearances', dir: 'desc' }}
            emptyText={emptyText}
            columns={[
              {
                key: 'name',
                label: 'Player',
                sortValue: (r) => r.player.name,
                filterValue: (r) => r.player.name,
                render: (r) => <Link to={`/players/${r.player.id}`}>{r.player.name}</Link>,
              },
              { key: 'appearances', label: 'Apps', num: true },
              { key: 'starts', label: 'Starts', num: true },
              { key: 'goals', label: 'Goals', num: true },
              { key: 'assists', label: 'Assists', num: true },
              { key: 'goalInvolvements', label: 'G+A', num: true },
              { key: 'goalsPerGame', label: 'Goals/game', num: true, render: (r) => rate(r.goalsPerGame) },
              { key: 'involvementsPerGame', label: 'G+A/game', num: true, render: (r) => rate(r.involvementsPerGame) },
              { key: 'motm', label: 'MOTM', num: true },
              { key: 'cleanSheets', label: 'Clean sheets', num: true },
              { key: 'yellows', label: 'Yellows', num: true },
              { key: 'reds', label: 'Reds', num: true },
              {
                key: 'dropouts',
                label: 'Dropouts (24h)',
                num: true,
                render: (r) => (r.dropouts > 0 ? <span className="tag orange">{r.dropouts}</span> : 0),
              },
            ]}
          />
        </>
      ) : (
        <>
          {/* Heads only where there are rows under them: a labelled column over
              nothing reads as data that failed to load. */}
          {visible.length > 0 && (
            <div className="squad-head">
              <span className="label">Apps</span>
              <span className="label">G</span>
              <span className="label">A</span>
            </div>
          )}
          <ul className="player-list">
            {visible.map((r) => (
              <SquadRow key={r.player.id} row={r} />
            ))}
          </ul>
          {rows.length === 0 && <div className="empty">{emptyText}</div>}
          {rows.length > 0 && listed.length === 0 && (
            <div className="empty">
              {scope ? `Nobody in ${scope} matches “${query.trim()}”.` : `Nobody matches “${query.trim()}”.`}
              {scope && ' Switch the season to All time to search every squad.'}
            </div>
          )}
          {hidden > 0 && (
            <p className="show-all">
              <button type="button" className="secondary small" onClick={() => setShowAll(true)}>
                Show all {listed.length} players →
              </button>
            </p>
          )}
        </>
      )}
    </div>
  );
}
