// npm run shots — every route, both datasets, every supported width.
//
// Writes full-page PNGs to shots/ (git-ignored: they're an output, and a
// binary one) and prints the page heights against the budgets in
// docs/DESIGN.md, which is what "pages are 2,000–4,800px tall on a phone" was
// measured by hand once and never again.
//
// Flags: --dataset <name>, --route <id>, --width <px> to narrow a run while
// working on one page.

import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DATASET_NAMES, DESIGN_WIDTH, ROUTES, WIDTHS } from './site-map.js';
import { pageBudgets, startHarness, visit } from './harness.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const arg = (flag) =>
  process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : null;

const datasets = arg('--dataset') ? [arg('--dataset')] : DATASET_NAMES;
const widths = arg('--width') ? [Number(arg('--width'))] : WIDTHS;
const routes = arg('--route') ? ROUTES.filter((r) => r.id === arg('--route')) : ROUTES;
const outDir = join(root, 'shots');

if (!arg('--route') && !arg('--width') && !arg('--dataset')) await rm(outDir, { recursive: true, force: true });

const harness = await startHarness();
const budgets = pageBudgets();
const heights = [];

try {
  for (const dataset of datasets) {
    for (const width of widths) {
      const dir = join(outDir, dataset, String(width));
      await mkdir(dir, { recursive: true });
      const page = await harness.open(dataset, width);
      for (const route of routes) {
        await visit(page, route.route, { charts: route.charts });
        await page.screenshot({ path: join(dir, `${route.id}.png`), fullPage: true });
        const height = await page.evaluate(() =>
          Math.max(document.documentElement.scrollHeight, document.body.scrollHeight));
        heights.push({ dataset, width, route: route.id, name: route.name, budget: route.budget, height });
      }
      await page.context().close();
      process.stderr.write(`  ${dataset} @ ${width}px — ${routes.length} shots\n`);
    }
  }
} finally {
  await harness.close();
}

await writeFile(join(outDir, 'heights.json'), `${JSON.stringify(heights, null, 2)}\n`);

// The budget is stated at 375px, so that is the column worth printing. A route
// with no budget of its own (the squad roster) still gets its height reported —
// "no cap" is a decision, not a reason to stop measuring.
const pad = (s, n) => String(s).padEnd(n);
const padLeft = (s, n) => String(s).padStart(n);
for (const dataset of datasets) {
  const rows = heights.filter((h) => h.dataset === dataset && h.width === DESIGN_WIDTH);
  if (rows.length === 0) continue;
  console.log(`\n${dataset} @ ${DESIGN_WIDTH}px`);
  console.log(`  ${pad('page', 52)}${padLeft('height', 8)}${padLeft('budget', 9)}  over by`);
  for (const row of rows) {
    const budget = row.budget ? budgets.get(row.budget) : null;
    const over = budget ? row.height - budget : null;
    console.log(
      `  ${pad(row.name, 52)}${padLeft(`${row.height}px`, 8)}`
      + `${padLeft(budget ? `${budget}px` : '—', 9)}`
      + `  ${over == null ? '—' : over > 0 ? `+${over}px` : 'within'}`,
    );
  }
}

console.log(`\n${heights.length} shots in shots/ — heights in shots/heights.json`);
