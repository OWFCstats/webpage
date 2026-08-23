import ResultList from '../ResultList';
import { token } from '../../lib/tokens';

/** Cumulative-points sparkline. Two points is a line segment, not a trend, so
 *  it draws nothing below three games rather than implying a shape. */
function Sparkline({ values, stroke }) {
  if (values.length < 3) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const step = 100 / (values.length - 1);
  const points = values
    .map((v, i) => `${(i * step).toFixed(2)},${(26 - ((v - min) / span) * 22).toFixed(2)}`)
    .join(' ');
  return (
    <svg className="home-spark" viewBox="0 0 100 28" preserveAspectRatio="none" aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export default function RecentForm({ form, trend }) {
  return (
    <section className="sheet home-widget home-form">
      <div className="home-widget-head">
        <div>
          <span className="label">Momentum</span>
          <h2>Recent form</h2>
        </div>
      </div>
      <div className="home-form-body">
        <div className="home-form-main">
          {/* No separate chip strip: each row already opens with the same
              colour-coded W/D/L pill, so a chip row above it repeated the
              same five results in a smaller, less useful shape. */}
          <ResultList matches={form} emptyText="No results yet this season." />
        </div>
        {trend.length >= 3 && (
          <div className="home-form-trend">
            <Sparkline values={trend.map((t) => t.points)} stroke={token('--series-2')} />
            <p className="muted home-spark-note">Points accumulated across the season</p>
          </div>
        )}
      </div>
    </section>
  );
}
