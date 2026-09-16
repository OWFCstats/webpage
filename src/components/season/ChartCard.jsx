import { useState } from 'react';

/**
 * The card every chart on Season → Stats sits in: a finding as its subtitle —
 * a sentence, not a description of the axes — and the data table one press
 * away (docs/DESIGN.md → *Charts*).
 *
 * Its own file rather than a helper inside the page, because the merged Stats
 * page is a stack of these and phases 62 to 64 each add more.
 */
export default function ChartCard({ title, finding, children, empty, table }) {
  const [showTable, setShowTable] = useState(false);
  return (
    <section className="sheet chart-card">
      <div className="chart-head">
        <div>
          <h2>{title}</h2>
          {finding && <p className="muted chart-sub">{finding}</p>}
        </div>
        {!empty && table && (
          <button type="button" className="secondary small" onClick={() => setShowTable((v) => !v)}>
            {showTable ? 'Show chart' : 'Show data'}
          </button>
        )}
      </div>
      {empty ? (
        <div className="empty">Not enough data yet — this fills in as matches are recorded.</div>
      ) : showTable ? (
        <div className="table-wrap">{table}</div>
      ) : (
        <div className="chart-body">{children}</div>
      )}
    </section>
  );
}
