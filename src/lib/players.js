// Player-level aggregates: career totals, season breakdowns and the full
// player-page profile. Badges are not here — a plate is an award, so the
// ladder and the tiers live in awards.js. Appearance rows flagged `dropout`
// (withdrew <24h before kick-off) are excluded from every stat and counted
// separately.

import { isPlayed, isCleanSheet, seasonsOf } from './matches';

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

/**
 * One stat's leaderboard: the names in order, with competition ranks so two
 * players level share a place and the next one skips it. Zeroes are left out —
 * nobody is on a leaderboard for not scoring, and a column of them would bury
 * the names that are.
 *
 * `limit` is a hard cap, ties included, so a board can't grow to fifty names in
 * September when half the squad is level on one goal. `alsoLevel` counts who
 * the cap left out at that same mark, because a cut that lands inside a tie
 * makes the last name shown read as the last name there is. `sharedLead` is the
 * true number at the top, capped or not — the lead board needs it to know
 * whether there is a leader to name at all.
 */
export function statLeaders(rows, statKey, limit = 6) {
  const ordered = rows
    .filter((r) => r[statKey] > 0)
    .sort((a, b) => b[statKey] - a[statKey] || a.player.name.localeCompare(b.player.name));
  let place = 0;
  const placed = ordered.map((row, i) => {
    if (i === 0 || row[statKey] !== ordered[i - 1][statKey]) place = i + 1;
    return { ...row, rank: place };
  });
  const ranked = placed.slice(0, limit);
  const last = ranked[ranked.length - 1];
  return {
    value: placed[0]?.[statKey] ?? 0,
    ranked,
    leaders: ranked.filter((r) => r.rank === 1),
    chasers: ranked.filter((r) => r.rank > 1),
    sharedLead: placed.filter((r) => r.rank === 1).length,
    alsoLevel: last ? placed.slice(limit).filter((r) => r[statKey] === last[statKey]).length : 0,
  };
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
 * Everything a player's own page derives from rows that already exist: the
 * career log, career firsts and bests, the cumulative arc, club ranks,
 * teammates, and the squad averages the full-stats view compares against.
 * Mirrors matchContext — one pass, memoised by the page, no new columns
 * anywhere.
 */
export function playerProfile(player, players, matches, appearances) {
  const matchById = new Map(matches.map((m) => [m.id, m]));
  const playerById = new Map(players.map((p) => [p.id, p]));
  const career = playerTotals([player], matches, appearances)[0];

  // Every game actually played, oldest first — the spine of everything below.
  const chrono = appearances
    .filter((a) => a.player_id === player.id && !a.dropout)
    .map((a) => ({ app: a, match: matchById.get(a.match_id) }))
    .filter((r) => r.match && isPlayed(r.match))
    .sort((a, b) => (a.match.date < b.match.date ? -1 : 1));

  // Cumulative goals, assists and involvements by appearance number.
  let runGoals = 0;
  let runAssists = 0;
  const arc = chrono.map((r, i) => {
    runGoals += r.app.goals;
    runAssists += r.app.assists;
    return {
      n: i + 1,
      date: r.match.date,
      label: `vs ${r.match.opponent}`,
      goals: runGoals,
      assists: runAssists,
      involvements: runGoals + runAssists,
    };
  });

  // Seasons the player featured in, and how many games the club actually
  // played in each — the denominator for a selection record.
  const teamPlayedBySeason = new Map();
  for (const m of matches) {
    if (!isPlayed(m)) continue;
    teamPlayedBySeason.set(m.season, (teamPlayedBySeason.get(m.season) ?? 0) + 1);
  }
  const mineBySeason = new Map();
  for (const { match } of chrono) {
    mineBySeason.set(match.season, (mineBySeason.get(match.season) ?? 0) + 1);
  }

  const seasons = playerSeasonBreakdown(player, matches, appearances);
  // "Best" season is ranked on goal involvements, then goals, then appearances:
  // a 16-goal season beats a 20-appearance one, which is how players read it.
  const bestSeason = seasons.length
    ? seasons.slice().sort(
        (a, b) =>
          b.goalInvolvements - a.goalInvolvements ||
          b.goals - a.goals ||
          b.appearances - a.appearances,
      )[0]
    : null;

  const firstGoalIndex = chrono.findIndex((r) => r.app.goals > 0);
  const bestGame = chrono
    .filter((r) => r.app.goals + r.app.assists > 0)
    .sort(
      (a, b) =>
        b.app.goals + b.app.assists - (a.app.goals + a.app.assists) ||
        b.app.goals - a.app.goals ||
        (a.match.date < b.match.date ? -1 : 1),
    )[0] ?? null;

  const firsts = {
    debut: chrono[0] ?? null,
    firstGoal: firstGoalIndex === -1 ? null : { ...chrono[firstGoalIndex], appearanceNo: firstGoalIndex + 1 },
    bestGame,
    bestSeason,
  };

  // Ranks are taken among players who have actually appeared — padding the
  // denominator with names that never played would flatter everyone.
  const pool = playerTotals(players, matches, appearances).filter((r) => r.appearances > 0);
  const rankIn = (rows, key) => {
    const value = rows.find((r) => r.player.id === player.id)?.[key] ?? 0;
    // A zero is not a placing: with nothing recorded the count above you is 0,
    // which would read as "1st". Null lets the UI leave the position blank.
    const rank = value > 0 ? rows.filter((r) => r[key] > value).length + 1 : null;
    return { value, rank, of: rows.length };
  };
  const currentSeason = seasonsOf(matches)[0];
  const seasonPool = currentSeason
    ? playerTotals(players, matches.filter((m) => m.season === currentSeason), appearances)
        .filter((r) => r.appearances > 0)
    : [];
  // Empty for a player who hasn't appeared: they aren't in the pool, so every
  // "rank" would be one past the last place in a table they're not part of.
  const ranks = [];
  if (career.appearances > 0) {
    ranks.push(
      { key: 'goals', label: 'Goals', ...rankIn(pool, 'goals') },
      { key: 'appearances', label: 'Appearances', ...rankIn(pool, 'appearances') },
      { key: 'assists', label: 'Assists', ...rankIn(pool, 'assists') },
      { key: 'cleanSheets', label: 'Clean sheets', ...rankIn(pool, 'cleanSheets') },
    );
    if (seasonPool.some((r) => r.player.id === player.id)) {
      ranks.push({ key: 'seasonGoals', label: `Goals in ${currentSeason}`, ...rankIn(seasonPool, 'goals') });
    }
  }

  const myMatchIds = new Set(chrono.map((r) => r.match.id));
  const shared = new Map();
  for (const a of appearances) {
    if (a.dropout || a.player_id === player.id || !myMatchIds.has(a.match_id)) continue;
    shared.set(a.player_id, (shared.get(a.player_id) ?? 0) + 1);
  }
  const teammates = [...shared.entries()]
    .map(([id, games]) => ({ player: playerById.get(id), games }))
    .filter((t) => t.player)
    .sort((a, b) => b.games - a.games || a.player.name.localeCompare(b.player.name))
    .slice(0, 4);

  const byOpponent = new Map();
  for (const { app, match } of chrono) {
    if (!byOpponent.has(match.opponent)) {
      byOpponent.set(match.opponent, { opponent: match.opponent, games: 0, goals: 0, assists: 0 });
    }
    const bucket = byOpponent.get(match.opponent);
    bucket.games += 1;
    bucket.goals += app.goals;
    bucket.assists += app.assists;
  }
  const favouriteOpponent = [...byOpponent.values()]
    .filter((b) => b.goals > 0)
    .sort(
      (a, b) =>
        b.goals - a.goals ||
        b.goals + b.assists - (a.goals + a.assists) ||
        a.games - b.games,
    )[0] ?? null;

  const recent = chrono.slice().reverse();
  const form = recent.slice(0, 6);
  let scoringRun = 0;
  for (const r of recent) {
    if (r.app.goals === 0) break;
    scoringRun += 1;
  }
  let sinceGoal = 0;
  for (const r of recent) {
    if (r.app.goals > 0) break;
    sinceGoal += 1;
  }

  // Squad context for the full-stats view: the average is the honest
  // comparison, the max sets the bar scale.
  const COMPARED = [
    'appearances', 'starts', 'goals', 'assists', 'goalInvolvements',
    'cleanSheets', 'motm', 'goalsPerGame',
  ];
  const squadAverage = {};
  const squadMax = {};
  for (const key of COMPARED) {
    squadAverage[key] = pool.length ? pool.reduce((sum, r) => sum + r[key], 0) / pool.length : 0;
    squadMax[key] = Math.max(0, ...pool.map((r) => r[key]));
  }

  // Games the club played in the seasons this player featured in — the only
  // defensible denominator for a selection record.
  const availableGames = [...mineBySeason.keys()].reduce(
    (sum, season) => sum + (teamPlayedBySeason.get(season) ?? 0),
    0,
  );

  return {
    career,
    chrono,
    log: recent,
    arc,
    firsts,
    seasons,
    ranks,
    teammates,
    favouriteOpponent,
    form,
    scoringRun,
    sinceGoal,
    squadAverage,
    squadMax,
    availableGames,
    seasonsActive: [...mineBySeason.keys()].sort(),
  };
}
