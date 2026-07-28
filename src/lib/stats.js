// All derived statistics. Raw rows come from Supabase; nothing here is stored.
// Clean sheets are team-wide: every player who appeared in a match with zero
// conceded gets one (positions are fluid at this level, so no GK/DEF gating).
// Appearance rows flagged `dropout` (withdrew <24h before kick-off) are
// excluded from every stat and counted separately.

export function isPlayed(match) {
  return match.goals_for != null && match.goals_against != null;
}

export function resultOf(match) {
  if (match.result) return match.result;
  if (!isPlayed(match)) return null;
  if (match.goals_for > match.goals_against) return 'W';
  if (match.goals_for < match.goals_against) return 'L';
  return 'D';
}

export function seasonsOf(matches) {
  return [...new Set(matches.map((m) => m.season))].sort().reverse();
}

/** Matches sorted newest-first that have a final score. */
export function playedMatches(matches) {
  return matches
    .filter(isPlayed)
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** Upcoming fixtures (no score yet), soonest first. */
export function fixtures(matches) {
  return matches
    .filter((m) => !isPlayed(m))
    .slice()
    .sort((a, b) => (a.date > b.date ? 1 : -1));
}

/** Last n results, most recent first. */
export function formOf(matches, n = 5) {
  return playedMatches(matches).slice(0, n);
}

export function seasonSummary(matches) {
  const played = matches.filter(isPlayed);
  const sum = { played: played.length, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 };
  for (const m of played) {
    const r = resultOf(m);
    if (r === 'W') sum.won += 1;
    else if (r === 'D') sum.drawn += 1;
    else if (r === 'L') sum.lost += 1;
    sum.goalsFor += m.goals_for;
    sum.goalsAgainst += m.goals_against;
  }
  return sum;
}

function isCleanSheet(match) {
  return isPlayed(match) && match.goals_against === 0;
}

/**
 * Per-player aggregate over the given matches (already season-filtered by the
 * caller if needed). Returns one row per player who exists, including players
 * with no appearances yet.
 */
export function playerTotals(players, matches, appearances) {
  const matchById = new Map(matches.map((m) => [m.id, m]));
  const rows = new Map(
    players.map((p) => [
      p.id,
      {
        player: p,
        appearances: 0,
        starts: 0,
        goals: 0,
        assists: 0,
        yellows: 0,
        reds: 0,
        motm: 0,
        cleanSheets: 0,
        dropouts: 0,
      },
    ]),
  );
  for (const app of appearances) {
    const match = matchById.get(app.match_id);
    const row = rows.get(app.player_id);
    if (!match || !row) continue;
    if (app.dropout) {
      row.dropouts += 1;
      continue;
    }
    if (!isPlayed(match)) continue;
    row.appearances += 1;
    if (app.started) row.starts += 1;
    row.goals += app.goals;
    row.assists += app.assists;
    row.yellows += app.yellows;
    row.reds += app.reds;
    if (app.motm) row.motm += 1;
    if (isCleanSheet(match)) row.cleanSheets += 1;
  }
  const out = [...rows.values()];
  for (const row of out) {
    row.goalInvolvements = row.goals + row.assists;
    row.goalsPerGame = row.appearances ? row.goals / row.appearances : 0;
    row.assistsPerGame = row.appearances ? row.assists / row.appearances : 0;
    row.involvementsPerGame = row.appearances ? row.goalInvolvements / row.appearances : 0;
  }
  return out;
}

/** Format a per-game rate to 2 decimal places for display. */
export function rate(value) {
  return value.toFixed(2);
}

/** Per-season breakdown for a single player, newest season first. */
export function playerSeasonBreakdown(player, matches, appearances) {
  const mine = appearances.filter((a) => a.player_id === player.id);
  const bySeason = new Map();
  const matchById = new Map(matches.map((m) => [m.id, m]));
  for (const app of mine) {
    const match = matchById.get(app.match_id);
    if (!match || !isPlayed(match)) continue;
    if (!bySeason.has(match.season)) bySeason.set(match.season, { matches: [], apps: [] });
    const bucket = bySeason.get(match.season);
    bucket.matches.push(match);
    bucket.apps.push(app);
  }
  return [...bySeason.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([season, bucket]) => ({
      season,
      ...playerTotals([player], bucket.matches, bucket.apps)[0],
    }));
}

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
  const played = playedMatches(matches).slice().reverse(); // oldest first
  const running = Object.fromEntries(trackedIds.map((id) => [id, 0]));
  const appsByMatch = new Map();
  for (const app of appearances) {
    if (!trackedIds.includes(app.player_id)) continue;
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

/**
 * Cumulative points for every season on a shared matchday axis, for overlaying
 * past seasons behind the current one. Returns
 * { seasons: ['2025/26', …] (newest first), points: [{ matchday, [season]: pts }] }.
 */
export function seasonPointsComparison(matches) {
  const seasons = seasonsOf(matches);
  const bySeason = seasons.map((s) => ({
    season: s,
    trend: seasonTrend(matches.filter((m) => m.season === s)),
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
 * Per-player scatter data: appearances against goal involvements, for spotting
 * who contributes most per game played. Only players with an appearance.
 */
export function involvementScatter(players, matches, appearances) {
  return playerTotals(players, matches, appearances)
    .filter((r) => r.appearances > 0)
    .map((r) => ({
      id: r.player.id,
      name: r.player.name,
      appearances: r.appearances,
      goals: r.goals,
      assists: r.assists,
      goalInvolvements: r.goalInvolvements,
      involvementsPerGame: r.involvementsPerGame,
    }));
}

export function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
