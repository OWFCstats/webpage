// lib/charts.js — the two shapes Phase 64 adds, and the traps in each.
//
// Both are per-player figures with a divisor or a bucket in them, which is the
// class of bug a screenshot cannot catch: a chart drawn from a wrong count
// still looks like a chart. The scatter's trap is the player who has played
// nothing, and the spread's is a game count with nobody on it.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DATASETS } from '../fixtures/datasets.js';
import { appearanceSpread, contributionScatter } from '../src/lib/charts.js';
import { playedMatches } from '../src/lib/matches.js';
import { playerTotals } from '../src/lib/players.js';

const player = (id, name) => ({ id, name });
const match = (id) => ({ id, season: '2025/26', date: '2026-01-01', opponent: 'X', goals_for: 1, goals_against: 0, result: 'W' });
const app = (matchId, playerId, goals = 0, assists = 0, extra = {}) => ({
  match_id: matchId, player_id: playerId, goals, assists, yellows: 0, reds: 0,
  started: true, motm: false, dropout: false, ...extra,
});

const MATCHES = [match('m1'), match('m2'), match('m3'), match('m4')];

test('a player who has played nothing is not a dot at the origin', () => {
  const players = [player('a', 'Ann Zeta'), player('b', 'Bob Young'), player('c', 'Never Played')];
  const apps = [app('m1', 'a', 1), app('m1', 'b'), app('m2', 'a')];
  const { rows, points } = contributionScatter(players, MATCHES, apps);
  assert.deepEqual(rows.map((r) => r.name), ['Ann Zeta', 'Bob Young']);
  assert.ok(points.every((p) => p.appearances > 0));
  // The trap: a zero-appearance player bunched at (0, 0) would be the biggest
  // dot on a chart about how much people play.
  assert.equal(points.find((p) => p.appearances === 0), undefined);
});

test('players on the same spot are one dot, counted and named', () => {
  const players = [player('a', 'Ann'), player('b', 'Bob'), player('c', 'Cal')];
  const apps = [app('m1', 'a', 1), app('m1', 'b', 1), app('m1', 'c'), app('m2', 'c')];
  const { points } = contributionScatter(players, MATCHES, apps);
  const shared = points.find((p) => p.appearances === 1 && p.contributions === 1);
  assert.equal(shared.count, 2);
  assert.deepEqual(shared.names.sort(), ['Ann', 'Bob']);
  assert.equal(points.length, 2);
});

test('a contribution is a goal or an assist, and the leader is by the sum', () => {
  const players = [player('a', 'Scorer'), player('b', 'Provider')];
  const apps = [app('m1', 'a', 3), app('m1', 'b', 0, 4)];
  const { rows, leader } = contributionScatter(players, MATCHES, apps);
  assert.equal(leader.name, 'Provider');
  assert.equal(leader.contributions, 4);
  assert.equal(rows.find((r) => r.name === 'Scorer').contributions, 3);
});

test('the diagonal stops at whichever axis runs out first', () => {
  const players = [player('a', 'Ann')];
  // Four games, one contribution: the y axis tops out at 1, so a y = x line
  // drawn to x = 4 would leave the plot.
  const apps = [app('m1', 'a', 1), app('m2', 'a'), app('m3', 'a'), app('m4', 'a')];
  const { reference, maxApps, maxContributions } = contributionScatter(players, MATCHES, apps);
  assert.equal(maxApps, 4);
  assert.equal(maxContributions, 1);
  assert.equal(reference, 1);
});

test('above the line is a contribution a game or better, ties included', () => {
  const players = [player('a', 'Exactly'), player('b', 'Below')];
  const apps = [app('m1', 'a', 1), app('m2', 'a', 1), app('m1', 'b', 1), app('m2', 'b')];
  const { above } = contributionScatter(players, MATCHES, apps);
  assert.equal(above, 1);
});

test('the spread has a bar per game count, zeroes included', () => {
  const players = [player('a', 'Ann'), player('b', 'Bob')];
  const apps = [app('m1', 'a'), app('m2', 'a'), app('m3', 'a'), app('m4', 'a'), app('m1', 'b')];
  const { bars, used, played } = appearanceSpread(players, MATCHES, apps);
  assert.equal(played, 4);
  assert.equal(used, 2);
  assert.deepEqual(bars, [
    { games: 1, players: 1 },
    { games: 2, players: 0 },
    { games: 3, players: 0 },
    { games: 4, players: 1 },
  ]);
});

test('half a season rounds up, so the core is not overstated', () => {
  const players = [player('a', 'Ann'), player('b', 'Bob')];
  const three = [match('m1'), match('m2'), match('m3')];
  // Three games: half is two, so one game is not half a season.
  const apps = [app('m1', 'a'), app('m2', 'a'), app('m1', 'b')];
  const { half, core } = appearanceSpread(players, three, apps);
  assert.equal(half, 2);
  assert.equal(core, 1);
});

test('a dropout is not an appearance in either chart', () => {
  const players = [player('a', 'Ann')];
  const apps = [app('m1', 'a', 0, 0, { dropout: true }), app('m2', 'a', 1)];
  const { rows } = contributionScatter(players, MATCHES, apps);
  assert.equal(rows[0].appearances, 1);
  const { used, bars } = appearanceSpread(players, MATCHES, apps);
  assert.equal(used, 1);
  assert.equal(bars[0].players, 1);
});

test('nothing played gives no dots, no bars and no leader', () => {
  const { rows, points, leader, reference } = contributionScatter([player('a', 'Ann')], [], []);
  assert.deepEqual(rows, []);
  assert.deepEqual(points, []);
  assert.equal(leader, null);
  assert.equal(reference, 0);
  const spread = appearanceSpread([player('a', 'Ann')], [], []);
  assert.deepEqual(spread.bars, []);
  assert.equal(spread.used, 0);
  assert.equal(spread.core, 0);
});

for (const [name, dataset] of Object.entries(DATASETS)) {
  const { players, matches, appearances } = dataset.data;
  const season = '2025/26';
  const pool = matches.filter((m) => m.season === season);

  test(`${name}: every dot accounts for exactly one player who played`, () => {
    const { rows, points } = contributionScatter(players, pool, appearances);
    const totals = playerTotals(players, pool, appearances).filter((r) => r.appearances > 0);
    assert.equal(rows.length, totals.length);
    assert.equal(points.reduce((sum, p) => sum + p.count, 0), rows.length);
  });

  test(`${name}: the spread adds up to the squad, and runs to the season's length`, () => {
    const { bars, used, played } = appearanceSpread(players, pool, appearances);
    assert.equal(played, playedMatches(pool).length);
    assert.equal(bars.length, played);
    assert.equal(bars.reduce((sum, b) => sum + b.players, 0), used);
    // Nobody can have played more games than there were.
    assert.ok(bars.every((b) => b.games <= played));
  });
}
