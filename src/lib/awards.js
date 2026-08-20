// Club-level records, season honours and career badges — the incentive layer
// one step up from a player's own profile.

import { playedMatches, resultOf, isCleanSheet, seasonsOf, seasonSummary, isPlayed } from './matches';
import { playerTotals } from './players';

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

/** The four awards a season hands out, in the order the honours board reads. */
const SEASON_AWARDS = [
  { key: 'goals', label: 'Golden boot' },
  { key: 'appearances', label: 'Most appearances' },
  { key: 'motm', label: 'Most MOTM' },
  { key: 'assists', label: 'Most assists' },
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
 * One row per season, newest first: the summary the season index shows, the
 * competitions played in it, and the four awards. Ties are kept whole — two
 * players on nine goals both won the boot (the same rule playerProfile uses
 * for a player's own Golden Boot honour).
 */
export function seasonRecords(players, matches, appearances) {
  return seasonsOf(matches).map((season) => {
    const seasonMatches = matches.filter((m) => m.season === season);
    const totals = playerTotals(players, seasonMatches, appearances);
    return {
      season,
      summary: seasonSummary(seasonMatches),
      competitions: [
        ...new Set(seasonMatches.filter(isPlayed).map((m) => m.competition)),
      ].sort(),
      awards: SEASON_AWARDS.map((a) => ({ ...a, ...leadersIn(totals, a.key) })),
    };
  });
}

/** The career rungs the club can claim, tight at the bottom so an early club
 *  has something to chase, and long enough to still mean something at 100. */
const CLUB_BADGES = [
  { key: 'apps-10', stat: 'appearances', target: 10, name: '10 appearances' },
  { key: 'apps-25', stat: 'appearances', target: 25, name: '25 appearances' },
  { key: 'apps-50', stat: 'appearances', target: 50, name: '50 appearances' },
  { key: 'apps-100', stat: 'appearances', target: 100, name: '100 appearances' },
  { key: 'goals-5', stat: 'goals', target: 5, name: '5 goals' },
  { key: 'goals-25', stat: 'goals', target: 25, name: '25 goals' },
];

/**
 * Club milestone badges — the player honours grid one level up. A badge
 * belongs to the club as soon as anyone reaches it, and carries the name of
 * whoever got there; the rest stay quiet rather than showing a zero. Returned
 * in ladder order, not earned-first: where the gold stops is the story.
 */
export function clubHallOfFame(players, matches, appearances) {
  const matchById = new Map(matches.map((m) => [m.id, m]));
  const playerById = new Map(players.map((p) => [p.id, p]));
  const totals = playerTotals(players, matches, appearances);

  // Holders of a career-total badge, biggest total first.
  const holdersOf = (stat, target) =>
    totals
      .filter((r) => r[stat] >= target)
      .sort((a, b) => b[stat] - a[stat] || a.player.name.localeCompare(b.player.name))
      .map((r) => r.player);

  const badges = CLUB_BADGES.map((b) => ({
    key: b.key,
    name: b.name,
    holders: holdersOf(b.stat, b.target),
  }));

  // Three in a game, and every game of a season — the two badges no career
  // total can express, so both are counted off the appearance rows directly.
  const hatTrickIds = new Set();
  const mineBySeason = new Map();
  for (const a of appearances) {
    const match = matchById.get(a.match_id);
    if (a.dropout || !match || !isPlayed(match)) continue;
    if (a.goals >= 3) hatTrickIds.add(a.player_id);
    if (!mineBySeason.has(a.player_id)) mineBySeason.set(a.player_id, new Map());
    const seasons = mineBySeason.get(a.player_id);
    seasons.set(match.season, (seasons.get(match.season) ?? 0) + 1);
  }
  const clubGames = new Map();
  for (const m of matches) {
    if (!isPlayed(m)) continue;
    clubGames.set(m.season, (clubGames.get(m.season) ?? 0) + 1);
  }
  const byName = (a, b) => a.name.localeCompare(b.name);
  const named = (ids) => ids.map((id) => playerById.get(id)).filter(Boolean).sort(byName);

  badges.push(
    { key: 'hat-trick', name: 'Hat-trick', holders: named([...hatTrickIds]) },
    {
      key: 'ever-present',
      name: 'Ever-present season',
      holders: named(
        [...mineBySeason.entries()]
          .filter(([, seasons]) =>
            [...seasons.entries()].some(([s, n]) => n === clubGames.get(s)))
          .map(([id]) => id),
      ),
    },
  );

  // The shape the honours grid renders: earned badges name a holder, the rest
  // say plainly that the badge is still there to be taken.
  return badges.map((b) => ({
    key: b.key,
    name: b.name,
    earned: b.holders.length > 0,
    detail:
      b.holders.length === 0
        ? 'Nobody yet'
        : b.holders.length === 1
          ? b.holders[0].name
          : `${b.holders[0].name} +${b.holders.length - 1}`,
  }));
}
