import { useState } from 'react';
import { Link } from 'react-router-dom';
import SortableTable from '../SortableTable';
import { rate } from '../../lib/format';

/**
 * Every player, every stat, in one table — the reference view the leaderboard
 * cards and the squad tiles both leave out on purpose. One wide table rather
 * than the five small ones this used to be split into: this is the one page
 * on the site built for the person who wants to see everything at once and
 * sort by any of it, not for a phone screen at arm's length, so it's also the
 * one table on the site allowed to scroll sideways — see docs/DESIGN.md →
 * Mobile for why that's a deliberate exception rather than the bug it is
 * everywhere else. The name column still sticks on a phone (`.table-wrap`'s
 * own rule), and "Columns" lets a reader drop whatever they don't want to
 * carry across with them.
 *
 * Starts isn't a column any more: every player who's picked starts, so it
 * never told anyone anything. `appearances` stays alongside `name` as the
 * two columns nobody can hide — the rest answer to the picker.
 */
const NAME_COLUMN = {
  key: 'name',
  label: 'Name',
  sortValue: (r) => r.player.name,
  render: (r) => <Link to={`/players/${r.player.id}`}>{r.player.name}</Link>,
};

const APPS_COLUMN = { key: 'appearances', label: 'Apps', num: true };

/**
 * Everything else, in the order the table reads them left to right: the raw
 * counts, then a divider (`className: 'dc-calc'`, a border rather than a
 * fourth column shape), then the calculated ones. Rates are labelled "/90"
 * for the fbref reader who expects it, but they're really per appearance —
 * the club has never recorded minutes played, and the footnote under the
 * table says so once rather than in every header.
 */
const TOGGLEABLE_COLUMNS = [
  { key: 'goals', label: 'Goals', num: true },
  { key: 'assists', label: 'Assists', num: true },
  { key: 'cleanSheets', label: 'Clean sheets', num: true },
  { key: 'yellows', label: 'Yellow', num: true },
  { key: 'reds', label: 'Red', num: true },
  { key: 'dropouts', label: 'Dropout', num: true },
  { key: 'motm', label: 'MOTM', num: true },
  { key: 'goalInvolvements', label: 'G+A', num: true, className: 'dc-calc' },
  { key: 'goalsPerGame', label: 'G/90', num: true, render: (r) => rate(r.goalsPerGame) },
  { key: 'assistsPerGame', label: 'A/90', num: true, render: (r) => rate(r.assistsPerGame) },
  { key: 'involvementsPerGame', label: 'Contributions/90', num: true, render: (r) => rate(r.involvementsPerGame) },
];

/**
 * `stat`/`onStat` from the old five-group switcher are gone — there's one
 * table now, so nothing left to switch. `scope`/`onSearchAllTime` work like
 * the squad's: `scope` names the one season the rows were filtered to (null
 * for the all-time default), and a search that finds nobody in it offers to
 * widen the search rather than send the reader to another page.
 */
export default function DataCentre({ rows, scope, onSearchAllTime }) {
  const [query, setQuery] = useState('');
  const [hidden, setHidden] = useState(() => new Set());

  if (rows.length === 0) return <div className="empty sheet">No appearances recorded yet.</div>;

  const q = query.trim().toLowerCase();
  const filtered = rows.filter((r) => !q || r.player.name.toLowerCase().includes(q));
  const columns = [NAME_COLUMN, APPS_COLUMN, ...TOGGLEABLE_COLUMNS.filter((c) => !hidden.has(c.key))];

  function toggleColumn(key) {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div>
      <div className="controls dc-controls">
        <input
          type="text"
          placeholder="Search the squad…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search players"
        />
        <details className="col-picker">
          <summary>Columns</summary>
          <div className="col-picker-panel">
            {TOGGLEABLE_COLUMNS.map((c) => (
              <label key={c.key}>
                <input
                  type="checkbox"
                  checked={!hidden.has(c.key)}
                  onChange={() => toggleColumn(c.key)}
                />
                {c.label}
              </label>
            ))}
          </div>
        </details>
      </div>

      {filtered.length === 0 ? (
        <div className="empty sheet">
          {scope ? `Nobody in ${scope} matches “${query.trim()}”.` : `Nobody matches “${query.trim()}”.`}{' '}
          {scope && onSearchAllTime && (
            <button type="button" className="more" onClick={onSearchAllTime}>
              Search all time →
            </button>
          )}
        </div>
      ) : (
        <SortableTable
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.player.id}
          initialSort={{ key: 'appearances', dir: 'desc' }}
          wrapClassName="dc-table wide-reference-table"
        />
      )}

      {/* The club's own assumption, written down once rather than implied in
          every "/90" header: there are no minutes on record, so a rate is a
          per-appearance figure wearing the label a data-nerd reader expects
          (DESIGN.md → Mobile). */}
      <p className="muted card-foot">
        Rates are shown as “/90”, assuming a full 90 minutes each appearance — the club doesn't
        record minutes played.
      </p>
    </div>
  );
}
