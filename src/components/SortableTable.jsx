import { useMemo, useState } from 'react';

/**
 * Sortable, filterable data table.
 *
 * columns: [{ key, label, num?, sortValue?(row), render?(row), filterValue?(row) }]
 *  - num: right-align and sort numerically (descending first)
 *  - sortValue: value used for ordering (defaults to row[key])
 *  - render: cell content (defaults to row[key])
 *  - filterValue: string matched against the search box (defaults to row[key])
 * initialSort: { key, dir } — dir is 'asc' | 'desc'
 * filterable: show a text search box above the table
 */
export default function SortableTable({ columns, rows, rowKey, initialSort, filterable = false, emptyText = 'Nothing here yet.' }) {
  const [sort, setSort] = useState(initialSort ?? null);
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    let out = rows;
    const q = query.trim().toLowerCase();
    if (q) {
      out = out.filter((row) =>
        columns.some((c) => {
          const v = c.filterValue ? c.filterValue(row) : row[c.key];
          return v != null && String(v).toLowerCase().includes(q);
        }),
      );
    }
    if (sort) {
      const col = columns.find((c) => c.key === sort.key);
      if (col) {
        const val = (row) => (col.sortValue ? col.sortValue(row) : row[col.key]);
        out = out.slice().sort((a, b) => {
          const av = val(a);
          const bv = val(b);
          if (av === bv) return 0;
          if (av == null) return 1;
          if (bv == null) return -1;
          const cmp = typeof av === 'number' && typeof bv === 'number'
            ? av - bv
            : String(av).localeCompare(String(bv));
          return sort.dir === 'asc' ? cmp : -cmp;
        });
      }
    }
    return out;
  }, [rows, columns, sort, query]);

  function toggleSort(col) {
    setSort((prev) => {
      if (prev?.key !== col.key) return { key: col.key, dir: col.num ? 'desc' : 'asc' };
      return { key: col.key, dir: prev.dir === 'asc' ? 'desc' : 'asc' };
    });
  }

  return (
    <div>
      {filterable && (
        <div className="controls">
          <input
            type="text"
            placeholder="Filter…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Filter table"
          />
        </div>
      )}
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`sortable${col.num ? ' num' : ''}`}
                  onClick={() => toggleSort(col)}
                >
                  {col.label}
                  {sort?.key === col.key && (
                    <span className="arrow">{sort.dir === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={rowKey(row)}>
                {columns.map((col) => (
                  <td key={col.key} className={col.num ? 'num' : undefined}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {visible.length === 0 && <div className="empty">{emptyText}</div>}
      </div>
    </div>
  );
}
