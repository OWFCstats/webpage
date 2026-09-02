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

/**
 * Do two runs hold the same games? A winning run is unbeaten by definition, so
 * a young club's longest of each is routinely the same handful of matches — and
 * a records list that prints them as two separate marks reads as a bug rather
 * than as a fact about a first season.
 */
function sameRun(a, b) {
  if (!a || !b || a.count !== b.count) return false;
  return a.matches.every((m, i) => m.id === b.matches[i].id);
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
  const longestUnbeaten = longestRun(chrono, (m) => resultOf(m) !== 'L');
  const longestWinning = longestRun(chrono, (m) => resultOf(m) === 'W');
  return {
    played: played.length,
    biggestWin: recordMatch(played.filter((m) => resultOf(m) === 'W'), margin),
    heaviestDefeat: recordMatch(played.filter((m) => resultOf(m) === 'L'), (m) => -margin(m)),
    highestScoring: recordMatch(played, (m) => m.goals_for + m.goals_against),
    longestUnbeaten,
    longestWinning,
    // The two runs being the same games is the club's record, not a rendering
    // detail, so the list is told rather than left to work it out.
    runsCoincide: sameRun(longestUnbeaten, longestWinning),
    firstCleanSheet: chrono.find(isCleanSheet) ?? null,
    cleanSheets: chrono.filter(isCleanSheet).length,
  };
}

/**
 * The badge system, in one place: three classes, and only the first of them
 * tiers. `docs/DESIGN.md` → *Badges and awards* is the prose; if the two ever
 * disagree, this file is right and the doc is wrong.
 */

/** The four metals, lowest first. A tier is a metal and nothing else, and the
 *  word is printed in only one place — a badge's own page, where all four are
 *  set side by side and somebody has to be told which is which. Everywhere else
 *  the drawing says it: each tier is drawn separately, on a frame that changes
 *  shape as well as colour on the way up. */
export const METALS = ['bronze', 'silver', 'gold', 'diamond'];

/**
 * Class 1 — career badges, four metals, one badge per category.
 *
 * **Bronze is one.** A debut is a badge, so everyone who has ever been picked
 * owns something and has a shelf to add to; the ladder this replaced started
 * at five appearances, which 70% of the squad could not reach. Diamond is
 * roughly four seasons at fourteen games — a mark that takes years, which is
 * what a top rung is for.
 *
 * `key` is the badge's address under /records/badges, and — with the metal
 * appended — the drawing's own filename in src/assets/badges: these four are the
 * ones drawn four times over. See lib/badge-art.js.
 */
export const CAREER_BADGES = [
  {
    key: 'appearances',
    class: 'career',
    label: 'Appearances',
    stat: 'appearances',
    tiers: [1, 10, 25, 50],
    line: 'Turn up once and it is yours. Fifty is four seasons of Saturdays.',
  },
  {
    key: 'goals',
    class: 'career',
    label: 'Goals',
    stat: 'goals',
    tiers: [1, 5, 15, 30],
    line: 'One goal, in any competition, at any point in a season.',
  },
  {
    key: 'assists',
    class: 'career',
    label: 'Assists',
    stat: 'assists',
    tiers: [1, 4, 12, 25],
    line: 'The pass before the goal counts as much as the goal here.',
  },
  {
    key: 'clean-sheets',
    class: 'career',
    label: 'Clean sheets',
    stat: 'cleanSheets',
    tiers: [1, 5, 12, 25],
    // Every player in a match with nothing conceded gets one — positions are
    // fluid at this level, so there is no GK or defender gating. The club's
    // first will hand bronze to eleven people at once, which is why the badge
    // names itself a team badge rather than reading as a participation prize.
    team: true,
    line: 'A team badge: everyone who played in a match with nothing conceded.',
  },
];

/**
 * Class 2 — events. Stackable, no tiers, gold. A hat-trick is a thing that
 * happened, not a rung on a ladder: "3 hat-tricks" as a tier reads oddly where
 * "hat-trick ×3" doesn't.
 */
export const EVENT_BADGES = [
  {
    key: 'motm',
    class: 'event',
    label: 'Man of the Match',
    stat: 'motm',
    line: 'Voted in the changing room, one a game.',
  },
  {
    key: 'hat-trick',
    class: 'event',
    label: 'Hat-trick',
    stat: 'hatTricks',
    line: 'Three goals in one game. Two is a good afternoon; three has a name.',
  },
];

/**
 * Class 3 — season honours. Trophies, one per season, gold, and they are
 * exactly the honours board's rows, so the board and the badge shelf cannot
 * drift. They do not tier and do not stack into a bigger version: two Golden
 * Boots is the same trophy twice, shown as a year list.
 *
 * Player of the Season leads because it's the one the players vote on — and
 * the only one no formula produces, which is why it needs a row in
 * `season_awards` and an admin to type it in. `stat` is what the other three
 * are read off and `unit` is the word their mark is printed in — the cabinet
 * puts the mark under the winner's name, and "9" under a boot is a shirt number
 * until it says "9 goals". `key` is both the drawing and the `award_key` a voted
 * row carries.
 *
 * Most MOTM was a fifth here and is gone: it usually went to the same player
 * as Player of the Season, so it was a second trophy for one performance. It
 * survives as the Class 2 star, which is where a repeated event belongs.
 */
export const SEASON_AWARDS = [
  {
    key: 'player-of-the-season',
    class: 'trophy',
    label: 'Player of the Season',
    voted: true,
    line: 'Voted by the players at the end-of-season dinner.',
  },
  {
    key: 'golden-boot',
    class: 'trophy',
    label: 'Golden Boot',
    stat: 'goals',
    unit: 'goals',
    line: 'Most goals in a season. A tie is kept whole — both of them won it.',
  },
  {
    key: 'playmaker',
    class: 'trophy',
    label: 'Playmaker',
    stat: 'assists',
    unit: 'assists',
    line: 'Most assists in a season. One name for one award.',
  },
  {
    key: 'the-dependable',
    class: 'trophy',
    label: 'The Dependable',
    stat: 'appearances',
    unit: 'apps',
    // Most appearances, not ever-present: nobody was ever-present in 2025/26
    // and an award nobody can win in a squad where people miss games for
    // weddings is not an incentive.
    line: 'Most appearances in a season. Most, not every one.',
  },
];

/** Every badge in the system, in the order the board shows them. */
export const BADGES = [...CAREER_BADGES, ...EVENT_BADGES, ...SEASON_AWARDS];

/** One badge by key, or null — the badge page reads its key off the address. */
export function badgeByKey(key) {
  return BADGES.find((b) => b.key === key) ?? null;
}

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
 * competitions played in it, and the four trophies. Ties are kept whole on
 * the derived three — two players on nine goals both won the boot, and the
 * rows can't say which of them mattered more.
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
          : leadersIn(totals, a.stat)),
      })),
    };
  });
}

// ---------------------------------------------------------------------------
// Who holds what
// ---------------------------------------------------------------------------

/**
 * One row per player carrying everything the badges are counted from: the
 * career totals, the hat-tricks no total holds, and the date each career tier
 * fell. The dates are why this walks every appearance in order rather than
 * reading the totals — a total says what a player has, never when they got
 * there, and an earned badge that can't say when is a number, not a memory.
 */
function badgeRows(players, matches, appearances) {
  const matchById = new Map(matches.map((m) => [m.id, m]));
  const rows = new Map(
    playerTotals(players, matches, appearances).map((r) => [
      r.player.id,
      { ...r, hatTricks: 0, since: new Map() },
    ]),
  );
  const chrono = appearances
    .map((app) => ({ app, match: matchById.get(app.match_id) }))
    .filter(({ app, match }) => match && isPlayed(match) && !app.dropout && rows.has(app.player_id))
    .sort((a, b) => (a.match.date < b.match.date ? -1 : 1));

  const running = new Map();
  for (const { app, match } of chrono) {
    const row = rows.get(app.player_id);
    const tally = running.get(app.player_id)
      ?? { appearances: 0, goals: 0, assists: 0, cleanSheets: 0, motm: 0 };
    tally.appearances += 1;
    tally.goals += app.goals;
    tally.assists += app.assists;
    if (app.motm) tally.motm += 1;
    if (isCleanSheet(match)) tally.cleanSheets += 1;
    if (app.goals >= 3) row.hatTricks += 1;
    running.set(app.player_id, tally);
    for (const b of CAREER_BADGES) {
      for (const threshold of b.tiers) {
        const id = `${b.key}:${threshold}`;
        if (tally[b.stat] >= threshold && !row.since.has(id)) row.since.set(id, match.date);
      }
    }
  }
  return [...rows.values()];
}

/** The highest tier a count reaches, as an index into METALS, or -1. */
function tierIndex(count, tiers) {
  let index = -1;
  tiers.forEach((threshold, i) => {
    if (count >= threshold) index = i;
  });
  return index;
}

/**
 * One career badge as one player holds it: the metal, when it fell, and what
 * the next one costs. An unearned badge is still a badge — it comes back with
 * `metal: null` and the count to go, because a badge you can't see is not an
 * incentive.
 */
function careerBadge(row, family) {
  const count = row[family.stat];
  const i = tierIndex(count, family.tiers);
  return {
    ...family,
    count,
    metal: i < 0 ? null : METALS[i],
    since: i < 0 ? null : monthYear(row.since.get(`${family.key}:${family.tiers[i]}`)),
    next:
      i + 1 < family.tiers.length
        ? { metal: METALS[i + 1], threshold: family.tiers[i + 1], need: family.tiers[i + 1] - count }
        : null,
  };
}

/**
 * Every season each trophy was won in, newest first, keyed by badge. Read off
 * `seasonRecords` rather than worked out again, which is what stops the
 * honours board and the trophy shelf ever disagreeing.
 */
function trophySeasons(players, matches, appearances, seasonAwards) {
  const won = new Map(SEASON_AWARDS.map((a) => [a.key, []]));
  for (const season of seasonRecords(players, matches, appearances, seasonAwards)) {
    for (const award of season.awards) {
      if (award.leaders.length === 0) continue;
      won.get(award.key).push({ season: season.season, players: award.leaders, value: award.value });
    }
  }
  return won;
}

/**
 * One player's shelf, in three classes. Career badges are always all four,
 * held or not; events carry a count and trophies a year list, and both are
 * empty until they aren't — the page decides how to show a nought, but it
 * can't be told one isn't there.
 */
function shelf(row, won) {
  return {
    career: CAREER_BADGES.map((family) => careerBadge(row, family)),
    events: EVENT_BADGES.map((family) => ({ ...family, count: row[family.stat] })),
    trophies: SEASON_AWARDS.map((family) => ({
      ...family,
      seasons: won
        .get(family.key)
        .filter((win) => win.players.some((p) => p.id === row.player.id))
        .map((win) => win.season),
    })),
  };
}

/** One player's shelf — the player page's own call. */
export function playerBadges(player, players, matches, appearances, seasonAwards = []) {
  const row = badgeRows(players, matches, appearances).find((r) => r.player.id === player.id);
  if (!row) return { career: [], events: [], trophies: [] };
  return shelf(row, trophySeasons(players, matches, appearances, seasonAwards));
}

/**
 * The career badge one player is closest to, and what it costs — the whole of
 * "how far off it" on Home.
 *
 * Class 1 only: an event badge has no next rung and a trophy is won at the end
 * of a season rather than approached. Null when every career badge is at
 * diamond, which is a state worth naming rather than a blank — four seasons of
 * Saturdays and every rung climbed.
 *
 * Ties go to board order, because `sort` is stable and `career` arrives in it:
 * with a debut and a first goal both one away, the appearance is the one the
 * player is actually about to earn.
 */
export function nextCareerBadge(badges) {
  return badges.career.filter((b) => b.next).sort((a, b) => a.next.need - b.next.need)[0] ?? null;
}

/**
 * Every player's shelf at once, keyed by id. The squad cards need one per name
 * on a single screen, and `playerBadges` walks the whole appearance log per
 * call — a pass over the season for every player in it. One pass, same shelves.
 */
export function squadBadges(players, matches, appearances, seasonAwards = []) {
  const won = trophySeasons(players, matches, appearances, seasonAwards);
  return new Map(
    badgeRows(players, matches, appearances).map((row) => [row.player.id, shelf(row, won)]),
  );
}

/**
 * The badges a player actually holds, in the board's own order, each carrying
 * the metal it is drawn in and the mark that says how it was earned — the tier
 * for a career badge, the count for a stackable, the seasons for a trophy. Only
 * Class 1 tiers, so the other two arrive gold whoever holds them. The mark is
 * how a row of drawings says out loud what it is: a squad tile prints none of
 * them, and names all of them in the row's own label.
 *
 * Held only, unlike the shelf on a player's own page: that page argues a badge
 * you can't see is not an incentive, and it is right, but a squad's worth of
 * cards each carrying four drained drawings is a couple of hundred grey shapes
 * and reads as absence. A card says what somebody has; the page it links to says
 * what is next.
 */
export function heldBadges(badges) {
  if (!badges) return [];
  return [
    ...badges.career.filter((b) => b.metal).map((b) => ({ ...b, mark: b.metal })),
    ...badges.events
      .filter((b) => b.count > 0)
      .map((b) => ({ ...b, metal: 'gold', mark: `×${b.count}` })),
    ...badges.trophies
      .filter((b) => b.seasons.length > 0)
      .map((b) => ({ ...b, metal: 'gold', mark: b.seasons.join(', ') })),
  ];
}

/** Rows holding at least `threshold` of a stat, most first, then by name. */
function holdersOf(rows, stat, threshold) {
  return rows
    .filter((r) => r[stat] >= threshold)
    .sort((a, b) => b[stat] - a[stat] || a.player.name.localeCompare(b.player.name));
}

/**
 * The badge board: every badge in the club and how far it has got. A career
 * badge reports its four tiers and who holds each, which is the story — where
 * the gold stops says more about a young club than a list of names does.
 */
export function clubBadges(players, matches, appearances, seasonAwards = []) {
  const rows = badgeRows(players, matches, appearances);
  const won = trophySeasons(players, matches, appearances, seasonAwards);
  return {
    career: CAREER_BADGES.map((family) => {
      const tiers = family.tiers.map((threshold, i) => ({
        metal: METALS[i],
        threshold,
        holders: holdersOf(rows, family.stat, threshold).length,
      }));
      const held = tiers.filter((t) => t.holders > 0);
      const leader = holdersOf(rows, family.stat, family.tiers[0])[0] ?? null;
      return {
        ...family,
        tiers,
        holders: tiers[0].holders,
        // The best metal anyone in the club holds, which is what the board's
        // icon wears. Null while nobody holds the badge at all.
        top: held.length > 0 ? held[held.length - 1].metal : null,
        leader: leader ? { player: leader.player, count: leader[family.stat] } : null,
      };
    }),
    events: EVENT_BADGES.map((family) => {
      const holders = holdersOf(rows, family.stat, 1);
      return {
        ...family,
        awarded: rows.reduce((total, r) => total + r[family.stat], 0),
        holders: holders.length,
        leader: holders[0] ? { player: holders[0].player, count: holders[0][family.stat] } : null,
      };
    }),
    trophies: SEASON_AWARDS.map((family) => ({
      ...family,
      wins: won.get(family.key),
      latest: won.get(family.key)[0] ?? null,
    })),
  };
}

/** How many holders a badge page lists as closest, and how many names a tier
 *  shows before it counts the rest. Enough to find yourself, few enough that
 *  the page stays a page. */
const LISTED = 12;

/** The names a page shows, and how many it left out. The cap is soft by two:
 *  hiding one name behind "+1 more" reads as a fault, not as a limit. */
function capped(rows) {
  const shown = rows.length <= LISTED + 2 ? rows : rows.slice(0, LISTED);
  return { shown, more: rows.length - shown.length };
}

/**
 * One badge, everybody who holds it, and who is closest to the next tier —
 * the page a badge can be linked into the group chat with. Null for a key
 * nothing is drawn for, which is what the route turns into a not-found.
 */
export function badgeDetail(key, players, matches, appearances, seasonAwards = []) {
  const family = badgeByKey(key);
  if (!family) return null;
  const rows = badgeRows(players, matches, appearances);

  if (family.class === 'trophy') {
    const wins = trophySeasons(players, matches, appearances, seasonAwards).get(family.key);
    // A trophy held twice is the same trophy twice, so the roll counts seasons
    // rather than stacking into a bigger badge.
    const roll = new Map();
    for (const win of wins) {
      for (const player of win.players) {
        if (!roll.has(player.id)) roll.set(player.id, { player, seasons: [] });
        roll.get(player.id).seasons.push(win.season);
      }
    }
    return {
      badge: family,
      wins,
      roll: [...roll.values()].sort(
        (a, b) => b.seasons.length - a.seasons.length || a.player.name.localeCompare(b.player.name),
      ),
    };
  }

  if (family.class === 'event') {
    const { shown, more } = capped(holdersOf(rows, family.stat, 1));
    return {
      badge: family,
      awarded: rows.reduce((total, r) => total + r[family.stat], 0),
      holders: shown.map((r) => ({ player: r.player, count: r[family.stat] })),
      more,
    };
  }

  const tiers = family.tiers.map((threshold, i) => {
    const holders = holdersOf(rows, family.stat, threshold);
    const { shown, more } = capped(holders);
    return {
      metal: METALS[i],
      threshold,
      count: holders.length,
      holders: shown.map((r) => ({
        player: r.player,
        count: r[family.stat],
        since: monthYear(r.since.get(`${family.key}:${threshold}`)),
      })),
      more,
    };
  });

  // Who's closest: nearest to their own next tier, and only players who have
  // been picked at least once. A name that has never appeared isn't chasing
  // anything yet — their next badge is a debut, and that's the appearances one.
  const chasing = rows
    .filter((r) => r.appearances > 0 && tierIndex(r[family.stat], family.tiers) + 1 < family.tiers.length)
    .map((r) => {
      const next = family.tiers[tierIndex(r[family.stat], family.tiers) + 1];
      return {
        player: r.player,
        count: r[family.stat],
        metal: METALS[family.tiers.indexOf(next)],
        need: next - r[family.stat],
      };
    })
    .sort((a, b) => a.need - b.need || b.count - a.count || a.player.name.localeCompare(b.player.name));

  return { badge: family, tiers, chasing: capped(chasing).shown };
}
