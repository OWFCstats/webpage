// Match-level derivations. Raw rows come from Supabase; nothing here is
// stored. Clean sheets are team-wide: every player who appeared in a match
// with zero conceded gets one (positions are fluid at this level, so no
// GK/DEF gating).

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

/**
 * The current season: the most recent one with a played result, not just an
 * entered row. A fixture for next season is a card, not a context switch —
 * without this, entering one blanks every "current season" figure on Home
 * before a ball is kicked. `seasonsOf` itself stays row-based for pickers,
 * which should list a season the moment someone's entered fixtures for it.
 * Falls back to the most recent season with any row when nothing has been
 * played yet — there's nothing truer to show a brand new club.
 */
export function currentSeasonOf(matches) {
  return playedMatches(matches)[0]?.season ?? seasonsOf(matches)[0] ?? null;
}

/** Opponent monogram off the club name rather than a person's name, so
 *  "Old King's Scholars" has to skip the word that's only punctuation. Shared
 *  by the Matchday scoreboard and Home's last-result card — both draw a badge
 *  for whichever side isn't us. */
export function opponentInitials(name) {
  const words = name.split(' ').filter((w) => /[a-z0-9]/i.test(w));
  return words.map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?';
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

export function isCleanSheet(match) {
  return isPlayed(match) && match.goals_against === 0;
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

  // Named separately from the squad: a dropout isn't an appearance, so it's
  // filtered out of appsByMatch above, but the page still says who pulled out.
  const dropoutNames = appearances
    .filter((a) => a.match_id === match.id && a.dropout)
    .map((a) => playerById.get(a.player_id)?.name)
    .filter(Boolean);

  const priorSummary = seasonSummary(before);
  const margin = isPlayed(match) ? match.goals_for - match.goals_against : null;
  const playedMargins = upTo.filter(isPlayed).map((m) => m.goals_for - m.goals_against);
  const bestMargin = playedMargins.length > 0 ? Math.max(...playedMargins) : null;
  const priorMeetings = before.filter(
    (m) => m.opponent.toLowerCase() === match.opponent.toLowerCase(),
  );

  return {
    squad,
    scorers: squad.filter((a) => a.goals > 0),
    motm: squad.filter((a) => a.motm),
    dropoutNames,
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
