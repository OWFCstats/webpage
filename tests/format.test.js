// lib/format.js — clampReport is the lever Phase 27 uses to stop a long
// match report setting the length of the whole Matchday page, so it gets its
// own coverage: a short report, a long one, and the boundary between them.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { clampReport } from '../src/lib/format.js';

test('a short report renders whole, with nothing behind the clamp', () => {
  const text = 'A tidy two-line write-up of a routine afternoon.';
  const { head, rest } = clampReport(text, 300);
  assert.deepEqual(head, [text]);
  assert.deepEqual(rest, []);
});

test('a report exactly at the limit still renders whole', () => {
  const text = 'x'.repeat(300);
  const { head, rest } = clampReport(text, 300);
  assert.deepEqual(head, [text]);
  assert.deepEqual(rest, []);
});

test('one character past the limit clamps, even with no word boundary to cut at', () => {
  const text = 'a'.repeat(301);
  const { head, rest } = clampReport(text, 300);
  assert.equal(rest.length, 1);
  assert.ok(head[0].length <= 301); // 300 characters plus the ellipsis mark
});

test('a long single paragraph is cut at a word boundary, not mid-word', () => {
  const words = Array.from({ length: 80 }, (_, i) => `word${i}`);
  const text = words.join(' ');
  const { head, rest } = clampReport(text, 300);
  assert.equal(head.length, 1);
  assert.equal(rest.length, 1);
  const shown = head[0].replace(/…$/, '');
  assert.ok(shown.length <= 300);
  assert.ok(!shown.endsWith(' '));
  // The two halves rejoin word-for-word — nothing was lost or duplicated.
  assert.equal(`${shown} ${rest[0]}`, text);
});

test('paragraphs that fit stay whole; the one the cut lands in opens its own tail first', () => {
  const first = 'Short lead paragraph.';
  const second = `${'w'.repeat(50)} ${'x'.repeat(50)} ${'y'.repeat(300)}`;
  const text = `${first}\n\n${second}`;
  const { head, rest } = clampReport(text, 100);
  assert.equal(head[0], first);
  assert.equal(head.length, 2);
  assert.ok(head[1].endsWith('…'));
  assert.equal(rest.length, 1);
  assert.ok(rest[0].startsWith('x'.repeat(50)));
});
