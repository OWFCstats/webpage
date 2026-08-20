import { lazy, Suspense, useState } from 'react';
import { Spinner } from '../bits';

// Charts pull in Recharts (~400kB); they stay in their own chunk and load only
// when someone opens the Charts view.
const SeasonCharts = lazy(() => import('./SeasonCharts'));

export default function ChartsPanel({ season, activeSeason }) {
  const [view, setView] = useState('results');
  return (
    <div className="flat-block">
      <div className="label ruled">Charts</div>
      <div className="seg" role="tablist" aria-label="Season view">
        <button
          type="button"
          role="tab"
          aria-selected={view === 'results'}
          className={view === 'results' ? 'active' : undefined}
          onClick={() => setView('results')}
        >
          Results
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === 'charts'}
          className={view === 'charts' ? 'active' : undefined}
          onClick={() => setView('charts')}
        >
          Charts
        </button>
      </div>
      {view === 'charts' ? (
        <Suspense fallback={<Spinner />}>
          <SeasonCharts season={season} activeSeason={activeSeason} />
        </Suspense>
      ) : (
        <p className="muted" style={{ marginTop: '0.9rem' }}>
          Switch to Charts for the season trend, golden boot race and goals chart.
        </p>
      )}
    </div>
  );
}
