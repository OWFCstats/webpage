import { useMemo } from 'react';
import { playedMatches, venueSummary } from '../../lib/matches';
import { plural } from '../../lib/format';

/**
 * Where the season's goals came from — home against away, as one bar. Reads
 * `venueSummary`, which already returns each side's `goalsFor`; Phase 62
 * skipped this waiting on venue actually being recorded, which Phase 56
 * closed. A neutral-ground goal counts toward neither side of the bar, so it
 * is named underneath rather than silently dropped from the total.
 */
export default function VenueGoalsSplit({ season, matches }) {
  const { home, away, neutralGoals, total } = useMemo(() => {
    const pool = matches.filter((m) => m.season === season);
    const { home, away } = venueSummary(pool);
    const neutralGoals = playedMatches(pool)
      .filter((m) => m.venue === 'N')
      .reduce((sum, m) => sum + m.goals_for, 0);
    return { home, away, neutralGoals, total: home.goalsFor + away.goalsFor };
  }, [season, matches]);

  const pct = (n) => (total ? Math.round((n / total) * 100) : 0);

  return (
    <section className="sheet">
      <span className="label ruled">Where the goals came</span>
      {total === 0 ? (
        <div className="empty">Not enough data yet — this fills in as matches are recorded.</div>
      ) : (
        <>
          <div
            className="split"
            role="img"
            aria-label={`${home.goalsFor} goals scored at home, ${away.goalsFor} away`}
          >
            <span className="a" style={{ flex: Math.max(home.goalsFor, 1) }}>
              {home.goalsFor} home ({pct(home.goalsFor)}%)
            </span>
            <span className="b" style={{ flex: Math.max(away.goalsFor, 1) }}>
              {away.goalsFor} away ({pct(away.goalsFor)}%)
            </span>
          </div>
          {neutralGoals > 0 && (
            <p className="muted card-foot">
              Plus {plural(neutralGoals, 'goal', 'goals')} on neutral ground.
            </p>
          )}
        </>
      )}
    </section>
  );
}
