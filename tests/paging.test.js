// lib/paging.js — the read that stopped at a thousand rows.
//
// This is the one bug on the site that can't be seen: a truncated read throws
// nothing, renders nothing odd, and just makes every derived figure wrong by an
// amount that grows each season. A screenshot can't catch it and neither can a
// human looking at the page, so the assertion has to live here.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { PAGE_SIZE, fetchAllPages } from '../src/lib/paging.js';

/** A table of `total` rows that answers one page at a time, PostgREST-style. */
function table(total, { pageSize = PAGE_SIZE } = {}) {
  const rows = Array.from({ length: total }, (_, i) => ({ id: i }));
  const calls = [];
  const pageAt = async (from, to) => {
    calls.push([from, to]);
    // PostgREST trims a range to its own cap; a stub that returned more than
    // was asked for would let a broken pageSize pass this file.
    return { data: rows.slice(from, Math.min(to + 1, from + pageSize)), error: null };
  };
  return { pageAt, calls, rows };
}

test('a table under one page comes back in a single request', async () => {
  const { pageAt, calls } = table(155); // the real appearances count, one season in
  const { data, error } = await fetchAllPages(pageAt);
  assert.equal(error, null);
  assert.equal(data.length, 155);
  assert.equal(calls.length, 1);
});

test('a table over a thousand rows comes back whole', async () => {
  const { pageAt } = table(2_500);
  const { data, error } = await fetchAllPages(pageAt);
  assert.equal(error, null);
  assert.equal(data.length, 2_500);
  // Every row exactly once, in order: the failure this guards against is rows
  // moving between pages, which shows up as a gap or a duplicate rather than a
  // wrong count.
  assert.deepEqual(
    data.map((r) => r.id),
    Array.from({ length: 2_500 }, (_, i) => i),
  );
});

test('the season that lands on an exact multiple of the page size terminates', async () => {
  const { pageAt, calls } = table(2 * PAGE_SIZE);
  const { data, error } = await fetchAllPages(pageAt);
  assert.equal(error, null);
  assert.equal(data.length, 2 * PAGE_SIZE);
  // Two full pages, then one empty one to learn there is no third.
  assert.equal(calls.length, 3);
});

test('an empty table is not an error', async () => {
  const { data, error } = await fetchAllPages(table(0).pageAt);
  assert.equal(error, null);
  assert.deepEqual(data, []);
});

test('the ranges asked for are contiguous and non-overlapping', async () => {
  // Contiguity is what makes the read complete: a gap loses rows and an overlap
  // duplicates them, and both look like a plausible number on the page.
  const asked = [];
  await fetchAllPages(async (from, to) => {
    asked.push([from, to]);
    return { data: table(2_500).rows.slice(from, to + 1), error: null };
  });
  assert.deepEqual(asked, [
    [0, PAGE_SIZE - 1],
    [PAGE_SIZE, 2 * PAGE_SIZE - 1],
    [2 * PAGE_SIZE, 3 * PAGE_SIZE - 1],
  ]);
});

test('a failed page reports the error and never a partial read', async () => {
  const boom = { message: 'JWT expired' };
  let call = 0;
  const { data, error } = await fetchAllPages(async (from, to) => {
    call += 1;
    if (call === 2) return { data: null, error: boom };
    return { data: Array.from({ length: PAGE_SIZE }, (_, i) => ({ id: from + i })), error: null };
  });
  assert.equal(error, boom);
  // The rows from page one are dropped on purpose: a caller that got 1,000 rows
  // and an error would have to know not to trust them.
  assert.equal(data, null);
});

test('a page that never empties errors rather than truncating or hanging', async () => {
  // An endpoint answering a full page forever. Returning what we had would put
  // back the silent-truncation bug as the failure mode.
  const { data, error } = await fetchAllPages(async (from) => ({
    data: Array.from({ length: PAGE_SIZE }, (_, i) => ({ id: from + i })),
    error: null,
  }));
  assert.equal(data, null);
  assert.match(error.message, /Stopped reading after \d+ pages/);
});

test('pageSize is honoured, so the cap can be tested without a million rows', async () => {
  const { pageAt, calls } = table(25, { pageSize: 10 });
  const { data, error } = await fetchAllPages(pageAt, 10);
  assert.equal(error, null);
  assert.equal(data.length, 25);
  assert.deepEqual(calls, [[0, 9], [10, 19], [20, 29]]);
});
