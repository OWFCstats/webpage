// Boots the real site against a fixture and hands back pages to measure.
//
// Uses Vite's own dev server rather than a build, so what gets measured is the
// same module graph `npm run dev:fixture` serves — one less way for the check
// and the site to disagree. FIXTURE=1 is what turns on the resolve.alias in
// vite.config.js.

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { createServer } from 'vite';
import { DATASETS } from '../fixtures/datasets.js';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

/**
 * Playwright's own download is skipped in some sandboxes, which leaves a
 * Chromium on disk that its version pin doesn't point at. Prefer the pinned
 * one and fall back to whatever is installed rather than failing on a browser
 * that is right there.
 */
function executablePath() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  const pinned = chromium.executablePath();
  if (existsSync(pinned)) return undefined; // let Playwright use its own
  const fallback = join(process.env.PLAYWRIGHT_BROWSERS_PATH ?? '/opt/pw-browsers', 'chromium');
  if (existsSync(fallback)) return fallback;
  return undefined;
}

export async function startHarness() {
  // vite.config.js reads this when the config is loaded, which is what adds
  // the resolve.alias — the same switch `npm run dev:fixture` throws.
  process.env.FIXTURE = '1';
  const server = await createServer({
    root,
    mode: 'development',
    configFile: join(root, 'vite.config.js'),
    server: { port: 0, strictPort: false, host: '127.0.0.1' },
    logLevel: 'warn',
  });
  await server.listen();
  const { port } = server.httpServer.address();
  const base = `http://127.0.0.1:${port}`;

  const browser = await chromium.launch({ executablePath: executablePath() });

  return {
    base,
    async close() {
      await browser.close();
      await server.close();
    },

    /**
     * A page pinned to one dataset and one width. The clock is fixed to the
     * dataset's own `now`, because the fixture countdown reads it and a
     * measurement that changes with the day it was taken isn't one.
     */
    async open(datasetName, width, height = 900) {
      const dataset = DATASETS[datasetName];
      if (!dataset) throw new Error(`no fixture dataset "${datasetName}"`);
      const context = await browser.newContext({
        viewport: { width, height },
        deviceScaleFactor: 1,
        reducedMotion: 'reduce',
      });
      const page = await context.newPage();
      await page.clock.setFixedTime(new Date(dataset.now));
      const problems = [];
      page.on('pageerror', (err) => problems.push(String(err)));
      page.on('console', (msg) => {
        if (msg.type() === 'error') problems.push(msg.text());
      });
      page.fixtureProblems = problems;
      page.fixtureUrl = (route) => `${base}/?fixture=${datasetName}#${route}`;
      return page;
    },
  };
}

/** Navigates and waits for the app to have rendered something real. `open`
 *  clicks a match report's "Read the rest" control, if the route has one, so
 *  a route can be measured both clamped and open without a second page —
 *  see the `-open` entries in site-map.js. */
export async function visit(page, route, { charts = false, open = false } = {}) {
  page.fixtureProblems.length = 0;
  const url = page.fixtureUrl(route);
  // Hash routing: a same-document hash change doesn't reload, so the route is
  // set on a fresh document every time. Slower, and it means one route can't
  // leave state behind for the next.
  await page.goto('about:blank');
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(
    () => {
      const main = document.querySelector('main');
      return Boolean(main) && !main.querySelector('.spinner') && main.textContent.trim().length > 0;
    },
    null,
    { timeout: 20000 },
  );
  await page.waitForLoadState('networkidle');
  // Recharts animates on mount and doesn't honour reduced motion, so a chart
  // route needs its 1.5s to finish or the screenshot catches a half-drawn line.
  if (charts) await page.waitForTimeout(1900);
  else await page.waitForTimeout(150);
  if (open) {
    const control = page.locator('.report-more');
    if (await control.count() > 0) {
      await control.click();
      await page.waitForTimeout(50);
    }
  }
}

/**
 * The *Page length* table in docs/DESIGN.md, parsed. The doc says it is the
 * authority for these numbers, so the harness reads them from it instead of
 * keeping a copy that can quietly disagree.
 */
export function pageBudgets() {
  const doc = readFileSync(join(root, 'docs', 'DESIGN.md'), 'utf8');
  const section = doc.slice(doc.indexOf('### Page length'));
  const table = section.slice(section.indexOf('| Page |'), section.indexOf('\n\n', section.indexOf('| Page |')));
  const budgets = new Map();
  for (const line of table.split('\n').slice(2)) {
    const cells = line.split('|').map((c) => c.trim()).filter(Boolean);
    if (cells.length < 2) continue;
    const px = Number(cells[1].replace(/,/g, '').match(/^\d+/)?.[0] ?? NaN);
    budgets.set(cells[0], Number.isNaN(px) ? null : px);
  }
  if (budgets.size === 0) {
    throw new Error('docs/DESIGN.md → Page length: no budget table found');
  }
  return budgets;
}
