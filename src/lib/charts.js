// Data shaping for the season and career charts. Nothing here draws — it
// only turns matches and appearances into the point series Recharts wants.

import { matchPoints, playedMatches, resultOf, seasonsOf } from './matches';
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
 * Match-by-match season trend (oldest first): cumulative points (W=3, D=1,
 * L=0, or -3 for a walkover loss in a league game — see `matchPoints`),
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
      cumPoints += matchPoints(m);
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

/**
 * One dot a player: games played against goals + assists, for the scatter on
 * Season → Stats. Players who share a spot are one dot with a `count`, because
 * a squad bunches — six players on two games and one goal is one dot the size
 * of six, not six dots drawn on top of each other and read as one.
 *
 * Players with no appearances are left out entirely rather than plotted at the
 * origin: "played none" is not a point on a per-game chart, and a column of
 * them at x=0 would be the biggest dot on it (the same divisor trap Phase 63
 * names for a club that has played nothing).
 *
 * Returns { rows, points, reference, above, leader } — `rows` one per player
 * for the data table, `points` the plotted dots, and `reference` how far the
 * one-a-game diagonal can be drawn before it leaves the plot.
 */
export function contributionScatter(players, matches, appearances) {
  const rows = playerTotals(players, matches, appearances)
    .filter((r) => r.appearances > 0)
    .map((r) => ({
      id: r.player.id,
      name: r.player.name,
      appearances: r.appearances,
      goals: r.goals,
      assists: r.assists,
      contributions: r.goalInvolvements,
    }))
    .sort((a, b) => b.contributions - a.contributions || b.appearances - a.appearances
      || a.name.localeCompare(b.name));

  const spots = new Map();
  for (const row of rows) {
    const key = `${row.appearances}:${row.contributions}`;
    if (!spots.has(key)) {
      spots.set(key, { key, appearances: row.appearances, contributions: row.contributions, count: 0, names: [] });
    }
    const spot = spots.get(key);
    spot.count += 1;
    spot.names.push(row.name);
  }

  const maxApps = Math.max(0, ...rows.map((r) => r.appearances));
  const maxContributions = Math.max(0, ...rows.map((r) => r.contributions));
  return {
    rows,
    points: [...spots.values()],
    // The diagonal is y = x; past whichever axis runs out first it would be
    // drawn outside the plot, so it stops there.
    reference: Math.min(maxApps, maxContributions),
    maxApps,
    maxContributions,
    above: rows.filter((r) => r.contributions >= r.appearances).length,
    leader: rows[0] ?? null,
  };
}

/**
 * How many players played how many games: one bar per game count from 1 to the
 * season's length, zeroes included so a gap in the middle of the squad is
 * visible rather than closed up.
 *
 * `core` is how many played half the season or more — the figure this chart
 * exists to give, since a club's problem is never the top of this distribution.
 */
export function appearanceSpread(players, matches, appearances) {
  const played = playedMatches(matches).length;
  const counts = playerTotals(players, matches, appearances)
    .map((r) => r.appearances)
    .filter((n) => n > 0);
  const bars = [];
  for (let games = 1; games <= played; games++) {
    bars.push({ games, players: counts.filter((n) => n === games).length });
  }
  // Half a season rounded up: on fifteen games, eight is half of it, not seven.
  const half = Math.ceil(played / 2);
  return {
    bars,
    played,
    used: counts.length,
    half,
    core: counts.filter((n) => n >= half).length,
    most: Math.max(0, ...counts),
  };
}
