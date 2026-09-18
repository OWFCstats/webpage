import { useState } from 'react';

/**
 * The card for a chart that hides identity behind a dot or a line and so
 * still needs its numbers spelled out somewhere: a finding as its subtitle —
 * a sentence, not a description of the axes — and the data table one press
 * away (docs/DESIGN.md → *Charts*). Phase 70 moved every card whose own
 * figures are already printed on it — the tiles, the donut, the goals split,
 * the scorelines, the margins, the division's ranked lists — off this
 * component onto a bare `.sheet`; what's left is the division (until Phase
 * 71), Points accumulated, and the three player charts.
 */
export default function ChartCard({
  title, finding, children, empty, emptyNote, table, bodyClassName,
}) {
  const [showTable, setShowTable] = useState(false);
  return (
    <section className="sheet chart-card">
      <div className="head">
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
        // The default says what fills most of these cards in. A card reading a
        // table somebody types in by hand — the division's own figures — says
        // so instead, because waiting for the next match wouldn't fix it.
        <div className="empty">
          {emptyNote ?? 'Not enough data yet — this fills in as matches are recorded.'}
        </div>
      ) : showTable ? (
        <div className="table-wrap">{table}</div>
      ) : (
        <div className={bodyClassName ? `chart-body ${bodyClassName}` : 'chart-body'}>{children}</div>
      )}
    </section>
  );
}
