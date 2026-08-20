import { fontPx } from '../lib/tokens';

/**
 * Labels a series at its last real data point instead of a legend — see the
 * chart rules in docs/DESIGN.md. Shared because every Recharts line/area in
 * the site (season and career) needs the same "only the last point" check.
 */
export default function ChartEndLabel({ x, y, value, index, lastIndex, fill, text, dy = 0 }) {
  if (index !== lastIndex || value == null) return null;
  return (
    <text x={x + 8} y={y + dy} dy={4} fill={fill} fontSize={fontPx('--t-micro')} fontWeight={600}>
      {text ?? value}
    </text>
  );
}
