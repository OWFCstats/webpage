import { Link } from 'react-router-dom';
import ResultList from '../ResultList';
import { token } from '../../lib/tokens';

/* Match ResultList's own row height (44px, plus the 1px border between rows)
   so the chart lines up with the list beside it rather than guessing a
   height that only happens to fit five rows. */
const ROW_HEIGHT = 44;
const ROW_BORDER = 1;

/** Cumulative-points sparkline. Two points is a line segment, not a trend, so
 *  it draws nothing below three games rather than implying a shape. Scaled
 *  from the real range of the data — including below zero, since a walkover
 *  loss in a league game costs a 3-point deduction (`matchPoints`) rather
 *  than the routine 0 a loss otherwise would — with gridlines and value
 *  labels, since a bare line has no scale to read it against. */
function Sparkline({ values, stroke, height }) {
  if (values.length < 3) return null;
  const min = Math.min(0, ...values);
  const max = Math.max(1, ...values);
  const span = max - min;
  const mid = Math.round((min + max) / 2);
  const step = 100 / (values.length - 1);
  const points = values
    .map((v, i) => `${(i * step).toFixed(2)},${(100 - ((v - min) / span) * 100).toFixed(2)}`)
    .join(' ');
  return (
    <div className="home-spark-chart" style={{ '--matched-height': `${height}px` }}>
      <svg className="home-spark" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <line x1="0" y1="100" x2="100" y2="100" className="spark-grid" />
        <line x1="0" y1="50" x2="100" y2="50" className="spark-grid" />
        <line x1="0" y1="0" x2="100" y2="0" className="spark-grid strong" />
        <polygon className="spark-area" fill={stroke} points={`0,100 ${points} 100,100`} />
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
      <span className="spark-axis-label spark-axis-max">{max}</span>
      <span className="spark-axis-label spark-axis-mid">{mid}</span>
      <span className="spark-axis-label spark-axis-min">{min}</span>
    </div>
  );
}

export default function RecentForm({ form, trend }) {
  const chartHeight = form.length * ROW_HEIGHT + Math.max(0, form.length - 1) * ROW_BORDER;
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
            <Sparkline values={trend.map((t) => t.points)} stroke={token('--series-2')} height={chartHeight} />
            <div className="home-spark-foot">
              <p className="muted home-spark-note">Points accumulated across the season</p>
              <Link className="btn secondary" to="/season/charts">Charts</Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
