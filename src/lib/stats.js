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

/** URL-safe slug for an opponent name, e.g. "St. George's OB" -> "st-george-s-ob". */
export function slugify(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Resolves a route slug back to a team and every match against them, via
 * `teams.slug`. A match created before the teams migration (or a failed
 * backfill) carries no `opponent_team_id`, so those rows fall back to a
 * case-insensitive match on the free-text `opponent` column. Returns null if
 * the slug matches no team.
 */
export function opponentMatches(matches, teams, slug) {
  const team = teams.find((t) => t.slug === slug);
  if (!team) return null;
  return {
    team,
    matches: matches.filter((m) =>
      m.opponent_team_id
        ? m.opponent_team_id === team.id
        : m.opponent?.toLowerCase() === team.name.toLowerCase(),
    ),
  };
}

/**
 * Route slug for a match's opponent: the team's own slug when
 * `opponent_team_id` resolves, otherwise (a pre-migration row, or a failed
 * backfill) a slug of the free-text `opponent` so the link still resolves.
 * Also accepts opponent-shaped objects without an id (e.g. favouriteOpponent)
 * and falls back to a name match against `teams`.
 */
export function opponentSlug(teams, match) {
  const team = match.opponent_team_id
    ? teams.find((t) => t.id === match.opponent_team_id)
    : teams.find((t) => t.name.toLowerCase() === match.opponent?.toLowerCase());
  return team ? team.slug : slugify(match.opponent ?? '');
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

/** Won/drawn/lost split at home vs away (neutral-venue and unrecorded-venue
 * matches count toward neither side). */
export function venueSummary(matches) {
  return {
    home: seasonSummary(matches.filter((m) => m.venue === 'H')),
    away: seasonSummary(matches.filter((m) => m.venue === 'A')),
  };
}

/** Longest run of identical results at the front of the (newest-first)
 * results, e.g. { result: 'W', count: 3 } for "won the last 3". Null if
 * nothing has been played. */
export function currentStreak(matches) {
  const played = playedMatches(matches);
  if (played.length === 0) return null;
  const result = resultOf(played[0]);
  let count = 0;
  for (const m of played) {
    if (resultOf(m) !== result) break;
    count += 1;
  }
  return { result, count };
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

/** Most recent completed match, or null. */
export function latestResult(matches) {
  return playedMatches(matches)[0] ?? null;
}

/** "(H)" / "(A)" / "(N)" for display; empty when the venue wasn't recorded. */
export function venueLabel(match) {
  return match.venue ? `(${match.venue})` : '';
}

/** Opponent with venue, e.g. "Old Stoics (A)". */
export function matchTitle(match) {
  const v = venueLabel(match);
  return v ? `${match.opponent} ${v}` : match.opponent;
}

/** The club's own display name, for rendering a match as home vs away rather
 *  than "us vs them". */
export const CLUB_NAME = 'Old Wellingtonians';

/** Home and away side of a match, with the score to match — OWFC can be
 *  either side. A neutral or unrecorded venue defaults to us at home. */
export function matchHomeAway(match) {
  const weAreHome = match.venue !== 'A';
  return {
    homeTeam: weAreHome ? CLUB_NAME : match.opponent,
    awayTeam: weAreHome ? match.opponent : CLUB_NAME,
    homeGoals: weAreHome ? match.goals_for : match.goals_against,
    awayGoals: weAreHome ? match.goals_against : match.goals_for,
  };
}

/**
 * The team whose pitch a fixture is played at: our own record for a home
 * game, the opponent's for an away game. A neutral or unrecorded venue, or a
 * team that isn't in `teams` (a pre-migration row with no matching team),
 * returns null rather than guessing. Returns the whole team record so
 * callers can pick what they render (pitch_name, pitch_address, postcode,
 * map_url).
 */
export function venueTeam(match, teams) {
  if (match.venue === 'H') return teams.find((t) => t.is_club) ?? null;
  if (match.venue === 'A') {
    return match.opponent_team_id
      ? teams.find((t) => t.id === match.opponent_team_id) ?? null
      : teams.find((t) => t.name.toLowerCase() === match.opponent?.toLowerCase()) ?? null;
  }
  return null;
}

/** UK-friendly kick-off time, e.g. "14:00:00" -> "2:00pm". Empty string when
 * not recorded. */
export function formatKickoff(time) {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const period = h < 12 ? 'am' : 'pm';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')}${period}`;
}

/** Days until a fixture, or null once it's in the past. */
export function daysUntil(iso) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const then = new Date(`${iso}T00:00:00`);
  const days = Math.round((then - today) / 86400000);
  return days < 0 ? null : days;
}

export function countdownLabel(iso) {
  const days = daysUntil(iso);
  if (days === null) return null;
  if (days === 0) return 'Kick-off today';
  if (days === 1) return 'Kick-off tomorrow';
  if (days < 14) return `Kick-off in ${days} days`;
  return `Kick-off in ${Math.round(days / 7)} weeks`;
}

/**
 * Everything the Match Centre derives about one match from data that already
 * exists: scorers, MOTM, debuts, appearance counts, top-scorer standings after
 * the game, and how the scoreline compares to the season. No new columns.
 */
export function matchContext(match, players, matches, appearances) {
  const playerById = new Map(players.map((p) => [p.id, p]));
  const seasonPlayed = playedMatches(
    matches.filter((m) => m.season === match.season),
  ).slice().reverse(); // oldest first
  const upToIndex = seasonPlayed.findIndex((m) => m.id === match.id);
  const upTo = upToIndex === -1 ? seasonPlayed : seasonPlayed.slice(0, upToIndex + 1);
  const before = upToIndex === -1 ? seasonPlayed : seasonPlayed.slice(0, upToIndex);

  const appsByMatch = new Map();
  for (const a of appearances) {
    if (a.dropout) continue;
    if (!appsByMatch.has(a.match_id)) appsByMatch.set(a.match_id, []);
    appsByMatch.get(a.match_id).push(a);
  }

  // Appearance number within the season for each player in this squad, and
  // whether this match was their first game of the season on record.
  const seasonAppCount = new Map();
  const debutIds = new Set();
  for (const m of upTo) {
    for (const a of appsByMatch.get(m.id) ?? []) {
      const n = (seasonAppCount.get(a.player_id) ?? 0) + 1;
      seasonAppCount.set(a.player_id, n);
      if (m.id === match.id && n === 1) debutIds.add(a.player_id);
    }
  }

  // Golden-boot standings after this match.
  const bootTotals = new Map();
  for (const m of upTo) {
    for (const a of appsByMatch.get(m.id) ?? []) {
      bootTotals.set(a.player_id, (bootTotals.get(a.player_id) ?? 0) + a.goals);
    }
  }
  const boot = [...bootTotals.entries()]
    .filter(([, g]) => g > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id, goals]) => ({ player: playerById.get(id), goals }))
    .filter((r) => r.player);

  const squad = (appsByMatch.get(match.id) ?? [])
    .map((a) => ({ ...a, player: playerById.get(a.player_id) }))
    .filter((a) => a.player)
    .sort(
      (a, b) =>
        b.goals - a.goals ||
        b.assists - a.assists ||
        a.player.name.localeCompare(b.player.name),
    );

  const priorSummary = seasonSummary(before);
  const margin = isPlayed(match) ? match.goals_for - match.goals_against : null;
  const bestMargin = Math.max(
    ...upTo.filter(isPlayed).map((m) => m.goals_for - m.goals_against),
  );
  const priorMeetings = before.filter(
    (m) => m.opponent.toLowerCase() === match.opponent.toLowerCase(),
  );

  return {
    squad,
    scorers: squad.filter((a) => a.goals > 0),
    motm: squad.filter((a) => a.motm),
    debutIds,
    seasonAppCount,
    boot,
    margin,
    bestMargin,
    matchNumber: upToIndex + 1,
    seasonGames: seasonPlayed.length,
    avgFor: before.length ? priorSummary.goalsFor / before.length : null,
    avgAgainst: before.length ? priorSummary.goalsAgainst / before.length : null,
    priorMeetings,
  };
}

export function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** "Feb 2025" — for honour badges, where a full date doesn't fit. */
export function monthYear(iso) {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

// ---------------------------------------------------------------------------
// Player pages: milestones, honours and the career profile
// ---------------------------------------------------------------------------

/**
 * The round-number rung immediately above `v`. The ladder is tight at the
 * bottom (5, 10, 20, 30 …) so a player on three clean sheets is chasing
 * something reachable, and widens as totals grow (… 75, 100, 150) so a
 * centurion isn't nagged every ten games.
 */
function rungAfter(v) {
  const step = v < 5 ? 5 : v < 50 ? 10 : v < 100 ? 25 : v < 300 ? 50 : 100;
  return Math.floor(v / step) * step + step;
}

/**
 * Progress toward the next round-number milestone on a career total:
 * nextMilestone(42) -> { target: 50, remaining: 8, progress: 0.84 }.
 *
 * Null at zero, deliberately. A player with no assists isn't "20 assists
 * away" from anything — they haven't started — and an empty bar on their own
 * page reads as a rebuke rather than a target.
 */
export function nextMilestone(total) {
  if (!Number.isFinite(total) || total <= 0) return null;
  const target = rungAfter(total);
  return { target, remaining: target - total, progress: total / target };
}

/** Every rung a total has already passed, lowest first. */
function rungsReached(total) {
  const out = [];
  let v = 0;
  while (rungAfter(v) <= total) {
    v = rungAfter(v);
    out.push(v);
  }
  return out;
}

/** The career totals that carry a milestone track and an honour. `label` is the
 *  badge caption; `one`/`many` build the sentence on the progress bar. */
const MILESTONE_STATS = [
  { key: 'appearances', label: 'Apps', one: 'appearance', many: 'appearances' },
  { key: 'goals', label: 'Goals', one: 'goal', many: 'goals' },
  { key: 'assists', label: 'Assists', one: 'assist', many: 'assists' },
  { key: 'cleanSheets', label: 'Clean sheets', one: 'clean sheet', many: 'clean sheets' },
  { key: 'motm', label: 'MOTM', one: 'MOTM award', many: 'MOTM awards' },
];

/** "1 goal" / "3 goals" — milestone copy reads as a sentence, so it has to agree. */
export function plural(n, one, many) {
  return `${n} ${n === 1 ? one : many}`;
}

/**
 * Milestone tracks for a career totals row, closest to completion first, so
 * the bar at the top is always the one about to fall. Stats still on zero are
 * left out entirely (see nextMilestone).
 */
export function playerMilestones(career) {
  return MILESTONE_STATS.map((s) => ({
    ...s,
    total: career[s.key],
    ...nextMilestone(career[s.key]),
  }))
    .filter((m) => m.target)
    .sort((a, b) => b.progress - a.progress);
}

/**
 * Everything a player's own page derives from rows that already exist:
 * the career log, milestone tracks, earned and outstanding honours, career
 * firsts and bests, the cumulative arc, club ranks, teammates, and the squad
 * averages the full-stats view compares against. Mirrors matchContext — one
 * pass, memoised by the page, no new columns anywhere.
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

  // When each rung was passed, so an earned honour can carry its own date.
  const rungDate = new Map();
  const running = { appearances: 0, goals: 0, assists: 0, cleanSheets: 0, motm: 0 };
  for (const { app, match } of chrono) {
    running.appearances += 1;
    running.goals += app.goals;
    running.assists += app.assists;
    if (app.motm) running.motm += 1;
    if (isCleanSheet(match)) running.cleanSheets += 1;
    for (const s of MILESTONE_STATS) {
      for (const rung of rungsReached(running[s.key])) {
        const key = `${s.key}:${rung}`;
        if (!rungDate.has(key)) rungDate.set(key, match.date);
      }
    }
  }

  // Seasons the player featured in, and how many games the club actually
  // played in each — the denominator for an ever-present season.
  const teamPlayedBySeason = new Map();
  for (const m of matches) {
    if (!isPlayed(m)) continue;
    teamPlayedBySeason.set(m.season, (teamPlayedBySeason.get(m.season) ?? 0) + 1);
  }
  const mineBySeason = new Map();
  for (const { match } of chrono) {
    mineBySeason.set(match.season, (mineBySeason.get(match.season) ?? 0) + 1);
  }

  const honours = [];
  for (const s of MILESTONE_STATS) {
    const reached = rungsReached(career[s.key]);
    const top = reached[reached.length - 1];
    if (top) {
      honours.push({
        key: `${s.key}-${top}`,
        name: `${top} ${s.label}`,
        detail: monthYear(rungDate.get(`${s.key}:${top}`)),
        earned: true,
      });
    }
    const next = nextMilestone(career[s.key]);
    const target = next ? next.target : rungAfter(0);
    const remaining = next ? next.remaining : target;
    honours.push({
      key: `${s.key}-${target}`,
      name: `${target} ${s.label}`,
      detail: `${remaining} to go`,
      earned: false,
      remaining,
    });
  }

  const hatTricks = chrono.filter((r) => r.app.goals >= 3);
  honours.push(
    hatTricks.length > 0
      ? {
          key: 'hat-trick',
          name: 'Hat-trick',
          detail: hatTricks.length > 1
            ? `×${hatTricks.length}`
            : monthYear(hatTricks[0].match.date),
          earned: true,
        }
      : { key: 'hat-trick', name: 'Hat-trick', detail: '3 in a game', earned: false, remaining: Infinity },
  );

  const everPresent = [...mineBySeason.entries()]
    .filter(([season, n]) => n > 0 && n === teamPlayedBySeason.get(season))
    .map(([season]) => season)
    .sort();
  honours.push(
    everPresent.length > 0
      ? {
          key: 'ever-present',
          name: 'Ever-present',
          detail: everPresent.length > 1 ? `${everPresent.length} seasons` : everPresent[0],
          earned: true,
        }
      : { key: 'ever-present', name: 'Ever-present', detail: 'Every game in a season', earned: false, remaining: Infinity },
  );

  // Club top scorer in a season. Shared tops both count — two players on nine
  // goals have both led the scoring, and the data can't say who mattered more.
  const goldenBoot = [];
  for (const season of mineBySeason.keys()) {
    const totals = playerTotals(players, matches.filter((m) => m.season === season), appearances);
    const best = Math.max(0, ...totals.map((r) => r.goals));
    const mine = totals.find((r) => r.player.id === player.id)?.goals ?? 0;
    if (best > 0 && mine === best) goldenBoot.push(season);
  }
  goldenBoot.sort();
  honours.push(
    goldenBoot.length > 0
      ? {
          key: 'golden-boot',
          name: 'Golden Boot',
          detail: goldenBoot.length > 1 ? `${goldenBoot.length} seasons` : goldenBoot[0],
          earned: true,
        }
      : { key: 'golden-boot', name: 'Golden Boot', detail: 'Top scorer in a season', earned: false, remaining: Infinity },
  );

  // Earned first so the gold badges lead; outstanding ones by how close they are.
  honours.sort((a, b) => Number(b.earned) - Number(a.earned) || (a.remaining ?? 0) - (b.remaining ?? 0));

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
    milestones: playerMilestones(career),
    honours,
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
