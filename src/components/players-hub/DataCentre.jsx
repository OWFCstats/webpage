import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import SortableTable from '../SortableTable';
import { rate } from '../../lib/format';

/**
 * Every stat lives in one of five groups rather than one wide table, because
 * a name column plus thirteen stat columns has no width left to give on a
 * 320px phone — the league table needs 303px for ten narrow numbers and a
 * short club name; a player's name is longer and there are more columns here,
 * not fewer. Each group stays to two or three, the same budget the squad list
 * gives its own three figures beside a name.
 *
 * The group is a real address (`?stat=`), not component state, for the same
 * reason the squad's `layout` is: a view the harness never visits is a view
 * where a clipped name hides, and every group renders the same name column
 * that's the one at risk.
 */
export const STAT_GROUPS = [
  {
    id: 'playing',
    label: 'Playing time',
    columns: [
      { key: 'appearances', label: 'Apps', num: true },
      { key: 'starts', label: 'Starts', num: true },
      { key: 'dropouts', label: 'Dropouts', num: true },
    ],
  },
  {
    id: 'attacking',
    label: 'Attacking',
    columns: [
      { key: 'goals', label: 'Goals', num: true },
      { key: 'assists', label: 'Assists', num: true },
      { key: 'goalInvolvements', label: 'G+A', num: true },
    ],
  },
  {
    id: 'discipline',
    label: 'Discipline',
    columns: [
      { key: 'yellows', label: 'Yellows', num: true },
      { key: 'reds', label: 'Reds', num: true },
    ],
  },
  {
    id: 'honours',
    label: 'Team & honours',
    columns: [
      { key: 'motm', label: 'MOTM', num: true },
      { key: 'cleanSheets', label: 'Clean sheets', num: true },
    ],
  },
  {
    id: 'rates',
    label: 'Per appearance',
    columns: [
      { key: 'goalsPerGame', label: 'G/app', num: true, render: (r) => rate(r.goalsPerGame) },
      { key: 'assistsPerGame', label: 'A/app', num: true, render: (r) => rate(r.assistsPerGame) },
      { key: 'involvementsPerGame', label: 'G+A/app', num: true, render: (r) => rate(r.involvementsPerGame) },
    ],
  },
];

const NAME_COLUMN = {
  key: 'name',
  label: 'Name',
  sortValue: (r) => r.player.name,
  render: (r) => <Link to={`/players/${r.player.id}`}>{r.player.name}</Link>,
};

/**
 * Every player, every stat — the reference table the leaderboard cards and
 * the squad tiles both leave out. `stat`/`onStat` work exactly like the
 * squad's `layout`/`onLayout`: the caller owns the address, this component
 * just reads and requests it.
 */
export default function DataCentre({ rows, scope, stat, onStat }) {
  const [query, setQuery] = useState('');
  const selectId = useId();
  const group = STAT_GROUPS.find((g) => g.id === stat) ?? STAT_GROUPS[0];

  if (rows.length === 0) return <div className="empty sheet">No appearances recorded yet.</div>;

  const q = query.trim().toLowerCase();
  const filtered = rows.filter((r) => !q || r.player.name.toLowerCase().includes(q));

  return (
    <div>
      <div className="controls">
        <input
          type="text"
          placeholder="Search the squad…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search players"
        />
        <label htmlFor={selectId}>Stats</label>
        <select id={selectId} value={group.id} onChange={(e) => onStat(e.target.value)}>
          {STAT_GROUPS.map((g) => (
            <option key={g.id} value={g.id}>{g.label}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty sheet">
          {scope ? `Nobody in ${scope} matches “${query.trim()}”.` : `Nobody matches “${query.trim()}”.`}
        </div>
      ) : (
        <div className="dc-table">
          <SortableTable
            columns={[NAME_COLUMN, ...group.columns]}
            rows={filtered}
            rowKey={(r) => r.player.id}
            initialSort={{ key: group.columns[0].key, dir: 'desc' }}
          />
        </div>
      )}

      {/* The club's own assumption, written down once rather than implied —
          per appearance, not per 90, because minutes would be 11-16 more
          numbers typed per match on a phone in a pub (DESIGN.md → Mobile). */}
      <p className="muted card-foot">
        Figures are per appearance, not per 90 — the club doesn't record minutes played.
      </p>
    </div>
  );
}
