// Data shaping for the season and career charts. Nothing here draws — it
// only turns matches and appearances into the point series Recharts wants.

import { playedMatches, resultOf, seasonsOf } from './matches';
import { playerTotals } from './players';

/**
 * Cumulative goals per match date for the top `limit` scorers over the given
 * matches — data for the "top scorer race" chart. Returns
 * { players: [{id, name}], points: [{date, label, [playerId]: cumGoals}] }.
 */
export function topScorerRace(players, matches, appearances, limit = 5) {
  const totals = playerTotals(players, matches, appearances)
    .filter((r) => r.goals > 0)
    .sort((a, b) => b.goals - a.goals)
    .slice(0, limit);
  const trackedIds = totals.map((r) => r.player.id);
  // Set, not Array.includes: this is checked once per appearance row, so a
  // linear scan here makes the whole build quadratic in squad size.
  const tracked = new Set(trackedIds);
  const played = playedMatches(matches).slice().reverse(); // oldest first
  const running = Object.fromEntries(trackedIds.map((id) => [id, 0]));
  const appsByMatch = new Map();
  for (const app of appearances) {
    if (!tracked.has(app.player_id)) continue;
    if (!appsByMatch.has(app.match_id)) appsByMatch.set(app.match_id, []);
    appsByMatch.get(app.match_id).push(app);
  }
  const points = played.map((m, i) => {
    for (const app of appsByMatch.get(m.id) ?? []) {
      running[app.player_id] += app.goals;
    }
    return { matchday: i + 1, date: m.date, label: `vs ${m.opponent}`, ...running };
  });
  return {
    players: totals.map((r) => ({ id: r.player.id, name: r.player.name, goals: r.goals })),
    points,
  };
}

/**
 * Stable colour slots keyed on player identity, derived from all-time goals so
 * that changing the season filter never repaints the players who remain.
 */
export function stableColourSlots(players, matches, appearances) {
  const ranked = playerTotals(players, matches, appearances)
    .slice()
    .sort((a, b) => b.goals - a.goals || a.player.name.localeCompare(b.player.name));
  return new Map(ranked.map((r, i) => [r.player.id, i]));
}

/**
 * Match-by-match season trend (oldest first): cumulative points (W=3 D=1),
 * goals for/against per game, and running goal difference. `matchday` is the
 * 1-based game number within the supplied set, so separate seasons can be
 * overlaid on a common x-axis.
 */
export function seasonTrend(matches) {
  let cumPoints = 0;
  let cumGD = 0;
  return playedMatches(matches)
    .slice()
    .reverse()
    .map((m, i) => {
      const r = resultOf(m);
      cumPoints += r === 'W' ? 3 : r === 'D' ? 1 : 0;
      const gd = m.goals_for - m.goals_against;
      cumGD += gd;
      return {
        matchday: i + 1,
        date: m.date,
        label: `vs ${m.opponent}`,
        result: r,
        points: cumPoints,
        goalsFor: m.goals_for,
        goalsAgainst: m.goals_against,
        goalDifference: gd,
        cumulativeGD: cumGD,
      };
    });
}

/** The last row in `points` where `key` is present — a season's line can end
 *  before the shared axis does, so "last point" isn't just `points.length - 1`. */
export function lastDefinedIndex(points, key) {
  for (let i = points.length - 1; i >= 0; i--) {
    if (points[i][key] != null) return i;
  }
  return -1;
}

/**
 * Cumulative points for every season on a shared matchday axis, for overlaying
 * past seasons behind the current one. Returns
 * { seasons: ['2025/26', …] (newest first), points: [{ matchday, [season]: pts }] }.
 *
 * League matches only — points accumulated is a league-table concept, so cup
 * and friendly games don't move this trend (they still count everywhere else:
 * leaderboards, goals, appearances, etc). The comparison is case/whitespace
 * insensitive since `competition` is free text entered by hand.
 */
export function seasonPointsComparison(matches) {
  const leagueMatches = matches.filter((m) => m.competition?.trim().toLowerCase() === 'league');
  const seasons = seasonsOf(leagueMatches);
  const bySeason = seasons.map((s) => ({
    season: s,
    trend: seasonTrend(leagueMatches.filter((m) => m.season === s)),
  }));
  const longest = Math.max(0, ...bySeason.map((s) => s.trend.length));
  const points = [];
  for (let i = 0; i < longest; i++) {
    const row = { matchday: i + 1 };
    for (const { season, trend } of bySeason) {
      // Leave the key absent past a season's final game so its line simply ends.
      if (i < trend.length) {
        row[season] = trend[i].points;
        row[`${season}__label`] = trend[i].label;
      }
    }
    points.push(row);
  }
  return { seasons, points };
}
