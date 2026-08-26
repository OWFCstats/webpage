// The drawings, and the lookup that picks one.
//
// There is no recolouring pipeline left to test — the club drew all twenty-two
// badges and each arrives in the colour it is meant to be. What's left is worth
// testing anyway, because all of it has been shipped wrong at least once: a drop
// of art that was missing a tier, a drawing that was a 471 KB bitmap wearing an
// `.svg` extension, and a badge key that didn't match its filename so the icon
// silently rendered nothing.

import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { test } from 'node:test';
import { BADGES, CAREER_BADGES, METALS } from '../src/lib/awards.js';
import { BADGE_ART, PLACEHOLDER_METAL, artKey } from '../src/lib/badge-art.js';

const DIR = new URL('../src/assets/badges/', import.meta.url);
const bytes = (key) => statSync(new URL(`${key}.svg`, DIR)).size;
const source = (key) => readFileSync(new URL(`${key}.svg`, DIR), 'utf8');
const files = () => readdirSync(DIR).filter((f) => f.endsWith('.svg')).map((f) => f.replace('.svg', ''));

test('every badge is a drawing and every drawing is a badge', () => {
  assert.deepEqual(files().sort(), [...BADGE_ART].sort());
  // Four tiers each for the career badges, one apiece for the six that don't
  // tier. A drop missing a tier is the failure this catches, and it has to be
  // caught here rather than on the page: a missing file renders nothing at all.
  assert.equal(BADGE_ART.length, CAREER_BADGES.length * METALS.length + (BADGES.length - CAREER_BADGES.length));
  assert.equal(BADGE_ART.length, 22);
});

test('a career badge is drawn per tier and nothing else is', () => {
  for (const badge of CAREER_BADGES) {
    for (const metal of METALS) {
      assert.equal(artKey(badge.key, metal), `${badge.key}-${metal}`);
    }
    // Unheld borrows the first rung's drawing: the placeholder is the badge the
    // reader is next in line for, not one three tiers away.
    assert.equal(artKey(badge.key, null), `${badge.key}-${PLACEHOLDER_METAL}`);
    assert.ok(METALS.includes(PLACEHOLDER_METAL));
  }
  for (const badge of BADGES.filter((b) => b.class !== 'career')) {
    assert.equal(artKey(badge.key, 'gold'), badge.key, 'a trophy is one drawing');
    assert.equal(artKey(badge.key, null), badge.key);
  }
});

test('no drawing ships a bitmap or weighs what one does', () => {
  // 120 KB a file, 900 KB across the set. Both are the art as `npm run badges`
  // leaves it plus a little room, and both are stated because they answer
  // different questions: one file is what a page waits for, the whole set is
  // what a squad page eventually pulls. The exports are 1.8 MB before the
  // script and the set is 807 KB after it — a cap of 25 KB a drawing was the
  // old flat icons' figure and these are framed, shaded crests.
  let total = 0;
  for (const key of BADGE_ART) {
    const kb = bytes(key) / 1024;
    total += kb;
    assert.ok(kb < 120, `${key}.svg is ${Math.round(kb)} KB`);
    assert.ok(!source(key).includes('<image'), `${key}.svg embeds a raster`);
  }
  assert.ok(total < 900, `the set is ${Math.round(total)} KB`);
});

test('a drawing keeps its own aspect ratio', () => {
  // The badges are not square and not one shape — a crest is about 0.9 wide for
  // its height, a diamond 1.17, the hat-trick's three footballs 1.57 — and the
  // viewBox is the only thing that tells the slot how to contain one. `svgo`
  // will drop it unless told not to, and a dropped viewBox stretches every
  // drawing to whatever box it lands in.
  for (const key of BADGE_ART) {
    assert.match(source(key), /viewBox="0 0 [\d.]+ [\d.]+"/, `${key}.svg has no viewBox`);
  }
});
