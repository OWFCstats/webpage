// The fixture has to contain the states it claims to contain.
//
// Every phase from 10 on judges a page against these two datasets, so a state
// that quietly falls out of the fixture takes a page's whole check with it —
// the clean sheet is the example, because the real season has none and half the
// badge system depends on one existing. These are the assertions that stop a
// fixture edit hollowing out the harness.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DATASETS } from '../fixtures/datasets.js';
import season2526 from '../fixtures/2025-26.json' with { type: 'json' };
import { isCleanSheet, isPlayed, seasonsOf } from '../src/lib/matches.js';
import { playerTotals } from '../src/lib/players.js';
import { honoursSettled } from '../src/lib/awards.js';

const named = (players, name) => players.find((p) => p.name === name);

test('the parsed import is the real season', () => {
  assert.equal(season2526.players.length, 53);
  assert.equal(season2526.matches.length, 14);
  assert.equal(season2526.appearances.length, 169);
});

test('ids are stable across two builds of the same key', async () => {
  const { fixtureId } = await import('../fixtures/uuid.js');
  assert.equal(fixtureId('player:Owen Gibbons'), fixtureId('player:Owen Gibbons'));
  assert.notEqual(fixtureId('player:Owen Gibbons'), fixtureId('player:Joe Gibbons'));
  assert.match(fixtureId('player:Owen Gibbons'), /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});

for (const [name, dataset] of Object.entries(DATASETS)) {
  const { players, matches, appearances, teams, league_rows: leagueRows, season_awards: awards } = dataset.data;

  test(`${name}: every table is populated`, () => {
    for (const [table, rows] of Object.entries({ players, matches, appearances, teams, leagueRows, awards })) {
      assert.ok(rows.length > 0, `${table} is empty`);
    }
  });

  test(`${name}: every match resolves to a team, every appearance to a player and a match`, () => {
    const teamIds = new Set(teams.map((t) => t.id));
    const playerIds = new Set(players.map((p) => p.id));
    const matchIds = new Set(matches.map((m) => m.id));
    for (const m of matches) assert.ok(teamIds.has(m.opponent_team_id), `${m.opponent} has no team row`);
    for (const a of appearances) {
      assert.ok(playerIds.has(a.player_id), 'appearance with no player');
      assert.ok(matchIds.has(a.match_id), 'appearance with no match');
    }
    for (const r of leagueRows) assert.ok(teamIds.has(r.team_id), 'league row with no team');
    for (const a of awards) assert.ok(playerIds.has(a.player_id), 'award with no player');
  });

  test(`${name}: holds a clean sheet, which the real season doesn't`, () => {
    assert.ok(matches.filter(isCleanSheet).length >= 1);
  });

  test(`${name}: holds a walkover with no team sheet`, () => {
    const walkover = matches.find((m) => m.walkover);
    assert.ok(walkover, 'no walkover');
    assert.equal(appearances.filter((a) => a.match_id === walkover.id).length, 0);
  });

  test(`${name}: holds a card of each colour`, () => {
    assert.ok(appearances.some((a) => a.yellows > 0), 'no yellow card');
    assert.ok(appearances.some((a) => a.reds > 0), 'no red card');
  });

  test(`${name}: holds a late dropout, excluded from appearance stats`, () => {
    const dropout = appearances.find((a) => a.dropout);
    assert.ok(dropout, 'no dropout');
    const row = playerTotals(players, matches, appearances).find((r) => r.player.id === dropout.player_id);
    assert.equal(row.dropouts, 1);
    assert.equal(row.appearances, 0, 'a dropout was counted as an appearance');
  });

  test(`${name}: holds a debutant who scored`, () => {
    const gus = named(players, 'Gus Hill');
    const mine = appearances.filter((a) => a.player_id === gus.id && !a.dropout);
    assert.equal(mine.length, 1, 'the debutant has more than one appearance');
    assert.equal(mine[0].goals, 1);
  });

  test(`${name}: holds a player who has never played`, () => {
    const rows = playerTotals(players, matches, appearances);
    assert.ok(rows.some((r) => r.appearances === 0 && r.dropouts === 0));
  });

  test(`${name}: holds a match with no venue and no kick-off recorded`, () => {
    assert.ok(matches.some((m) => m.venue == null), 'every match has a venue');
    assert.ok(matches.some((m) => m.kickoff_time == null), 'every match has a kick-off time');
  });

  test(`${name}: holds a result with a report and one without`, () => {
    const played = matches.filter(isPlayed);
    assert.ok(played.some((m) => m.report), 'no match report');
    assert.ok(played.some((m) => !m.report), 'every match has a report');
  });
}

test('mid-season: two fixtures ahead, one season', () => {
  const { matches } = DATASETS['mid-season'].data;
  assert.equal(matches.filter((m) => !isPlayed(m)).length, 2);
  assert.deepEqual(seasonsOf(matches), ['2025/26']);
});

test('the two datasets sit either side of the honours going up', () => {
  // Phase 55: an end-of-season award needs the season to have ended, so the
  // fixture has to hold both states or the cabinet is only ever screenshotted
  // in one of them. mid-season is 20 March and 2025/26 is still being played;
  // pre-season is 15 August and carries the published row an admin writes at
  // the dinner. No third dataset was added for it, and this is what says so.
  const mid = DATASETS['mid-season'];
  assert.deepEqual(mid.data.season_status, []);
  assert.equal(
    honoursSettled('2025/26', mid.data.matches, { today: mid.now.slice(0, 10) }),
    false,
  );

  const pre = DATASETS['pre-season'];
  const row = pre.data.season_status.find((r) => r.season === '2025/26');
  assert.ok(row, 'pre-season has no published-honours row');
  assert.equal(row.honours_published, true);
  const today = pre.now.slice(0, 10);
  const on = { today, seasonStatus: pre.data.season_status };
  assert.equal(honoursSettled('2025/26', pre.data.matches, on), true);
  assert.equal(
    honoursSettled('2026/27', pre.data.matches, on),
    false,
    'a season whose fixtures are entered and unplayed has no honours',
  );
  // The row agrees with the date rule here rather than fighting it, so what it
  // is exercising is the table and the read path, not a disagreement.
  assert.equal(honoursSettled('2025/26', pre.data.matches, { today }), true);
});

test('pre-season: the newest season has rows and no results', () => {
  const { matches } = DATASETS['pre-season'].data;
  const [newest] = seasonsOf(matches);
  assert.equal(newest, '2026/27');
  const rows = matches.filter((m) => m.season === newest);
  assert.ok(rows.length >= 2, 'next season has no fixtures entered');
  assert.equal(rows.filter(isPlayed).length, 0, 'next season has a result in it');
  // The state Phase 10 exists to fix: the most recent season with a row is not
  // the most recent season with a result.
  assert.ok(matches.some((m) => m.season === '2025/26' && isPlayed(m)));
});
