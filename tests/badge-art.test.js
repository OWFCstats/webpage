// lib/badge-art.js and the drawings it recolours.
//
// Half of this is about the artwork rather than the code: the keys and the
// filenames are the same string by design, the star is paths rather than a
// 471 KB raster, and the cap has no stray hairline floating beside it. Those
// are the two defects Phase 15 came in owing, and a test is what stops either
// coming back with the next drop of drawings.

import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { test } from 'node:test';
import { BADGES } from '../src/lib/awards.js';
import { FLAT_SPAN, luminance, rampColour, recolour, toneRange } from '../src/lib/badge-art.js';

const DIR = new URL('../src/assets/badges/', import.meta.url);
const source = (key) => readFileSync(new URL(`${key}.svg`, DIR), 'utf8');
const BRONZE = ['#6b3a1a', '#a9612c', '#d18f57', '#f0c8a0'];
const fillsIn = (svg) => [...svg.matchAll(/fill="(#[0-9a-fA-F]{6})"/g)].map((m) => m[1].toLowerCase());

test('every badge is a drawing and every drawing is a badge', () => {
  const files = readdirSync(DIR).filter((f) => f.endsWith('.svg')).map((f) => f.replace('.svg', ''));
  assert.deepEqual(files.sort(), BADGES.map((b) => b.key).sort());
});

test('no drawing ships a bitmap or weighs what one does', () => {
  for (const badge of BADGES) {
    const svg = source(badge.key);
    const kb = statSync(new URL(`${badge.key}.svg`, DIR)).size / 1024;
    assert.ok(kb < 25, `${badge.key}.svg is ${Math.round(kb)} KB`);
    assert.ok(!svg.includes('<image'), `${badge.key}.svg embeds a raster`);
  }
  // The star was 471 KB of embedded bitmap — 1.5 million pixels for something
  // that renders into about 2,300 of them at its 16px floor.
  assert.ok(statSync(new URL('motm.svg', DIR)).size < 20 * 1024);
});

test('the cap has nothing floating beside it', () => {
  // A near-white hairline sat above and right of the cap with nothing joining
  // it to the drawing, and read as a speck of dirt on the board.
  assert.ok(!source('the-dependable').includes('#f6ffff'));
});

test('a silhouette has no span to map and a shirt does', () => {
  for (const key of ['assists', 'goals', 'playmaker']) {
    assert.ok(toneRange(source(key)).flat, `${key} should take one flat stop`);
  }
  for (const key of ['appearances', 'clean-sheets']) {
    const range = toneRange(source(key));
    assert.ok(range.span > FLAT_SPAN * 4, `${key} has range enough for a ramp`);
  }
});

test('the ramp is read in order and never outside itself', () => {
  assert.equal(rampColour(BRONZE, 0), BRONZE[0]);
  assert.equal(rampColour(BRONZE, 1), BRONZE[3]);
  assert.equal(rampColour(BRONZE, 1 / 3), BRONZE[1]);
  // Out of range is clamped rather than extrapolated into a colour that isn't
  // on the metal at all.
  assert.equal(rampColour(BRONZE, -1), BRONZE[0]);
  assert.equal(rampColour(BRONZE, 9), BRONZE[3]);
  const mixed = rampColour(BRONZE, 0.5);
  assert.ok(luminance(mixed) > luminance(BRONZE[1]) && luminance(mixed) < luminance(BRONZE[2]));
});

test('the ground picks the band: the page takes the dark half, a board the light', () => {
  const onPaper = fillsIn(recolour(source('appearances'), BRONZE, 'paper'));
  const onBoard = fillsIn(recolour(source('appearances'), BRONZE, 'board'));
  assert.ok(onPaper.length > 0 && onPaper.length === onBoard.length);
  const brightest = (fills) => Math.max(...fills.map(luminance));
  assert.ok(
    brightest(onPaper) <= luminance(BRONZE[1]) + 0.001,
    'on paper nothing goes lighter than the second stop',
  );
  assert.ok(
    Math.min(...onBoard.map(luminance)) >= luminance(BRONZE[2]) - 0.001,
    'on a board nothing goes darker than the third stop',
  );
  // The drawing's own order survives the mapping: the shirt's gold trim stays
  // lighter than its black outline.
  assert.ok(brightest(onPaper) > Math.min(...onPaper.map(luminance)));
});

test('a silhouette takes one stop, the band end that reads as the metal', () => {
  const onPaper = new Set(fillsIn(recolour(source('assists'), BRONZE, 'paper')));
  assert.deepEqual([...onPaper], [BRONZE[1]], 'stop 2 on the ground');
  const onBoard = new Set(fillsIn(recolour(source('assists'), BRONZE, 'board')));
  assert.deepEqual([...onBoard], [BRONZE[2]], 'stop 3 on a board');
});

test('recolouring touches the paint and nothing else', () => {
  const before = source('clean-sheets');
  const after = recolour(before, BRONZE, 'paper');
  assert.equal(after.length > 0, true);
  assert.equal(
    before.replace(/(fill|stroke)="#[0-9a-fA-F]{6}"/g, ''),
    after.replace(/(fill|stroke)="#[0-9a-fA-F]{6}"/g, ''),
    'the geometry is the club\'s artwork and stays untouched',
  );
  assert.ok(!after.includes('fill="none"') || before.includes('fill="none"'));
});
