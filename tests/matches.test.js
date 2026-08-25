// lib/matches.js — the derivations every page reads.
//
// Phase 10 changes how the current season is worked out and rebuilds the
// result row, and both of those run through this module. A screenshot won't
// catch an off-by-one in a streak or a home/away score that's the wrong way
// round, which is the argument for these being here at all.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DATASETS } from '../fixtures/datasets.js';
import {
  CLUB_NAME,
  currentSeasonOf,
  currentStreak,
  fixtures,
  isCleanSheet,
  isPlayed,
  latestResult,
  matchContext,
  matchHomeAway,
  matchPoints,
  opponentMatches,
  opponentSlug,
  playedMatches,
  resultOf,
  seasonLadder,
  seasonSummary,
  seasonsOf,
  slugify,
  venueTeam,
} from '../src/lib/matches.js';

const mid = DATASETS['mid-season'].data;
const pre = DATASETS['pre-season'].data;
const on = (data, date, opponent) =>
  data.matches.find((m) => m.date === date && m.opponent === opponent);

test('a match is played when it has both scores', () => {
  assert.equal(isPlayed({ goals_for: 0, goals_against: 0 }), true);
  assert.equal(isPlayed({ goals_for: 2, goals_against: null }), false);
  assert.equal(isPlayed({ goals_for: null, goals_against: null }), false);
});

test('the stored result wins, and an absent one is derived', () => {
  // The column is written on every save, but an imported row can disagree with
  // its own scoreline and the site shows what was recorded.
  assert.equal(resultOf({ result: 'W', goals_for: 1, goals_against: 3 }), 'W');
  assert.equal(resultOf({ result: null, goals_for: 3, goals_against: 1 }), 'W');
  assert.equal(resultOf({ result: null, goals_for: 1, goals_against: 1 }), 'D');
  assert.equal(resultOf({ result: null, goals_for: 0, goals_against: 1 }), 'L');
  assert.equal(resultOf({ result: null, goals_for: null, goals_against: null }), null);
});

test('seasonsOf stays row-based, newest first', () => {
  // Deliberate, and Phase 10 keeps it: a season picker should list a season
  // somebody has entered fixtures for, even before a ball is kicked in it.
  assert.deepEqual(seasonsOf(pre.matches), ['2026/27', '2025/26']);
  assert.deepEqual(seasonsOf(mid.matches), ['2025/26']);
});

test('the newest season with a row is not always the newest with a result', () => {
  // The bug Phase 10 fixes, stated as a test so the fix has something to turn.
  const [newestRow] = seasonsOf(pre.matches);
  assert.equal(newestRow, '2026/27');
  assert.equal(latestResult(pre.matches).season, '2025/26');
});

test('currentSeasonOf follows the result, not the fixture entered on top of it', () => {
  assert.equal(currentSeasonOf(pre.matches), '2025/26');
  assert.equal(currentSeasonOf(mid.matches), '2025/26');
  assert.equal(currentSeasonOf([]), null);
  // Nothing played anywhere yet — no result to prefer, so it falls back to
  // the newest row rather than returning null on a brand new club.
  const onlyFixtures = pre.matches.filter((m) => !isPlayed(m));
  assert.equal(currentSeasonOf(onlyFixtures), seasonsOf(onlyFixtures)[0]);
});

test('results run newest first, fixtures soonest first', () => {
  const played = playedMatches(mid.matches);
  assert.ok(played.every((m, i) => i === 0 || played[i - 1].date >= m.date));
  const upcoming = fixtures(mid.matches);
  assert.ok(upcoming.every((m, i) => i === 0 || upcoming[i - 1].date <= m.date));
  assert.ok(upcoming.every((m) => !isPlayed(m)));
});

test('a season summary counts only played matches', () => {
  const summary = seasonSummary(mid.matches);
  assert.equal(summary.played, playedMatches(mid.matches).length);
  assert.equal(summary.won + summary.drawn + summary.lost, summary.played);
  assert.deepEqual(summary, { played: 16, won: 5, drawn: 3, lost: 8, goalsFor: 39, goalsAgainst: 43 });
});

test('a streak reads from the newest result backwards', () => {
  assert.deepEqual(currentStreak([
    { date: '2026-03-07', goals_for: 4, goals_against: 1, result: 'W' },
    { date: '2026-02-21', goals_for: 2, goals_against: 0, result: 'W' },
    { date: '2026-01-24', goals_for: 1, goals_against: 1, result: 'D' },
  ]), { result: 'W', count: 2 });
  assert.equal(currentStreak([]), null);
  assert.equal(currentStreak(fixtures(mid.matches)), null, 'fixtures are not a streak');
});

test('a clean sheet is nil conceded, and a walkover is one', () => {
  const walkover = mid.matches.find((m) => m.walkover);
  assert.equal(isCleanSheet(walkover), true);
  assert.equal(isCleanSheet(on(mid, '2026-02-07', 'Wellington IX')), true);
  assert.equal(isCleanSheet(on(mid, '2026-03-14', 'Old Stoics')), false);
  assert.equal(isCleanSheet({ goals_for: null, goals_against: null }), false);
});

test('home and away follow the venue, and an unrecorded one puts us at home', () => {
  const home = matchHomeAway({ venue: 'H', opponent: 'Old Stoics', goals_for: 4, goals_against: 1 });
  assert.deepEqual(home, { homeTeam: CLUB_NAME, awayTeam: 'Old Stoics', homeGoals: 4, awayGoals: 1 });
  const away = matchHomeAway({ venue: 'A', opponent: 'Old Stoics', goals_for: 4, goals_against: 1 });
  assert.deepEqual(away, { homeTeam: 'Old Stoics', awayTeam: CLUB_NAME, homeGoals: 1, awayGoals: 4 });
  assert.equal(matchHomeAway({ venue: null, opponent: 'X', goals_for: 1, goals_against: 0 }).homeTeam, CLUB_NAME);
});

test('points are 3/1/0, except a walkover loss in a league game costs 3', () => {
  const win = { goals_for: 3, goals_against: 0, competition: 'League' };
  const draw = { goals_for: 1, goals_against: 1, competition: 'League' };
  const loss = { goals_for: 0, goals_against: 1, competition: 'League' };
  assert.equal(matchPoints(win), 3);
  assert.equal(matchPoints(draw), 1);
  assert.equal(matchPoints(loss), 0);

  const leagueWalkoverLoss = { goals_for: 0, goals_against: 3, competition: 'League', walkover: true };
  assert.equal(matchPoints(leagueWalkoverLoss), -3);

  // Case/whitespace-insensitive, same as seasonPointsComparison's own check.
  assert.equal(matchPoints({ ...leagueWalkoverLoss, competition: ' league ' }), -3);

  // Only a loss is deducted — a walkover we won is still a plain win.
  const leagueWalkoverWin = { goals_for: 3, goals_against: 0, competition: 'League', walkover: true };
  assert.equal(matchPoints(leagueWalkoverWin), 3);

  // Only league games carry the deduction — a cup or friendly walkover loss
  // has no standings to be deducted from.
  const cupWalkoverLoss = { goals_for: 0, goals_against: 3, competition: 'Cup', walkover: true };
  assert.equal(matchPoints(cupWalkoverLoss), 0);
});

test('the venue team is ours at home, theirs away, nobody otherwise', () => {
  const stoics = mid.teams.find((t) => t.name === 'Old Stoics');
  const us = mid.teams.find((t) => t.is_club);
  assert.equal(venueTeam({ venue: 'H' }, mid.teams).id, us.id);
  assert.equal(venueTeam({ venue: 'A', opponent_team_id: stoics.id }, mid.teams).id, stoics.id);
  assert.equal(venueTeam({ venue: null, opponent_team_id: stoics.id }, mid.teams), null);
});

test('an opponent slug survives punctuation and resolves back to its matches', () => {
  assert.equal(slugify("Old King's Scholars"), 'old-king-s-scholars');
  const resolved = opponentMatches(mid.matches, mid.teams, 'old-stoics');
  assert.equal(resolved.team.name, 'Old Stoics');
  assert.equal(resolved.matches.length, 3);
  assert.equal(opponentMatches(mid.matches, mid.teams, 'no-such-club'), null);
  assert.equal(opponentSlug(mid.teams, on(mid, '2026-03-07', 'Old Stoics')), 'old-stoics');
  // A row that predates the teams migration still resolves, off its free text.
  assert.equal(opponentSlug(mid.teams, { opponent: 'Old Stoics' }), 'old-stoics');
});

test('match context names the scorers, the debut and the dropout', () => {
  const match = on(mid, '2026-02-07', 'Wellington IX');
  const ctx = matchContext(match, mid.players, mid.matches, mid.appearances);
  const gus = mid.players.find((p) => p.name === 'Gus Hill');
  assert.equal(ctx.squad.length, 12, 'the dropout is in the squad list');
  assert.deepEqual(ctx.dropoutNames, ['Bertie Morgan']);
  assert.deepEqual(ctx.scorers.map((s) => s.player.name).sort(), ['Gus Hill', 'Tom Simeon']);
  assert.deepEqual(ctx.motm.map((s) => s.player.name), ['Gus Hill']);
  assert.ok(ctx.debutIds.has(gus.id), 'a first appearance is a debut');
  assert.equal(ctx.margin, 2);
});

test('match context survives a walkover, which has no team sheet at all', () => {
  const walkover = mid.matches.find((m) => m.walkover);
  const ctx = matchContext(walkover, mid.players, mid.matches, mid.appearances);
  assert.deepEqual(ctx.squad, []);
  assert.deepEqual(ctx.scorers, []);
  assert.deepEqual(ctx.motm, []);
  assert.equal(ctx.margin, 3);
});

test('the ladder runs newest first, with the goal difference each game left behind', () => {
  const ladder = seasonLadder(mid.matches, '2025/26');
  const played = playedMatches(mid.matches.filter((m) => m.season === '2025/26'));
  const ahead = fixtures(mid.matches.filter((m) => m.season === '2025/26'));

  assert.equal(ladder.length, played.length + ahead.length, 'every match in the season is a rung');
  assert.ok(
    ladder.every((r, i) => i === 0 || ladder[i - 1].match.date >= r.match.date),
    'one direction through time, fixtures included',
  );

  // The fixtures are the front of the ladder and carry nothing: a difference
  // is a thing a game leaves behind, and these haven't been played.
  const front = ladder.slice(0, ahead.length);
  assert.deepEqual(front.map((r) => r.gd), front.map(() => null));
  assert.deepEqual(
    front.map((r) => r.match.date),
    ['2026-04-11', '2026-03-28'],
    'the furthest fixture is the top rung',
  );

  // The last rung is the first game of the season, so its running figure is
  // just that game's own, and the first rung is the season's total.
  const oldest = ladder.at(-1);
  assert.equal(oldest.gd, oldest.match.goals_for - oldest.match.goals_against);
  const total = played.reduce((n, m) => n + m.goals_for - m.goals_against, 0);
  assert.equal(ladder[ahead.length].gd, total);

  // And every step between the two is one game's difference, walked backwards.
  const results = ladder.slice(ahead.length);
  for (let i = 0; i < results.length - 1; i += 1) {
    const { match, gd } = results[i];
    assert.equal(gd - results[i + 1].gd, match.goals_for - match.goals_against);
  }
});

test('a walkover is a rung like any other — awarded goals still count', () => {
  const ladder = seasonLadder(mid.matches, '2025/26');
  const walkover = mid.matches.find((m) => m.walkover);
  const at = ladder.findIndex((r) => r.match.id === walkover.id);
  assert.notEqual(at, -1, 'the walkover is on the ladder');
  // 3-0 awarded with no team sheet: the ladder reads the scoreline, not the
  // appearance rows, so the running figure moves by three like any other 3-0.
  assert.equal(ladder[at].gd - ladder[at + 1].gd, 3);
});

test('a season with nothing played is all fixtures and no figures', () => {
  const ladder = seasonLadder(pre.matches, '2026/27');
  assert.equal(ladder.length, 4);
  assert.ok(ladder.every((r) => r.gd === null), 'nothing has been played, so nothing carries a difference');
  assert.deepEqual(
    ladder.map((r) => r.match.date),
    ['2026-10-03', '2026-09-26', '2026-09-12', '2026-09-05'],
  );
});

test('a season nobody has entered is an empty ladder, not a crash', () => {
  assert.deepEqual(seasonLadder(mid.matches, '2099/00'), []);
  assert.deepEqual(seasonLadder([], null), []);
});
