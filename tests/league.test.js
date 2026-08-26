// lib/league.js — the standings widget and the head-to-head tape both read
// through leagueStandings(); twoRows() exists so the tape doesn't re-sort or
// re-derive points and goal difference, which that function already owns.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DATASETS } from '../fixtures/datasets.js';
import { leagueStandings, twoRows } from '../src/lib/league.js';

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
