// lib/me.js and awards.js → nextCareerBadge — Phase 48's derivation.
//
// The whole of what Home says to a player about themselves goes through one
// function, and two of its properties are the kind a screenshot can't catch:
// the figures are this season's while the badge is career, and "how far off it"
// has to be the nearest rung rather than the first one in the list. Get either
// wrong and the card is still a card — it just tells the reader something
// untrue about their own season, which is the one thing this site cannot do.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DATASETS } from '../fixtures/datasets.js';
import { ME_COOKIE as HARNESS_COOKIE } from '../scripts/site-map.js';
import { ME_COOKIE, meSummary } from '../src/lib/me.js';
import { nextCareerBadge, playerBadges } from '../src/lib/awards.js';

const mid = DATASETS['mid-season'].data;
const named = (name) => mid.players.find((p) => p.name === name);

const summaryFor = (name) => {
  const player = named(name);
  return meSummary(player, mid.players, mid.matches, mid.appearances, mid.seasonAwards);
};

const family = (key, count, tiers) => ({
  key,
  label: key,
  next: count < tiers.at(-1) ? { need: tiers.find((t) => t > count) - count } : null,
});

test('the next badge is the nearest rung, not the first family in the list', () => {
  // Appearances is four away, goals one. The board lists appearances first.
  const badges = {
    career: [family('appearances', 21, [1, 10, 25, 50]), family('goals', 4, [1, 5, 15, 30])],
  };
  assert.equal(nextCareerBadge(badges).key, 'goals');
});

test('a tie goes to board order — the one they are actually about to earn', () => {
  const badges = {
    career: [family('appearances', 9, [1, 10, 25, 50]), family('goals', 4, [1, 5, 15, 30])],
  };
  assert.equal(nextCareerBadge(badges).key, 'appearances');
});

test('every career badge at diamond has no next rung, and says so with null', () => {
  const badges = { career: [family('appearances', 50, [1, 10, 25, 50])] };
  assert.equal(nextCareerBadge(badges), null);
});

test('a player with no shelf at all — no rows — has no next badge either', () => {
  assert.equal(nextCareerBadge({ career: [] }), null);
});

test('the figures are this season and the badge is career', () => {
  // Two seasons, one appearance each, and the second is the current one — the
  // case the fixture's single season cannot produce and the one that matters:
  // the card's figures must be the season's while the badge counts the career,
  // because a badge is a career thing and "1 to silver" off a season total
  // would be a different and wrong number.
  const player = { id: 'p1', name: 'Alice' };
  const matches = [
    { id: 'm1', season: '2024/25', date: '2025-03-01', goals_for: 1, goals_against: 0 },
    { id: 'm2', season: '2025/26', date: '2026-03-01', goals_for: 2, goals_against: 1 },
  ];
  const app = (id) => ({
    match_id: id, player_id: 'p1', started: true, goals: 0, assists: 0,
    yellows: 0, reds: 0, motm: false, dropout: false,
  });
  const mine = meSummary(player, [player], matches, [app('m1'), app('m2')]);

  assert.equal(mine.apps, 1, 'one appearance in the current season');
  assert.equal(mine.played, 1, 'and the club played one game in it');

  // And the badge counts both games: bronze held, silver (10) eight away, not
  // the nine a season-scoped count would have said. Read off the shelf rather
  // than off `next`, because with no goals yet the nearest rung is a first
  // goal — which is the right answer to a different question.
  const appearances = playerBadges(player, [player], matches, [app('m1'), app('m2')])
    .career.find((b) => b.key === 'appearances');
  assert.equal(appearances.metal, 'bronze');
  assert.equal(appearances.next.metal, 'silver');
  assert.equal(appearances.next.need, 8);
});

test('the badge on the card is the one the shelf on their own page shows', () => {
  const player = named('Owen Gibbons');
  const mine = summaryFor('Owen Gibbons');
  const career = playerBadges(player, mid.players, mid.matches, mid.appearances, mid.seasonAwards)
    .career.find((b) => b.key === mine.next.key);
  assert.equal(mine.next.need, career.next.need);
  assert.equal(mine.next.to, career.next.metal);
  assert.equal(mine.next.metal, career.metal);
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

test('a player who has never been picked gets zeroes and a bronze to chase', () => {
  const mine = summaryFor('Alex Hannon');
  assert.equal(mine.apps, 0);
  assert.equal(mine.goals, 0);
  assert.equal(mine.assists, 0);
  // Bronze is one appearance, so the first badge is always one away — which is
  // the argument for showing an unearned badge at all (DESIGN.md → Badges).
  assert.equal(mine.next.to, 'bronze');
  assert.equal(mine.next.need, 1);
});

test('a club with no matches at all still has a badge to chase', () => {
  // The state the site opens in before anything is entered, and the state
  // Home's `pre-season` fixture is a step from. The figures go to nought and
  // the badge stays: an unearned badge is the incentive, so the one thing this
  // must not do is come back with nothing to show a player who has picked.
  const player = named('Owen Gibbons');
  const mine = meSummary(player, mid.players, [], [], []);
  assert.equal(mine.played, 0);
  assert.equal(mine.apps, 0);
  assert.equal(mine.next.key, 'appearances');
  assert.equal(mine.next.to, 'bronze');
});

test('the harness and the site name the same cookie', () => {
  // scripts/site-map.js keeps its own copy so the harness can boot a route as
  // a reader who has picked a name, without a loader for src/'s imports. Two
  // places, one string, and this is what holds them together.
  assert.equal(HARNESS_COOKIE, ME_COOKIE);
});
