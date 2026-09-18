import { useMemo } from 'react';
import { perGameStats, playersUsedCount } from '../../lib/matches';
import { StatTile } from '../bits';

/** Two decimal places — the mock's own precision for a per-game rate. */
const round2 = (n) => n.toFixed(2);

/**
 * The season's own numbers, six tiles ahead of everything else on the page —
 * every chart below is one of these figures broken down further. No sheet, no
 * heading, no finding sentence: the tiles are the heading (Draft D).
 */
export default function SeasonPerGameTiles({ season, matches, appearances }) {
  const { stats, used } = useMemo(() => {
    const pool = matches.filter((m) => m.season === season);
    return { stats: perGameStats(pool), used: playersUsedCount(pool, appearances) };
  }, [season, matches, appearances]);

  if (stats.played === 0) {
    return <div className="empty">Not enough data yet — this fills in as matches are recorded.</div>;
  }

  const bothScoredPct = Math.round((stats.bothScored / stats.played) * 100);

  return (
    <div className="tiles six">
      <StatTile value={stats.played} label="Played" />
      <StatTile value={round2(stats.scoredPerGame)} label="Scored / game" />
      <StatTile value={round2(stats.concededPerGame)} label="Conceded / game" />
      <StatTile value={`${bothScoredPct}%`} label="Both teams scored" />
      <StatTile value={stats.cleanSheets} label="Clean sheets" />
      <StatTile value={used} label="Players used" />
    </div>
  );
}
