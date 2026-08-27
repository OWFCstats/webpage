// The write side's own derivations: what is outstanding, and which fixture a
// result belongs to. Nothing here is stored — it is the same rows every public
// page reads, asked a different question.

import { currentSeasonOf, isPlayed, latestResult, playedMatches } from './matches.js';

/**
 * The fixture a result is about to be entered against, if the club already put
 * it in the diary. Matched on opponent and date, because that pair is what an
 * admin retypes on a Sunday morning without knowing a row for it exists.
 *
 * This is what stops the same game existing twice. Before it, "Add result"
 * only ever inserted, so a fixture entered in advance stayed on the site as an
 * upcoming game forever — Home showed one match as both the last result and
 * the next fixture — and the kick-off time and venue typed in with the fixture
 * were lost with it.
 */
export function fixtureFor(matches, { date, opponentTeamId, opponent }) {
  if (!date) return null;
  return (
    matches.find(
      (m) =>
        !isPlayed(m) &&
        m.date === date &&
        (opponentTeamId
          ? m.opponent_team_id === opponentTeamId
          : m.opponent?.toLowerCase() === opponent?.toLowerCase()),
    ) ?? null
  );
}

/** Fixtures with no score, soonest first — the diary the wizard opens on.
 *  A date already gone by sorts to the top: that is the game just played, and
 *  it is the one the admin is here to fill in. */
export function fixturesToFill(matches, today) {
  return matches
    .filter((m) => !isPlayed(m))
    .slice()
    .sort((a, b) => {
      const gone = (m) => (m.date <= today ? 0 : 1);
      return gone(a) - gone(b) || (gone(a) === 0 ? (a.date < b.date ? 1 : -1) : a.date < b.date ? -1 : 1);
    });
}

/**
 * Everything the club has left half-entered, worst first.
 *
 * The order is how broken each one leaves the site, not how quick it is to
 * fix. A fixture the squad has already played but nobody entered means Home
 * still counts down to a game that happened — the site is lying on its first
 * screen. A result with no lineup means nobody got credit for playing, which
 * is the whole point of the site. A missing MOTM is one name; a stale league
 * table is one screen out of date. Neither of those is wrong, only late.
 *
 * `today` is passed in rather than read here so the harness can pin it and a
 * test can assert on it.
 */
export function outstanding(
  { matches, appearances, leagueRows, seasonAwards },
  today,
) {
  const withLineup = new Set(appearances.map((a) => a.match_id));
  const withMotm = new Set(appearances.filter((a) => a.motm).map((a) => a.match_id));
  const jobs = [];

  // A fixture whose date has gone by and still has no score.
  for (const m of matches) {
    if (isPlayed(m) || m.date > today) continue;
    jobs.push({
      kind: 'result',
      match: m,
      title: `vs ${m.opponent}`,
      line: 'was played but has no score — the site still counts down to it.',
      action: 'Enter result',
      to: `/admin/new-result?fixture=${m.id}`,
    });
  }

  // A score with no team sheet. A walkover has no lineup by design, so it is
  // excluded rather than nagged about forever.
  for (const m of matches) {
    if (!isPlayed(m) || m.walkover || withLineup.has(m.id)) continue;
    jobs.push({
      kind: 'lineup',
      match: m,
      title: `vs ${m.opponent}`,
      line: 'has a score but no lineup — no player gets credit for it yet.',
      action: 'Enter lineup',
      to: `/admin/matches/${m.id}/lineup`,
    });
  }

  // A team sheet with nobody marked. One a game, per the badge.
  for (const m of matches) {
    if (!isPlayed(m) || m.walkover || !withLineup.has(m.id) || withMotm.has(m.id)) continue;
    jobs.push({
      kind: 'motm',
      match: m,
      title: `vs ${m.opponent}`,
      line: 'has no Man of the Match.',
      action: 'Pick one',
      to: `/admin/matches/${m.id}/lineup`,
    });
  }

  // The published table, older than our own most recent result. Only worth
  // saying once a table exists — a season nobody has entered one for is not
  // out of date, it is empty, and the League page says so itself.
  const season = currentSeasonOf(matches);
  const seasonRows = leagueRows.filter((r) => r.season === season);
  const last = latestResult(matches.filter((m) => m.season === season));
  if (seasonRows.length > 0 && last) {
    const updated = seasonRows.reduce(
      (latest, r) => (latest == null || r.updated_at > latest ? r.updated_at : latest),
      null,
    );
    if (updated && updated.slice(0, 10) < last.date) {
      jobs.push({
        kind: 'table',
        title: 'The league table',
        line: `hasn't been updated since before the ${last.opponent} game.`,
        action: 'Update it',
        to: '/admin/league',
      });
    }
  }

  // Player of the Season, once a season has stopped being the current one.
  // Nagging about the season still being played would nag all year.
  const voted = new Set(
    seasonAwards.filter((r) => r.award_key === 'player-of-the-season').map((r) => r.season),
  );
  const finished = [...new Set(playedMatches(matches).map((m) => m.season))].filter(
    (s) => s !== season,
  );
  for (const s of finished) {
    if (voted.has(s)) continue;
    jobs.push({
      kind: 'award',
      title: `${s} has no Player of the Season`,
      line: 'the honours board is still waiting on the vote.',
      action: 'Record it',
      to: '/admin/awards',
    });
  }

  return jobs;
}

/** The wizard's inputs, empty. Here rather than in the page because it is the
 *  shape of a match row, not a layout. */
export const blankResultForm = () => ({
  season: '',
  date: '',
  kickoff_time: '',
  opponent: '',
  opponent_team_id: '',
  competition: 'League',
  venue: '',
  goals_for: '',
  goals_against: '',
  own_goals_for: 0,
});

/** A fixture row as wizard inputs — carrying the kick-off time and venue that
 *  were typed in when it was scheduled, which retyping the match lost. */
export const resultFormFrom = (f) => ({
  ...blankResultForm(),
  season: f.season,
  date: f.date,
  kickoff_time: f.kickoff_time ?? '',
  opponent: f.opponent,
  opponent_team_id: f.opponent_team_id ?? '',
  competition: f.competition ?? 'League',
  venue: f.venue ?? '',
});

/** Today as the `date` column stores it, so the two can be compared as strings. */
export function todayISO(now = new Date()) {
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}
