// npm run check:layout — the mobile invariants, as assertions.
//
// Every route in scripts/site-map.js, both fixture datasets, every supported
// width. What counts as a failure is in scripts/collect.js; what is already
// known to fail and whose phase owns it is in scripts/expected-failures.js.
//
// Exit codes: 0 when every failure is a known one, 1 when anything else broke
// and 1 when a known failure has stopped happening — a list that outlives the
// bug it describes is how a check goes quiet. Whoever fixes it deletes the
// entry in the same commit.

import { DATASET_NAMES, ROUTES, WIDTHS } from './site-map.js';
import { collector } from './collect.js';
import { EXPECTED } from './expected-failures.js';
import { pageBudgets, startHarness, visit } from './harness.mjs';

const only = process.argv.includes('--route')
  ? process.argv[process.argv.indexOf('--route') + 1]
  : null;
const routes = only ? ROUTES.filter((r) => r.id === only) : ROUTES;
const asJson = process.argv.includes('--json');

/**
 * An expectation covers a grouped finding when every field it names matches.
 * A grouped finding spans datasets, so `dataset` matches if the group touched
 * it at all — an entry scoped to one dataset can't quietly excuse the other.
 */
function expectationFor(finding) {
  return EXPECTED.find(
    (e) =>
      e.invariant === finding.invariant
      && (e.route == null || e.route === finding.route)
      && (e.dataset == null || finding.datasets.includes(e.dataset))
      && (e.match == null || finding.signature.includes(e.match) || finding.label.includes(e.match)),
  );
}

const harness = await startHarness();
const budgets = pageBudgets();
const findings = [];
const heights = [];
let iconsMeasured = 0;

try {
  for (const dataset of DATASET_NAMES) {
    for (const width of WIDTHS) {
      const page = await harness.open(dataset, width);
      for (const route of routes) {
        await visit(page, route.route, { charts: route.charts, open: route.open });
        const result = await page.evaluate(collector);
        iconsMeasured += result.iconsMeasured;
        heights.push({ dataset, width, route: route.id, name: route.name, height: result.height, budget: route.budget });
        for (const f of result.findings) {
          findings.push({ ...f, dataset, width, route: route.id, name: route.name });
        }
        for (const problem of page.fixtureProblems) {
          findings.push({
            invariant: 'page-error',
            signature: route.route,
            label: problem,
            detail: problem,
            dataset,
            width,
            route: route.id,
            name: route.name,
          });
        }
      }
      await page.context().close();
      process.stderr.write(`  ${dataset} @ ${width}px — ${routes.length} routes\n`);
    }
  }
} finally {
  await harness.close();
}

// One entry per distinct problem rather than per measurement: the same clipped
// name at six widths is one bug, and a report that says it six times buries the
// other five. The numbers are kept per width underneath, because "hides 374px
// at 320px, 319px at 375px" is the sentence a phase needs and "hides some
// pixels somewhere" is not.
function group(list) {
  const byKey = new Map();
  for (const f of list) {
    const key = `${f.invariant}|${f.route}|${f.signature}|${f.detail.replace(/\d+/g, '#')}`;
    if (!byKey.has(key)) byKey.set(key, { ...f, widths: new Set(), datasets: new Set(), measured: new Map() });
    const row = byKey.get(key);
    row.widths.add(f.width);
    row.datasets.add(f.dataset);
    // Keyed by width and keeping the worst reading: the two datasets differ
    // by a row or two of content, and "hides 247px at 320px" twice with a 4px
    // gap between them is noise around one measurement.
    const seen = row.measured.get(f.width);
    const size = (detail) => Number(detail.match(/\d+/)?.[0] ?? 0);
    if (!seen || size(f.detail) > size(seen)) row.measured.set(f.width, f.detail);
  }
  return [...byKey.values()].map((r) => ({
    ...r,
    widths: [...r.widths].sort((a, b) => a - b),
    datasets: [...r.datasets],
    measured: [...r.measured]
      .sort((a, b) => a[0] - b[0])
      .map(([width, detail]) => ({ width, detail })),
  }));
}

const grouped = group(findings);
const known = [];
const broken = [];
for (const row of grouped) {
  const expectation = expectationFor(row);
  if (expectation) known.push({ ...row, expectation });
  else broken.push(row);
}
const stale = EXPECTED.filter((e) => !known.some((k) => k.expectation === e));

if (asJson) {
  console.log(JSON.stringify({ findings: grouped, heights }, null, 2));
}

const at = (row) => `${row.widths.join('/')}px`;
function measurements(row, indent) {
  // Identical at every width — one line, not six.
  const details = new Set(row.measured.map((m) => m.detail));
  if (details.size === 1) {
    console.log(`${indent}${row.measured.map((m) => m.width).join('/')}px: ${row.measured[0].detail}`);
    return;
  }
  for (const m of row.measured) console.log(`${indent}${m.width}px: ${m.detail}`);
}

console.log('');
console.log(`check:layout — ${routes.length} routes × ${DATASET_NAMES.length} datasets × ${WIDTHS.length} widths`);
console.log(`${iconsMeasured} icons measured for contrast`);

if (broken.length > 0) {
  console.log(`\nFAILURES (${broken.length})`);
  for (const row of broken) {
    console.log(`\n  ${row.invariant} — ${row.name} @ ${at(row)} (${row.datasets.join(', ')})`);
    console.log(`    ${row.signature}`);
    measurements(row, '    ');
    if (row.label && !row.detail.includes(row.label)) console.log(`    text: ${row.label}`);
  }
}

if (known.length > 0) {
  console.log(`\nKNOWN, ALREADY OWNED (${known.length})`);
  for (const row of known) {
    console.log(`\n  ${row.invariant} — ${row.name} @ ${at(row)} (${row.datasets.join(', ')})`);
    console.log(`    ${row.signature}`);
    measurements(row, '    ');
    console.log(`    ${row.expectation.owner}: ${row.expectation.why}`);
  }
}

if (stale.length > 0) {
  console.log(`\nFIXED, STILL ON THE LIST (${stale.length})`);
  for (const e of stale) {
    console.log(`\n  ${e.invariant} — ${e.route ?? 'any route'} / ${e.match ?? 'any element'}`);
    console.log(`    ${e.owner}: ${e.why}`);
    console.log('    this no longer fails — delete the entry from scripts/expected-failures.js');
  }
}

// Heights are reported, not asserted. Every page but Matchday is over budget
// today and the phase that meets each one is named in ROADMAP → Page budgets;
// failing here would make the check red for eleven phases and it would stop
// being read. `npm run shots` reports the same numbers in full.
const overBudget = heights
  .filter((h) => h.width === 375 && h.dataset === 'mid-season' && h.budget && budgets.get(h.budget))
  .filter((h) => h.height > budgets.get(h.budget));
if (overBudget.length > 0) {
  console.log(`\nOVER HEIGHT BUDGET at 375px (${overBudget.length}) — reported, not asserted`);
  for (const h of overBudget) {
    console.log(`  ${h.name} — ${h.height}px against ${budgets.get(h.budget)}px (${h.budget})`);
  }
}

console.log('');
if (broken.length === 0 && stale.length === 0) {
  console.log(`PASS — ${known.length} known failure${known.length === 1 ? '' : 's'} on the list, nothing new.`);
  process.exit(0);
}
console.log(`FAIL — ${broken.length} unexpected, ${stale.length} stale on the expected-failure list.`);
process.exit(1);
