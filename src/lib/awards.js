// Club-level records, season honours and career badges — the incentive layer
// one step up from a player's own profile.

import { playedMatches, resultOf, isCleanSheet, seasonsOf, seasonSummary, isPlayed } from './matches';
import { playerTotals } from './players';
import { monthYear } from './format';

/**
 * Longest streak of consecutive matches satisfying `ok`, over an oldest-first
 * list. Returns the run itself so the page can list the games in it, or null
 * when the run never starts — a club yet to win has no winning run at all,
 * which is not the same thing as a run of zero.
 */
function longestRun(chrono, ok) {
  let best = [];
  let current = [];
  for (const m of chrono) {
    current = ok(m) ? [...current, m] : [];
    if (current.length > best.length) best = current;
  }
  if (best.length === 0) return null;
  return {
    count: best.length,
    from: best[0].date,
    to: best[best.length - 1].date,
    matches: best,
  };
}

/** The single match scoring highest on `score`; the earlier game keeps a
 *  record it set first. Null when nothing qualifies. */
function recordMatch(matches, score) {
  return (
    matches
      .slice()
      .sort((a, b) => score(b) - score(a) || (a.date < b.date ? -1 : 1))[0] ?? null
  );
}

/**
 * The club's own records over the given matches: best and worst scorelines,
 * the highest-scoring game, the longest unbeaten and winning runs, and the
 * first clean sheet. Every mark is null until a result sets it, so the page
 * can name a record nobody holds rather than print a zero.
 */
export function clubRecords(matches) {
  const played = playedMatches(matches);
  const chrono = played.slice().reverse(); // oldest first — runs read forwards
  const margin = (m) => m.goals_for - m.goals_against;
  return {
    played: played.length,
    biggestWin: recordMatch(played.filter((m) => resultOf(m) === 'W'), margin),
    heaviestDefeat: recordMatch(played.filter((m) => resultOf(m) === 'L'), (m) => -margin(m)),
    highestScoring: recordMatch(played, (m) => m.goals_for + m.goals_against),
    longestUnbeaten: longestRun(chrono, (m) => resultOf(m) !== 'L'),
    longestWinning: longestRun(chrono, (m) => resultOf(m) === 'W'),
    firstCleanSheet: chrono.find(isCleanSheet) ?? null,
    cleanSheets: chrono.filter(isCleanSheet).length,
  };
}

/**
 * The five awards a season hands out, in the order the honours board reads
 * them. Player of the Season leads because it's the one the players vote on —
 * and the only one no formula produces, which is why it needs a row in
 * `season_awards` and an admin to type it in.
 */
const SEASON_AWARDS = [
  { key: 'player-of-the-season', label: 'Player of the Season', voted: true },
  { key: 'goals', label: 'Golden Boot' },
  { key: 'assists', label: 'Assist King' },
  { key: 'appearances', label: 'The Dependable' },
  { key: 'motm', label: 'Most MOTM' },
];

/**
 * Everyone level at the top of one stat, and the mark they share. Empty when
 * nothing was recorded — nobody leads a column of zeroes, and picking a name
 * out of it would invent a winner.
 */
function leadersIn(totals, key) {
  const value = Math.max(0, ...totals.map((r) => r[key]));
  if (value === 0) return { value, leaders: [] };
  return {
    value,
    leaders: totals
      .filter((r) => r[key] === value)
      .map((r) => r.player)
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
}

/**
 * A hand-picked award, shaped like a derived one so the honours board renders
 * both the same way. No mark: a vote doesn't have a number behind it, and
 * printing one would imply the arithmetic decided it.
 */
function votedAward(seasonAwards, playerById, season, key) {
  const row = seasonAwards.find((r) => r.season === season && r.award_key === key);
  const player = row ? playerById.get(row.player_id) : null;
  return { value: null, note: row?.note?.trim() || null, leaders: player ? [player] : [] };
}

/**
 * One row per season, newest first: the summary the season index shows, the
 * competitions played in it, and the five awards. Ties are kept whole on the
 * derived four — two players on nine goals both won the boot, and the rows
 * can't say which of them mattered more.
 */
export function seasonRecords(players, matches, appearances, seasonAwards = []) {
  const playerById = new Map(players.map((p) => [p.id, p]));
  return seasonsOf(matches).map((season) => {
    const seasonMatches = matches.filter((m) => m.season === season);
    const totals = playerTotals(players, seasonMatches, appearances);
    return {
      season,
      summary: seasonSummary(seasonMatches),
      competitions: [
        ...new Set(seasonMatches.filter(isPlayed).map((m) => m.competition)),
      ].sort(),
      awards: SEASON_AWARDS.map((a) => ({
        ...a,
        ...(a.voted
          ? votedAward(seasonAwards, playerById, season, a.key)
          : leadersIn(totals, a.key)),
      })),
    };
  });
}


// ---------------------------------------------------------------------------
// Plates — the career badges
// ---------------------------------------------------------------------------

/** One metal per rung, lowest first. Named on the plate as well as worn by it:
 *  bronze and gold are close at badge size, so colour never carries the tier
 *  on its own. */
const TIERS = ['bronze', 'silver', 'gold'];

/**
 * The plate ladder. Three rungs per badge, one metal each, and the thresholds
 * are set against a fourteen-game season: bronze inside a first season for
 * anyone who keeps turning up, silver in a second, gold a mark that takes a
 * few years. A ladder whose bottom rung is out of reach is decoration — most
 * of the squad should already hold something the day this ships.
 *
 * The first five read straight off a career total. The last three can't: a
 * hat-trick, a Golden Boot and an ever-present season are events, counted from
 * the appearance rows in plateTotals. `one` is the label at a rung of one,
 * where the plural reads wrong.
 */
const PLATES = [
  { key: 'appearances', label: 'Appearances', rungs: [5, 15, 30] },
  { key: 'goals', label: 'Goals', rungs: [3, 10, 25] },
  { key: 'assists', label: 'Assists', rungs: [3, 10, 25] },
  { key: 'cleanSheets', label: 'Clean sheets', rungs: [2, 6, 15] },
  { key: 'motm', label: 'MOTM', rungs: [2, 5, 12] },
  { key: 'hatTricks', label: 'Hat-tricks', one: 'Hat-trick', rungs: [1, 3, 6] },
  { key: 'goldenBoots', label: 'Golden Boots', one: 'Golden Boot', rungs: [1, 2, 3], seasonal: true },
  { key: 'everPresent', label: 'Ever-present', rungs: [1, 2, 3], seasonal: true },
];

/** How many unearned plates follow the earned ones on a player's shelf. Enough
 *  to give them something to chase, few enough to stay on the first screen. */
const CHASING_SHOWN = 3;

/** The parts of a plate that don't depend on who is looking at it. */
function plateFace(family, rung, tierIndex) {
  return {
    key: `${family.key}-${rung}`,
    tier: TIERS[tierIndex],
    mark: String(rung),
    label: rung === 1 && family.one ? family.one : family.label,
  };
}

/**
 * Every plate count for the whole squad, in one pass. The three that no career
 * total holds are worked out here rather than per player, because a Golden Boot
 * needs each season's leaders — doing it a player at a time would re-derive
 * every season once per name in the squad.
 */
function plateTotals(players, matches, appearances) {
  const matchById = new Map(matches.map((m) => [m.id, m]));
  const rows = new Map(
    playerTotals(players, matches, appearances).map((r) => [
      r.player.id,
      { ...r, hatTricks: 0, goldenBoots: 0, everPresent: 0, bootSeasons: [], everPresentSeasons: [] },
    ]),
  );

  // Games the club actually played per season — the denominator for an
  // ever-present season, and the reason it can only be counted off the rows.
  const clubGames = new Map();
  for (const m of matches) {
    if (!isPlayed(m)) continue;
    clubGames.set(m.season, (clubGames.get(m.season) ?? 0) + 1);
  }

  const mineBySeason = new Map();
  for (const a of appearances) {
    const match = matchById.get(a.match_id);
    const row = rows.get(a.player_id);
    if (!row || a.dropout || !match || !isPlayed(match)) continue;
    if (a.goals >= 3) row.hatTricks += 1;
    if (!mineBySeason.has(a.player_id)) mineBySeason.set(a.player_id, new Map());
    const seasons = mineBySeason.get(a.player_id);
    seasons.set(match.season, (seasons.get(match.season) ?? 0) + 1);
  }
  for (const [id, seasons] of mineBySeason) {
    const row = rows.get(id);
    row.everPresentSeasons = [...seasons.entries()]
      .filter(([season, n]) => n === clubGames.get(season))
      .map(([season]) => season)
      .sort();
    row.everPresent = row.everPresentSeasons.length;
  }

  // Golden Boot: top scorer in a season, ties kept whole — the same rule the
  // honours board uses, so a shared boot is a plate for both of them.
  for (const season of seasonsOf(matches)) {
    const totals = playerTotals(players, matches.filter((m) => m.season === season), appearances);
    const best = Math.max(0, ...totals.map((r) => r.goals));
    if (best === 0) continue;
    for (const r of totals) {
      if (r.goals !== best) continue;
      const row = rows.get(r.player.id);
      row.bootSeasons.push(season);
      row.goldenBoots += 1;
    }
  }
  for (const row of rows.values()) row.bootSeasons.sort();

  return [...rows.values()];
}

/**
 * One player's shelf: the best metal they hold in each badge, then the plates
 * closest to falling. Earned ones carry when they landed, the rest what's left
 * to go — a badge you can't see is not an incentive, so an unearned plate is
 * present and named rather than hidden.
 */
export function playerPlates(player, players, matches, appearances) {
  const mine = plateTotals(players, matches, appearances).find((r) => r.player.id === player.id);
  if (!mine) return [];

  // When each rung fell, so an earned plate can carry its own month. A career
  // total says what a player has, never when they got there, so this walks
  // their own games forwards. The two seasonal badges are dated by the season
  // they were won in instead, which is the more useful answer anyway.
  const matchById = new Map(matches.map((m) => [m.id, m]));
  const chrono = appearances
    .filter((a) => a.player_id === player.id && !a.dropout)
    .map((a) => ({ app: a, match: matchById.get(a.match_id) }))
    .filter((r) => r.match && isPlayed(r.match))
    .sort((a, b) => (a.match.date < b.match.date ? -1 : 1));

  const when = new Map();
  const running = { appearances: 0, goals: 0, assists: 0, cleanSheets: 0, motm: 0, hatTricks: 0 };
  for (const { app, match } of chrono) {
    running.appearances += 1;
    running.goals += app.goals;
    running.assists += app.assists;
    if (app.motm) running.motm += 1;
    if (app.goals >= 3) running.hatTricks += 1;
    if (isCleanSheet(match)) running.cleanSheets += 1;
    for (const family of PLATES) {
      if (family.seasonal) continue;
      for (const rung of family.rungs) {
        const id = `${family.key}:${rung}`;
        if (running[family.key] >= rung && !when.has(id)) when.set(id, match.date);
      }
    }
  }

  const earned = [];
  const chasing = [];
  for (const family of PLATES) {
    const have = mine[family.key];
    const seasons = family.key === 'goldenBoots' ? mine.bootSeasons
      : family.key === 'everPresent' ? mine.everPresentSeasons
        : null;
    const ladder = family.rungs.map((rung, i) => ({
      ...plateFace(family, rung, i),
      earned: have >= rung,
      note: have >= rung
        ? (seasons ? seasons[rung - 1] : monthYear(when.get(`${family.key}:${rung}`)))
        : `${rung - have} to go`,
      progress: Math.min(1, have / rung),
    }));
    const held = ladder.filter((p) => p.earned);
    if (held.length > 0) earned.push(held[held.length - 1]);
    const open = ladder.find((p) => !p.earned);
    if (open) chasing.push(open);
  }

  // Best metal first, so the plate a player is proudest of leads the shelf;
  // then the closest few they haven't got. Sorting is stable, so plates level
  // on tier or on progress keep the ladder's own order.
  earned.sort((a, b) => TIERS.indexOf(b.tier) - TIERS.indexOf(a.tier));
  chasing.sort((a, b) => b.progress - a.progress);
  return [...earned, ...chasing.slice(0, CHASING_SHOWN)];
}

/**
 * The club plate board: every plate in the system and who holds it. A plate
 * belongs to the club as soon as anyone reaches it and carries their name; the
 * rest say plainly that they're still there to be taken. Ladder order, not
 * earned-first — where the gold stops is the story.
 */
export function clubPlates(players, matches, appearances) {
  const rows = plateTotals(players, matches, appearances);
  return PLATES.flatMap((family) =>
    family.rungs.map((rung, i) => {
      const holders = rows
        .filter((r) => r[family.key] >= rung)
        .sort((a, b) => b[family.key] - a[family.key] || a.player.name.localeCompare(b.player.name))
        .map((r) => r.player);
      return {
        ...plateFace(family, rung, i),
        earned: holders.length > 0,
        note:
          holders.length === 0 ? 'Nobody yet'
            : holders.length === 1 ? holders[0].name
              : `${holders[0].name} +${holders.length - 1}`,
      };
    }),
  );
}
