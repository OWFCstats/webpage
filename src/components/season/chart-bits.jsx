import { useIsNarrow } from '../../lib/useIsNarrow';
import { formatDate } from '../../lib/format';
import { fontPx, token } from '../../lib/tokens';

/**
 * The plumbing every chart on Season → Stats shares. Not in `lib/` — that
 * directory has no JSX — and not in one of the cards, because the cards are
 * peers and phases 62 to 64 add more of them.
 */

// Recharts writes these into SVG attributes, where var() is invalid, so they
// are read out of tokens.css rather than written down again here. Read at
// render rather than at module load: the stylesheet has to be applied first.
export const chartColours = () => ({
  grid: token('--rule'),
  muted: token('--ink-soft'),
  past: token('--ink-faint'),
  positive: token('--series-2'),
  negative: token('--loss'),
  dot: token('--paper'),
  win: token('--win'),
  draw: token('--draw'),
  loss: token('--loss'),
});

/**
 * The axis settings every card passes Recharts, sized once.
 *
 * 0.75rem is the type floor everywhere, charts included — a 10px axis tick was
 * the smallest type on the site. Tabular figures land in charts.css: an SVG
 * presentation attribute can't carry font-variant-numeric (Recharts drops any
 * tick style key outside its own allowlist), but a class selector can.
 */
export function useChartAxis() {
  const narrow = useIsNarrow();
  return {
    narrow,
    tick: { fontSize: fontPx('--t-micro'), fill: token('--ink-soft') },
    // 26 was sized for a 10px tick; two digits at the 0.75rem floor need 30.
    yWidth: narrow ? 30 : 36,
    // Right margin leaves room for the end-of-line series labels that replace
    // the legend — narrow screens drop the labels rather than shrink the plot.
    labelGap: (wide) => (narrow ? 12 : wide),
  };
}

/** Spreads end labels that would otherwise land on each other, by the bucket
 *  they share — a tie on the axis is what puts two labels in one place. */
export function staggerOffsets(entries, gap = 14) {
  const buckets = new Map();
  for (const { id, bucket } of entries) {
    if (!buckets.has(bucket)) buckets.set(bucket, []);
    buckets.get(bucket).push(id);
  }
  const offsets = new Map();
  for (const ids of buckets.values()) {
    ids.forEach((id, i) => offsets.set(id, (i - (ids.length - 1) / 2) * gap));
  }
  return offsets;
}

export function TooltipBox({ active, payload, label, labelKey, unit }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload ?? {};
  return (
    <div className="chart-tip">
      <div className="chart-tip-head">
        Match {label}
        {row[labelKey] && <span className="muted"> · {row[labelKey]}</span>}
        {row.date && <span className="muted"> · {formatDate(row.date)}</span>}
      </div>
      {payload.map((p) => (
        <div key={p.dataKey} className="chart-tip-row">
          <span className="chart-tip-swatch" style={{ background: p.color }} />
          <span>{p.name}</span>
          <strong>{p.value}{unit ?? ''}</strong>
        </div>
      ))}
    </div>
  );
}
