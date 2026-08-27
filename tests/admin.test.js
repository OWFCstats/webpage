// lib/admin.js — the write side's derivations.
//
// The one that matters is fixtureFor. Before it, "Add result" only ever
// inserted, so filling in a fixture the club had already put in the diary left
// the same match on the site twice — Home showed it as the last result and as
// the next fixture at once, and the kick-off time and venue typed in with the
// fixture were lost. A screenshot doesn't catch two rows that both look right.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DATASETS } from '../fixtures/datasets.js';
import { fixtureFor, fixturesToFill, outstanding, todayISO } from '../src/lib/admin.js';

const mid = DATASETS['mid-season'].data;
const TODAY = '2026-03-20';

const match = (over = {}) => ({
  id: 'm1',
  season: '2025/26',
  date: '2026-03-14',
  opponent: 'Old Stoics',
  opponent_team_id: 't-stoics',
  competition: 'League',
  venue: 'H',
  kickoff_time: '14:00:00',
  goals_for: null,
  goals_against: null,
  walkover: false,
  ...over,
});

test('a fixture in the diary is found by date and opponent', () => {
  const fixture = match();
  const found = fixtureFor([fixture], { date: '2026-03-14', opponentTeamId: 't-stoics' });
  assert.equal(found, fixture);
});

test('a match already played is never offered — it is not waiting for a score', () => {
  const played = match({ goals_for: 2, goals_against: 3 });
  assert.equal(fixtureFor([played], { date: '2026-03-14', opponentTeamId: 't-stoics' }), null);
});

test('a different opponent on the same date is a different match', () => {
  assert.equal(
    fixtureFor([match()], { date: '2026-03-14', opponentTeamId: 't-worthians' }),
    null,
  );
});

test('a row with no team id falls back to the opponent name, case-insensitively', () => {
  const legacy = match({ opponent_team_id: null });
  assert.equal(
    fixtureFor([legacy], { date: '2026-03-14', opponent: 'old stoics' }),
    legacy,
  );
});

test('no date means no guess', () => {
  assert.equal(fixtureFor([match()], { date: '', opponentTeamId: 't-stoics' }), null);
});

test('the diary puts a game already played at the top', () => {
  const gone = match({ id: 'gone', date: '2026-03-14' });
  const ahead = match({ id: 'ahead', date: '2026-04-11' });
  const later = match({ id: 'later', date: '2026-04-25' });
  assert.deepEqual(
    fixturesToFill([ahead, later, gone], TODAY).map((m) => m.id),
    ['gone', 'ahead', 'later'],
  );
});

const base = { matches: [], appearances: [], leagueRows: [], seasonAwards: [] };

test('a fixture whose date has gone by with no score is the first thing outstanding', () => {
  const jobs = outstanding({ ...base, matches: [match({ date: '2026-03-14' })] }, TODAY);
  assert.equal(jobs[0].kind, 'result');
  assert.equal(jobs[0].to, '/admin/new-result?fixture=m1');
});

test('a fixture still ahead is not outstanding', () => {
  const jobs = outstanding({ ...base, matches: [match({ date: '2026-04-11' })] }, TODAY);
  assert.deepEqual(jobs, []);
});

test('a score with no lineup is outstanding; a walkover is not', () => {
  const scored = match({ goals_for: 2, goals_against: 1 });
  const walked = match({ id: 'm2', goals_for: 3, goals_against: 0, walkover: true });
  const jobs = outstanding({ ...base, matches: [scored, walked] }, TODAY);
  assert.deepEqual(jobs.map((j) => j.kind), ['lineup']);
  assert.equal(jobs[0].match.id, 'm1');
});

test('a lineup with nobody marked MOTM is outstanding — one a game', () => {
  const played = match({ goals_for: 2, goals_against: 1 });
  const apps = [{ match_id: 'm1', player_id: 'p1', motm: false }];
  const jobs = outstanding({ ...base, matches: [played], appearances: apps }, TODAY);
  assert.deepEqual(jobs.map((j) => j.kind), ['motm']);

  const withMotm = [{ match_id: 'm1', player_id: 'p1', motm: true }];
  assert.deepEqual(
    outstanding({ ...base, matches: [played], appearances: withMotm }, TODAY),
    [],
  );
});

test('a league table older than our own last result is outstanding', () => {
  const played = match({ goals_for: 2, goals_against: 1 });
  const apps = [{ match_id: 'm1', player_id: 'p1', motm: true }];
  const stale = [{ season: '2025/26', team_id: 't1', updated_at: '2026-03-01T20:00:00.000Z' }];
  const fresh = [{ season: '2025/26', team_id: 't1', updated_at: '2026-03-16T20:00:00.000Z' }];
  const jobs = (rows) =>
    outstanding({ ...base, matches: [played], appearances: apps, leagueRows: rows }, TODAY)
      .map((j) => j.kind);

  assert.deepEqual(jobs(stale), ['table']);
  assert.deepEqual(jobs(fresh), []);
  // A season nobody has entered a table for is empty, not out of date.
  assert.deepEqual(jobs([]), []);
});

test('a finished season with no Player of the Season is outstanding; the current one is not', () => {
  const old = match({ id: 'old', season: '2024/25', date: '2025-04-01', goals_for: 1, goals_against: 0 });
  const now = match({ id: 'now', season: '2025/26', goals_for: 2, goals_against: 1 });
  const apps = [
    { match_id: 'old', player_id: 'p1', motm: true },
    { match_id: 'now', player_id: 'p1', motm: true },
  ];
  const jobs = outstanding({ ...base, matches: [old, now], appearances: apps }, TODAY);
  assert.deepEqual(jobs.map((j) => j.kind), ['award']);
  assert.match(jobs[0].title, /2024\/25/);
});

test('the real season leaves nothing outstanding — the nag has to stay quiet when it should', () => {
  const jobs = outstanding(
    {
      matches: mid.matches,
      appearances: mid.appearances,
      leagueRows: mid.league_rows ?? [],
      seasonAwards: mid.season_awards ?? [],
    },
    DATASETS['mid-season'].now.slice(0, 10),
  );
  assert.deepEqual(jobs, [], `expected nothing outstanding, got ${jobs.map((j) => j.kind)}`);
});

test('today is the local day, not a UTC one — a Sunday-morning entry is not yesterday', () => {
  // 00:30 on 22 March in UTC+1 is still the 22nd; toISOString alone says the 21st.
  const local = new Date('2026-03-22T00:30:00');
  assert.equal(todayISO(local), '2026-03-22');
});
