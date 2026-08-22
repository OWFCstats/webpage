// lib/awards.js — club records, season honours and the badge ladder.
//
// Phase 15 rewrites the ladder into three classes, so what is worth pinning
// here is the behaviour that has to survive that rewrite rather than the
// current thresholds: ties stay whole, a dropout is not an appearance, a
// walkover credits nobody, and a record nobody holds is null rather than zero.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DATASETS } from '../fixtures/datasets.js';
import { clubPlates, clubRecords, playerPlates, seasonRecords } from '../src/lib/awards.js';
import { playerTotals } from '../src/lib/players.js';

const mid = DATASETS['mid-season'].data;
const pre = DATASETS['pre-season'].data;
const named = (name) => mid.players.find((p) => p.name === name);

test('a record nobody holds is null, not zero', () => {
  const empty = clubRecords([]);
  assert.equal(empty.played, 0);
  assert.equal(empty.biggestWin, null);
  assert.equal(empty.longestUnbeaten, null);
  assert.equal(empty.firstCleanSheet, null);
  assert.equal(empty.cleanSheets, 0);
});

test('club records read off the fixture', () => {
  const records = clubRecords(mid.matches);
  assert.equal(records.played, 16);
  assert.equal(records.cleanSheets, 2);
  assert.equal(records.biggestWin.goals_for - records.biggestWin.goals_against, 4);
  assert.equal(records.longestWinning.count, 2);
  assert.equal(records.longestUnbeaten.count, 3);
  // A run carries its own games so the page can list them.
  assert.equal(records.longestUnbeaten.matches.length, 3);
  assert.ok(records.longestUnbeaten.from < records.longestUnbeaten.to);
});

test('an unplayed fixture sets no record', () => {
  // pre-season adds four fixtures and no results, so every mark is unmoved.
  const before = clubRecords(mid.matches);
  const after = clubRecords(pre.matches);
  assert.equal(after.played, before.played);
  assert.equal(after.highestScoring.date, before.highestScoring.date);
});

test('the season honours keep a tie whole', () => {
  const [season] = seasonRecords(mid.players, mid.matches, mid.appearances, mid.season_awards);
  const motm = season.awards.find((a) => a.key === 'motm');
  assert.deepEqual(motm.leaders.map((p) => p.name), ['Owen Gibbons', 'Will Line']);
  assert.equal(motm.value, 2);
  const boot = season.awards.find((a) => a.key === 'goals');
  assert.deepEqual(boot.leaders.map((p) => p.name), ['Tom Simeon']);
  assert.equal(boot.value, 7);
});

test('the voted award comes from the row, with no mark', () => {
  const [season] = seasonRecords(mid.players, mid.matches, mid.appearances, mid.season_awards);
  const pots = season.awards[0];
  assert.equal(pots.key, 'player-of-the-season');
  assert.deepEqual(pots.leaders.map((p) => p.name), ['Hugh Grindon']);
  assert.equal(pots.value, null, 'a vote has no number behind it');
  assert.match(pots.note, /end-of-season dinner/);
});

test('an award with no row and no mark names nobody', () => {
  const [season] = seasonRecords(mid.players, mid.matches, mid.appearances, []);
  assert.deepEqual(season.awards[0].leaders, []);
  const nothingPlayed = seasonRecords(pre.players, pre.matches, pre.appearances, pre.season_awards)[0];
  assert.equal(nothingPlayed.season, '2026/27');
  assert.equal(nothingPlayed.summary.played, 0);
  for (const award of nothingPlayed.awards) {
    assert.deepEqual(award.leaders, [], `${award.label} invented a winner from a column of zeroes`);
  }
});

test('a season row lists only the competitions actually played', () => {
  const [season] = seasonRecords(mid.players, mid.matches, mid.appearances, mid.season_awards);
  assert.deepEqual(season.competitions, ['Cup', 'Friendly', 'League']);
  const next = seasonRecords(pre.players, pre.matches, pre.appearances, [])[0];
  assert.deepEqual(next.competitions, [], 'a fixture is not a competition played');
});

test('a dropout is not an appearance and a walkover credits nobody', () => {
  const totals = playerTotals(mid.players, mid.matches, mid.appearances);
  const bertie = totals.find((r) => r.player.name === 'Bertie Morgan');
  assert.equal(bertie.appearances, 0);
  assert.equal(bertie.dropouts, 1);
  // Sixteen played matches, and the club's most-present player has fourteen:
  // the walkover has no team sheet, so nobody can have appeared in it.
  const most = Math.max(...totals.map((r) => r.appearances));
  assert.equal(most, 14);
});

test('a plate shelf leads with the best metal held and then what is closest', () => {
  const shelf = playerPlates(named('Owen Gibbons'), mid.players, mid.matches, mid.appearances);
  const earned = shelf.filter((p) => p.earned);
  const chasing = shelf.filter((p) => !p.earned);
  assert.ok(earned.length > 0);
  assert.equal(shelf.slice(0, earned.length).every((p) => p.earned), true, 'earned plates lead');
  assert.ok(chasing.length <= 3, 'the shelf shows at most three to chase');
  // Three goals in one game is a hat-trick, and the plate says when it fell.
  const hatTrick = earned.find((p) => p.key === 'hatTricks-1');
  assert.ok(hatTrick, 'a hat-trick went uncounted');
  assert.match(hatTrick.note, /\d{4}$/);
  for (const plate of chasing) assert.match(plate.note, /\d+ to go/);
});

test('a player with one appearance still has a shelf to chase', () => {
  const shelf = playerPlates(named('Gus Hill'), mid.players, mid.matches, mid.appearances);
  assert.equal(shelf.filter((p) => p.earned).length, 0);
  assert.equal(shelf.length, 3);
  assert.ok(shelf.every((p) => p.progress > 0 && p.progress < 1));
});

test('a player who has never played gets plates rather than nothing', () => {
  const shelf = playerPlates(named('Alex Hannon'), mid.players, mid.matches, mid.appearances);
  assert.equal(shelf.length, 3);
  assert.ok(shelf.every((p) => !p.earned));
});

test('the club board names every plate, held or not', () => {
  const board = clubPlates(mid.players, mid.matches, mid.appearances);
  assert.equal(board.length, 24, 'eight families of three rungs');
  assert.deepEqual([...new Set(board.map((p) => p.tier))], ['bronze', 'silver', 'gold']);
  const unheld = board.filter((p) => !p.earned);
  assert.ok(unheld.length > 0);
  assert.ok(unheld.every((p) => p.note === 'Nobody yet'), 'an unheld plate still gets named');
  // A plate held by more than one says so rather than picking one of them.
  assert.ok(board.some((p) => /\+\d+$/.test(p.note)));
});
