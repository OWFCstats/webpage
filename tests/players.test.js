// lib/players.js — statLeaders, which Phase 14's leaderboard cards read
// directly. A screenshot won't catch a rank or a footer boundary landing on
// the wrong row, which is the argument for this being here at all.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { statLeaders } from '../src/lib/players.js';

const row = (id, goals) => ({ player: { id, name: id }, goals });

test('ties share a place, and the next rank skips it', () => {
  const rows = [row('a', 5), row('b', 5), row('c', 3), row('d', 1)];
  const { ranked } = statLeaders(rows, 'goals', 10);
  assert.deepEqual(ranked.map((r) => r.rank), [1, 1, 3, 4]);
});

test('zeroes are left off the board entirely', () => {
  const rows = [row('a', 2), row('b', 0)];
  const { ranked, total } = statLeaders(rows, 'goals', 10);
  assert.equal(ranked.length, 1);
  assert.equal(total, 1);
});

test('next is the first row the cap left out, rank already resolved', () => {
  const rows = [row('a', 5), row('b', 4), row('c', 4), row('d', 2), row('e', 2), row('f', 1)];
  const { total, next } = statLeaders(rows, 'goals', 3);
  assert.equal(total, 6);
  // a=1, b=2, c=2, d=4 — the cap of 3 lands inside the b/c tie, so the
  // fourth row (the first cut) is rank 4, not rank 3 repeated.
  assert.equal(next.rank, 4);
  assert.equal(next.goals, 2);
});

test('next is null once the board holds everyone with a total', () => {
  const rows = [row('a', 5), row('b', 3)];
  const { next } = statLeaders(rows, 'goals', 5);
  assert.equal(next, null);
});
