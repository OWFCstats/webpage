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
  opponentMatches,
  opponentSlug,
  playedMatches,
  resultOf,
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
