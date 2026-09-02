// lib/me.js — Phase 48's derivation, trimmed by the phase that removed the
// next-badge chase from the card (nearly every reader was shown the same
// grey "1 to clean sheet" badge, which said nothing).
//
// The whole of what Home says to a player about themselves goes through one
// function, and the property a screenshot can't catch is that the figures
// are this season's rather than the career's. Get that wrong and the card is
// still a card — it just tells the reader something untrue about their own
// season, which is the one thing this site cannot do.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DATASETS } from '../fixtures/datasets.js';
import { ME_COOKIE as HARNESS_COOKIE } from '../scripts/site-map.js';
import { ME_COOKIE, meSummary } from '../src/lib/me.js';

const mid = DATASETS['mid-season'].data;
const named = (name) => mid.players.find((p) => p.name === name);

const summaryFor = (name) => {
  const player = named(name);
  return meSummary(player, mid.matches, mid.appearances);
};

test('the figures are this season, not the career', () => {
  // Two seasons, one appearance each, and the second is the current one — the
  // case the fixture's single season cannot produce and the one that matters:
  // the card's figures must be the season's, not both games' worth.
  const player = { id: 'p1', name: 'Alice' };
  const matches = [
    { id: 'm1', season: '2024/25', date: '2025-03-01', goals_for: 1, goals_against: 0 },
    { id: 'm2', season: '2025/26', date: '2026-03-01', goals_for: 2, goals_against: 1 },
  ];
  const app = (id) => ({
    match_id: id, player_id: 'p1', started: true, goals: 0, assists: 0,
    yellows: 0, reds: 0, motm: false, dropout: false,
  });
  const mine = meSummary(player, matches, [app('m1'), app('m2')]);

  assert.equal(mine.apps, 1, 'one appearance in the current season');
  assert.equal(mine.played, 1, 'and the club played one game in it');
});

test('played is the club\'s games, not the player\'s — the denominator of a selection record', () => {
  const mine = summaryFor('Owen Gibbons');
  const played = mid.matches.filter(
    (m) => m.season === '2025/26' && m.goals_for != null && m.goals_against != null,
  ).length;
  assert.ok(played > 0);
  assert.equal(mine.played, played);
  assert.ok(mine.apps <= mine.played);
});

test('a player who has never been picked gets zeroes', () => {
  const mine = summaryFor('Alex Hannon');
  assert.equal(mine.apps, 0);
  assert.equal(mine.goals, 0);
  assert.equal(mine.assists, 0);
});

test('a club with no matches at all still returns a summary, all zero', () => {
  // The state the site opens in before anything is entered, and the state
  // Home's `pre-season` fixture is a step from.
  const player = named('Owen Gibbons');
  const mine = meSummary(player, [], []);
  assert.equal(mine.played, 0);
  assert.equal(mine.apps, 0);
  assert.equal(mine.goals, 0);
  assert.equal(mine.assists, 0);
});

test('the harness and the site name the same cookie', () => {
  // scripts/site-map.js keeps its own copy so the harness can boot a route as
  // a reader who has picked a name, without a loader for src/'s imports. Two
  // places, one string, and this is what holds them together.
  assert.equal(HARNESS_COOKIE, ME_COOKIE);
});
