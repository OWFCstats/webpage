import { useMemo } from 'react';
import { perGameStats, playersUsedCount } from '../../lib/matches';
import { StatTile } from '../bits';

/** One decimal place — a whole goal a game either way is a different season,
 *  a hundredth of one isn't a figure anybody reads. */
const round1 = (n) => Math.round(n * 10) / 10;

/**
 * The season's own numbers, six at a glance, ahead of every chart below —
 * each of those is one of these figures broken down further. Not a
 * `ChartCard`: there's no chart here to toggle a data table against, so this
 * borrows its heading and subtitle classes rather than its machinery.
 */
export default function SeasonPerGameTiles({ season, matches, appearances }) {
  const { stats, used } = useMemo(() => {
    const pool = matches.filter((m) => m.season === season);
    return { stats: perGameStats(pool), used: playersUsedCount(pool, appearances) };
  }, [season, matches, appearances]);

  return (
    <section className="sheet chart-card">
      <div className="head">
        <div>
          <h2>The season's own numbers</h2>
          {stats.played > 0 && (
            <p className="muted chart-sub">
              {round1(stats.scoredPerGame)} scored, {round1(stats.concededPerGame)} conceded a game.
            </p>
          )}
        </div>
      </div>
      {stats.played === 0 ? (
        <div className="empty">Not enough data yet — this fills in as matches are recorded.</div>
      ) : (
        <div className="grid cols-3">
          <StatTile value={stats.played} label="Played" />
          <StatTile value={round1(stats.scoredPerGame)} label="Scored a game" />
          <StatTile value={round1(stats.concededPerGame)} label="Conceded a game" />
          <StatTile value={stats.bothScored} label="Both teams scored" />
          <StatTile value={stats.cleanSheets} label="Clean sheets" />
          <StatTile value={used} label="Players used" />
        </div>
      )}
    </section>
  );
}
