// Ingesting a drop of badge art.
//
//   node scripts/badges.mjs ~/Downloads/badges
//
// Reads every SVG in a directory of Figma exports, renames each one to the key
// the badge system knows it by, optimises it, and writes it into
// src/assets/badges/. Nothing else touches that directory.
//
// It exists because the art arrives named for the artboard rather than for the
// badge — `SIlver_Assists.svg`, typo included — and because a Figma export
// carries six decimal places of coordinate on a 450-unit viewBox. Six is
// 0.0002% of the drawing and 55% of the file: the 22 exports are 1.8 MB as
// supplied and 807 KB at one decimal, which at the sizes this site draws them
// (20–72px, so a unit is a tenth of a pixel) is a difference nothing can see.
// Renders diffed at 48px and 200px before the precision was chosen — see
// DESIGN.md → The icons.
//
// Run it as `npm run badges -- <directory>` and commit what it writes, then
// check `npm test`: the asset test is what says the drop is complete and the
// drawings are the size the system expects. The npm script carries
// `--import ./tests/register.mjs` because this reads the badge list out of
// src/, and src/ imports without file extensions — that shim is the project's
// one answer to Node's loader not doing what Vite's does.

import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';
import { optimize } from 'svgo';
import { BADGE_ART } from '../src/lib/badge-art.js';

/** The export's own name, lowercased and stripped of separators, to whatever
 *  the badge system calls it. Keyed loosely on purpose: the artboard names are
 *  a human's, so `Diamond_Appearance` and `Gold_Clean_Sheet` are the singulars
 *  of two plurals and one of them is capitalised `SIlver`. */
const FROM_ARTBOARD = {
  bronzeappearances: 'appearances-bronze',
  silverappearances: 'appearances-silver',
  goldappearances: 'appearances-gold',
  diamondappearance: 'appearances-diamond',
  bronzeassists: 'assists-bronze',
  silverassists: 'assists-silver',
  goldassists: 'assists-gold',
  diamondassists: 'assists-diamond',
  bronzecleansheets: 'clean-sheets-bronze',
  silvercleansheets: 'clean-sheets-silver',
  goldcleansheet: 'clean-sheets-gold',
  diamondcleansheet: 'clean-sheets-diamond',
  bronzegoals: 'goals-bronze',
  silvergoals: 'goals-silver',
  goldgoals: 'goals-gold',
  diamondgoals: 'goals-diamond',
  motm: 'motm',
  hattrick: 'hat-trick',
  playerofseason: 'player-of-the-season',
  goldenboot: 'golden-boot',
  playmaker: 'playmaker',
  thedependable: 'the-dependable',
};

/** One decimal place. See the note at the top — this is the whole reason the
 *  script exists, so it is a constant rather than a flag nobody would set. */
const PRECISION = 1;

const OUT = new URL('../src/assets/badges/', import.meta.url);

const loose = (name) => basename(name, '.svg').toLowerCase().replace(/[^a-z0-9]/g, '');

function main(dir) {
  if (!dir) {
    console.error('usage: node scripts/badges.mjs <directory of svg exports>');
    process.exit(2);
  }
  mkdirSync(OUT, { recursive: true });
  const files = readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.svg'));
  const written = new Set();
  let before = 0;
  let after = 0;

  for (const file of files.sort()) {
    const key = FROM_ARTBOARD[loose(file)];
    if (!key) {
      console.error(`  ? ${file} — no badge answers to this name, skipped`);
      continue;
    }
    const source = readFileSync(`${dir}/${file}`, 'utf8');
    // `removeViewBox` off: the viewBox is how a drawing keeps its own aspect
    // ratio, and the badges are not square — the hat-trick is 550×351.
    const { data } = optimize(source, {
      multipass: true,
      floatPrecision: PRECISION,
      plugins: [{ name: 'preset-default', params: { overrides: { removeViewBox: false } } }],
    });
    writeFileSync(new URL(`${key}.svg`, OUT), data);
    written.add(key);
    before += Buffer.byteLength(source);
    after += Buffer.byteLength(data);
    console.log(`  ${file} → ${key}.svg  ${kb(Buffer.byteLength(source))} → ${kb(Buffer.byteLength(data))}`);
  }

  const missing = BADGE_ART.filter((key) => !written.has(key));
  console.log(`\n${written.size} of ${BADGE_ART.length} drawings written, ${kb(before)} → ${kb(after)}`);
  if (missing.length > 0) {
    console.error(`missing: ${missing.join(', ')}`);
    process.exit(1);
  }
}

const kb = (n) => `${Math.round(n / 1024)} KB`;

main(process.argv[2]);
