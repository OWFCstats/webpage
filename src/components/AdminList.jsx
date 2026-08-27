import { useMemo, useState } from 'react';

/**
 * The write side's list: a row per record, with its actions on the row.
 *
 * Three admin pages used `SortableTable` for this and all three hid columns on
 * a phone — the match list hid 484px of its 738px at 375px, which took every
 * one of its action buttons off screen and left the lineup editor unreachable
 * from the only page that links to it. A table can't carry three buttons and
 * four columns in 375px, and `docs/DESIGN.md` → *Mobile* says what to do about
 * that: restructure into rows rather than hide columns. This is that shape,
 * shared because all three pages need it.
 *
 * What a row is made of is the caller's business; the frame, the filter box
 * and the empty state are this component's.
 */
export default function AdminList({
  rows,
  rowKey,
  filterValue,
  filterable = false,
  filterLabel = 'Filter…',
  emptyText = 'Nothing here yet.',
  children,
}) {
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !filterValue) return rows;
    return rows.filter((row) => String(filterValue(row) ?? '').toLowerCase().includes(q));
  }, [rows, query, filterValue]);

  return (
    <div>
      {filterable && (
        <div className="controls">
          <input
            type="text"
            placeholder={filterLabel}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={filterLabel}
          />
        </div>
      )}
      {visible.length === 0 ? (
        <div className="empty">{query.trim() ? 'Nothing matches that.' : emptyText}</div>
      ) : (
        <ul className="admin-list">
          {visible.map((row) => (
            <li key={rowKey(row)}>{children(row)}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * One record: an optional mark, what it is, what's true about it, and what can
 * be done to it. The actions drop to their own full-width line below 700px,
 * which is the whole reason this exists rather than a table cell.
 */
export function AdminRow({ lead, title, meta, actions }) {
  return (
    <div className="admin-row">
      {lead && <span className="admin-row-lead">{lead}</span>}
      <span className="admin-row-body">
        <span className="admin-row-title">{title}</span>
        {meta && <span className="admin-row-meta">{meta}</span>}
      </span>
      {actions && <span className="admin-row-actions">{actions}</span>}
    </div>
  );
}
