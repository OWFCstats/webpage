// The chart series, as assertions.
//
// Phase 64 re-stepped these five because the old set passed the check it was
// given (contrast on the ground) and failed the one nobody had run (separation
// from each other). Two of the pairs were the same colour to a dichromat —
// `--series-1` against `--series-3` measured ΔE 0.2 under deuteranopia — and a
// chart drawn in them still looks like a chart, which is why this is a test and
// not an eye.
//
// The rule it holds is docs/DESIGN.md → *Chart series*: a categorical palette
// is validated by measurement, never by eye. So the values live in tokens.css
// and the floors live here, and moving either one without the other fails.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { chroma, contrast, deltaE, deltaELab, lab, pairs, readTokens, VISIONS } from '../scripts/colour.js';

const tokens = readTokens(readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8'));

// A chart is drawn on a .sheet, which is --paper. Nothing renders a series
// colour on the board — see docs/DESIGN.md → *Charts*.
const GROUND = tokens['--paper'];
const SERIES = Object.fromEntries(
  [1, 2, 3, 4, 5].map((i) => [`--series-${i}`, tokens[`--series-${i}`]]),
);

// WCAG AA for text, which is what a direct end label on a line is.
const CONTRAST_FLOOR = 4.5;
// Below about 15 a colour stops reading as a hue and starts reading as a grey
// of some lightness. 20 leaves room for the dichromat simulations, which pull
// chroma down rather than up.
const CHROMA_FLOOR = 20;
// The separation floor docs/DESIGN.md states, and the reason the old palette
// failed: two lines a reader cannot tell apart are one line.
const SEPARATION_FLOOR = 15;

test('every series colour is declared', () => {
  for (const [name, value] of Object.entries(SERIES)) {
    assert.match(value ?? '', /^#[0-9a-f]{6}$/i, `${name} is ${value}`);
  }
  assert.match(GROUND, /^#[0-9a-f]{6}$/i);
});

test('every series colour can label its own line on the paper it is drawn on', () => {
  for (const [name, value] of Object.entries(SERIES)) {
    const ratio = contrast(value, GROUND);
    assert.ok(ratio >= CONTRAST_FLOOR, `${name} ${value} is ${ratio.toFixed(2)}:1 on ${GROUND}`);
  }
});

test('every series colour reads as a hue rather than as a grey', () => {
  for (const [name, value] of Object.entries(SERIES)) {
    const c = chroma(value);
    assert.ok(c >= CHROMA_FLOOR, `${name} ${value} has chroma ${c.toFixed(1)}`);
  }
});

test('no two series collapse into one, for any reader', () => {
  const worst = pairs(SERIES);
  for (const p of worst) {
    assert.ok(
      p.deltaE >= SEPARATION_FLOOR,
      `${p.a} against ${p.b} is ΔE ${p.deltaE.toFixed(1)} under ${p.vision}`,
    );
  }
  // Named so a regression report says how much headroom went, not just that
  // something went.
  assert.ok(worst[0].deltaE >= SEPARATION_FLOOR);
});

test('the first three are three different pigments', () => {
  // A chart with three or fewer series never repeats a hue, which is every
  // chart on the site except the scoring race and All seasons. Depth is the
  // fallback, not the first answer — docs/DESIGN.md → *Chart series*.
  const hue = (hex) => { const { a, b } = lab(hex); const h = Math.atan2(b, a) * 180 / Math.PI; return h < 0 ? h + 360 : h; };
  const first = [1, 2, 3].map((i) => hue(SERIES[`--series-${i}`]));
  for (let i = 0; i < first.length; i++) {
    for (let j = i + 1; j < first.length; j++) {
      let apart = Math.abs(first[i] - first[j]);
      if (apart > 180) apart = 360 - apart;
      assert.ok(apart >= 60, `series ${i + 1} and ${j + 1} are ${apart.toFixed(0)}° apart`);
    }
  }
});

// The measurement itself, against the published reference data. A ΔE
// implementation that is quietly wrong would pass every assertion above while
// measuring nothing, and the two places CIEDE2000 goes wrong — the mean hue
// across the 0°/360° wrap, and the rotation term in the blues — are both in
// this palette's neighbourhood. These are Sharma, Wu & Dalal (2005), table 1:
// the set published for exactly this, each pair chosen to break a shortcut.
const SHARMA = [
  [[50, 2.6772, -79.7751], [50, 0, -82.7485], 2.0425],
  [[50, 3.1571, -77.2803], [50, 0, -82.7485], 2.8615],
  [[50, 2.8361, -74.0200], [50, 0, -82.7485], 3.4412],
  [[50, -1.3802, -84.2814], [50, 0, -82.7485], 1.0000],
  [[50, -1.1848, -84.8006], [50, 0, -82.7485], 1.0000],
  [[50, -0.9009, -85.5211], [50, 0, -82.7485], 1.0000],
  [[50, 0, 0], [50, -1, 2], 2.3669],
  [[50, -1, 2], [50, 0, 0], 2.3669],
  [[50, 2.4900, -0.0010], [50, -2.4900, 0.0009], 7.1792],
  [[50, 2.4900, -0.0010], [50, -2.4900, 0.0011], 7.2195],
  [[50, -0.0010, 2.4900], [50, 0.0009, -2.4900], 4.8045],
  [[50, -0.0010, 2.4900], [50, 0.0011, -2.4900], 4.7461],
  [[50, 2.5, 0], [50, 0, -2.5], 4.3065],
  [[50, 2.5, 0], [73, 25, -18], 27.1492],
  [[50, 2.5, 0], [61, -5, 29], 22.8977],
  [[50, 2.5, 0], [56, -27, -3], 31.9030],
  [[50, 2.5, 0], [58, 24, 15], 19.4535],
  [[60.2574, -34.0099, 36.2677], [60.4626, -34.1751, 39.4387], 1.2644],
  [[63.0109, -31.0961, -5.8663], [62.8187, -29.7946, -4.0864], 1.2630],
  [[61.2901, 3.7196, -5.3901], [61.4292, 2.2480, -4.9620], 1.8731],
  [[35.0831, -44.1164, 3.7933], [35.0232, -40.0716, 1.5901], 1.8645],
  [[22.7233, 20.0904, -46.6940], [23.0331, 14.9730, -42.5619], 2.0373],
  [[36.4612, 47.8580, 18.3852], [36.2715, 50.5065, 21.2231], 1.4146],
  [[90.8027, -2.0831, 1.4410], [91.1528, -1.6435, 0.0447], 1.4441],
  [[90.9257, -0.5406, -0.9208], [88.6381, -0.8985, -0.7239], 1.5381],
  [[6.7747, -0.2908, -2.4247], [5.8714, -0.0985, -2.2286], 0.6377],
  [[2.0776, 0.0795, -1.1350], [0.9033, -0.0636, -0.5514], 0.9082],
];

test('ΔE2000 matches the Sharma, Wu & Dalal reference pairs', () => {
  const triple = ([L, a, b]) => ({ L, a, b });
  for (const [one, two, want] of SHARMA) {
    const got = deltaELab(triple(one), triple(two));
    assert.ok(
      Math.abs(got - want) < 0.0002,
      `${one.join(',')} vs ${two.join(',')}: want ${want}, got ${got.toFixed(4)}`,
    );
  }
});

test('the measurement is symmetric and zero against itself', () => {
  const values = Object.values(SERIES);
  for (let i = 0; i < values.length; i++) {
    assert.equal(deltaE(values[i], values[i]), 0);
    for (let j = i + 1; j < values.length; j++) {
      const ab = deltaE(values[i], values[j]);
      assert.ok(Math.abs(ab - deltaE(values[j], values[i])) < 1e-9, `${values[i]}/${values[j]}`);
    }
  }
});

test('every vision is measured, including the rare one', () => {
  // The palette is separated under all three dichromacies, not just the two
  // common ones. Requiring tritanopia as well cost nothing measurable when it
  // was tried both ways, and leaving it out is the kind of carve-out this file
  // exists to stop.
  assert.deepEqual(VISIONS, ['normal', 'protanopia', 'deuteranopia', 'tritanopia']);
});
