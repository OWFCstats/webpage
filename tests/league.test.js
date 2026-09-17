// lib/league.js — the standings widget and the head-to-head tape both read
// through leagueStandings(); twoRows() exists so the tape doesn't re-sort or
// re-derive points and goal difference, which that function already owns.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DATASETS } from '../fixtures/datasets.js';
import { divisionRatios, leagueStandings, twoRows } from '../src/lib/league.js';

const { league_rows: leagueRows, teams } = DATASETS['mid-season'].data;
const SEASON = '2025/26';
const teamId = (name) => teams.find((t) => t.name === name).id;

test('twoRows finds our row and a rival with one in the same table', () => {
  const { us, them, division } = twoRows(leagueRows, teams, SEASON, teamId('Old Stoics'));
  assert.equal(us.isUs, true);
  assert.equal(them.name, 'Old Stoics');
  assert.equal(division, leagueStandings(leagueRows, teams, SEASON).division);
});

test('them is null for an opponent with no row in the table', () => {
  // Wellington IX is a friendly fixture, not a league one — no row exists.
  const { us, them } = twoRows(leagueRows, teams, SEASON, teamId('Wellington IX'));
  assert.ok(us);
  assert.equal(them, null);
});

test('them is null with no opponent team id at all', () => {
  const { us, them } = twoRows(leagueRows, teams, SEASON, null);
  assert.ok(us);
  assert.equal(them, null);
});

test('both sides are null for a season with no table entered', () => {
  const { us, them } = twoRows(leagueRows, teams, '2026/27', teamId('Old Stoics'));
  assert.equal(us, null);
  assert.equal(them, null);
});

test('rank falls back to points, then goal difference, when position is unset', () => {
  const noPositions = leagueRows.map((r) => ({ ...r, position: null }));
  const { rows } = leagueStandings(noPositions, teams, SEASON);
  const { us, them } = twoRows(noPositions, teams, SEASON, teamId('Old Stoics'));
  // twoRows reads the rank off leagueStandings' own sort order — it doesn't
  // re-derive it — so a row's rank has to be its 1-based index in that order.
  assert.equal(us.rank, rows.findIndex((r) => r.isUs) + 1);
  assert.equal(them.rank, rows.findIndex((r) => r.team_id === teamId('Old Stoics')) + 1);
});

test('points and goal difference are derived, not read off the raw row', () => {
  const { us, them } = twoRows(leagueRows, teams, SEASON, teamId('Old Stoics'));
  assert.equal(us.points, us.won * 3 + us.drawn - (us.walkover_losses ?? 0) * 3);
  assert.equal(us.goalDifference, us.goals_for - us.goals_against);
  assert.equal(them.points, them.won * 3 + them.drawn);
  assert.equal(them.goalDifference, them.goals_for - them.goals_against);
});

// ---------------------------------------------------------------------------
// divisionRatios — the per-game figures under Season → Stats.
//
// The rows are built here rather than taken from the fixture: every case worth
// asserting is a division that isn't square, and the fixture's is one season
// of one league. What the fixture does carry — clubs with a game in hand — is
// asserted in tests/fixtures.test.js, so the rendered page is measured in that
// state too.
// ---------------------------------------------------------------------------

/** A division as rows plus teams, from `[name, played, goalsFor, goalsAgainst]`
 *  tuples. Positions are left null so each case ranks on its own figures. */
function division(entries, us = null) {
  const teams = entries.map(([name]) => ({
    id: `team-${name}`,
    name,
    slug: name.toLowerCase().replace(/\W+/g, '-'),
    is_club: name === us,
  }));
  const rows = entries.map(([name, played, goalsFor, goalsAgainst]) => ({
    id: `row-${name}`,
    season: SEASON,
    division: 'Test Division',
    team_id: `team-${name}`,
    position: null,
    played,
    won: 0,
    drawn: 0,
    lost: 0,
    goals_for: goalsFor,
    goals_against: goalsAgainst,
    walkover_losses: 0,
    updated_at: '2026-03-16T20:12:00.000Z',
  }));
  return divisionRatios(rows, teams, SEASON);
}

test('ranks on the rate, not the total, when the table is not square', () => {
  // Fewer games, fewer goals, better attack — and the whole point of the card.
  const { scored } = division([['Sprinters', 2, 8, 0], ['Sloggers', 12, 30, 0]]);
  assert.deepEqual(scored.rows.map((r) => [r.name, r.rank]), [['Sprinters', 1], ['Sloggers', 2]]);
  assert.equal(scored.rows[0].value, 4);
  assert.equal(scored.rows[1].value, 2.5);
});

test('a club that has played nothing has no ratio and is ranked in neither list', () => {
  const { clubs, scored, conceded } = division([['Playing', 4, 8, 4], ['Waiting', 0, 0, 0]]);
  const waiting = clubs.find((c) => c.name === 'Waiting');
  assert.equal(waiting.scored, null);
  assert.equal(waiting.conceded, null);
  assert.deepEqual(scored.rows.map((r) => r.name), ['Playing']);
  // The one that would read as the division's best defence on a naive divisor.
  assert.deepEqual(conceded.rows.map((r) => r.name), ['Playing']);
});

test('the average is the ratio of the totals, not the mean of the clubs ratios', () => {
  // Mean of the two rates is 3.5 a game; the division has actually scored 15
  // goals in 10 club-games, which is 1.5.
  const { scored } = division([['One game', 1, 6, 0], ['Nine games', 9, 9, 0]]);
  assert.equal(scored.average, 1.5);
});

test('a club with no games played is outside the average as well as the ranking', () => {
  const played = division([['Playing', 4, 8, 4]]).scored.average;
  const withIdle = division([['Playing', 4, 8, 4], ['Waiting', 0, 0, 0]]).scored.average;
  assert.equal(withIdle, played);
});

test('level clubs share a rank, and more football breaks the order', () => {
  const { scored } = division([
    ['Few games', 2, 4, 0],
    ['Many games', 10, 20, 0],
    ['Behind', 5, 5, 0],
  ]);
  assert.deepEqual(scored.rows.map((r) => [r.name, r.rank]), [
    ['Many games', 1],
    ['Few games', 1],
    ['Behind', 3],
  ]);
});

test('best first means most scored and fewest conceded', () => {
  const { scored, conceded } = division([['Leaky', 4, 12, 12], ['Tight', 4, 4, 2]]);
  assert.equal(scored.rows[0].name, 'Leaky');
  assert.equal(conceded.rows[0].name, 'Tight');
});

test('one scale covers both lists, and it is the largest figure in either', () => {
  const { scale } = division([['Leaky', 4, 12, 20], ['Tight', 4, 4, 2]]);
  assert.equal(scale, 5); // 20 conceded in 4, larger than any attack here
});

test('our own row is flagged wherever it ranks', () => {
  const { scored, conceded } = division(
    [['Them', 4, 12, 4], ['Old Wellingtonians', 4, 4, 4]],
    'Old Wellingtonians',
  );
  assert.equal(scored.rows.find((r) => r.isUs).name, 'Old Wellingtonians');
  assert.equal(scored.rows.find((r) => r.isUs).rank, 2);
  assert.equal(conceded.rows.find((r) => r.isUs).rank, 1);
});

test('a season with no table entered has nothing to rank and no scale', () => {
  const { clubs, scored, conceded, scale } = divisionRatios(leagueRows, teams, '2026/27');
  assert.deepEqual(clubs, []);
  assert.deepEqual(scored.rows, []);
  assert.equal(scored.average, null);
  assert.equal(conceded.average, null);
  assert.equal(scale, null);
});

test('the fixture division ranks us where its own goals put us', () => {
  const { scored, conceded, clubs } = divisionRatios(leagueRows, teams, SEASON);
  const us = clubs.find((c) => c.isUs);
  assert.equal(us.scored, us.goalsFor / us.played);
  assert.equal(scored.rows.length, clubs.length);
  // Ranked, so every club appears exactly once in each list.
  assert.equal(new Set(conceded.rows.map((r) => r.id)).size, clubs.length);
});

test('a division that has played but not scored has a scale of nothing, not no scale', () => {
  // Every bar at zero is a fact about the division; an empty card would be a
  // claim that nobody has played.
  const { scored, conceded, scale } = division([['Dour', 3, 0, 0], ['Dourer', 3, 0, 0]]);
  assert.equal(scale, 0);
  assert.equal(scored.rows.length, 2);
  assert.equal(scored.average, 0);
  assert.equal(conceded.average, 0);
});
