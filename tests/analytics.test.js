// lib/analytics.js — what the counter files, which is all of Phase 45. The
// dashboard is the only place these numbers are ever read, and nobody reads it
// against a known set of visits, so a wrong path or a dropped view would look
// exactly like a quiet Saturday.
//
// Imported dynamically, and with a fresh query string each time, because the
// module reads its build variables at module scope and keeps the queue in
// module state: a static import would be hoisted above process.env, and one
// shared instance would make every test depend on the order of the last.

import assert from 'node:assert/strict';
import { test } from 'node:test';

const SRC = 'https://gc.zgo.at/count.js';
const ATTR = 'data-goatcounter=https://owfc.goatcounter.com/count';

// A real one, from fixtures/uuid.js — the shape the collapse has to recognise.
const PLAYER = '3f2b0a1c-4d5e-4a7b-8c9d-0e1f2a3b4c5d';

let instance = 0;

/**
 * The module, configured, with a fake browser around it. `null` means the
 * variable is unset — not `undefined`, which a destructuring default swallows.
 */
async function counter({ src = SRC, attr = ATTR, prod = '1' } = {}) {
  for (const [name, value] of Object.entries({
    VITE_ANALYTICS_SRC: src,
    VITE_ANALYTICS_ATTR: attr,
    PROD: prod,
  })) {
    if (value === null) delete process.env[name];
    else process.env[name] = value;
  }

  const filed = [];
  const script = {
    attrs: {},
    on: {},
    setAttribute(name, value) {
      this.attrs[name] = value;
    },
    addEventListener(type, fn) {
      this.on[type] = fn;
    },
  };
  let appended = null;
  globalThis.window = globalThis;
  globalThis.document = {
    createElement: () => script,
    head: {
      appendChild(node) {
        appended = node;
      },
    },
  };
  delete globalThis.goatcounter;

  const api = await import(`../src/lib/analytics.js?${instance++}`);
  return {
    ...api,
    filed,
    script,
    get appended() {
      return appended;
    },
    /** count.js arriving: it augments the object already on window, then loads. */
    scriptLands() {
      window.goatcounter.count = (vars) => filed.push(vars);
      script.on.load();
    },
  };
}

test('a player id collapses to its route, and fires the player event', async () => {
  const { describeView } = await counter();
  assert.deepEqual(describeView(`/players/${PLAYER}`), {
    path: '/players/:playerId',
    event: 'player-page',
  });
});

test('a match id collapses under whichever route carries it', async () => {
  const { describeView } = await counter();
  const id = PLAYER; // any uuid — the segment in front is what names the param
  assert.equal(describeView(`/matchday/${id}`).path, '/matchday/:matchId');
  assert.equal(describeView(`/matches/${id}`).path, '/matches/:matchId');
  assert.equal(describeView(`/admin/matches/${id}/lineup`).path, '/admin/matches/:matchId/lineup');
  assert.equal(describeView(`/admin/matches/${id}/report`).path, '/admin/matches/:matchId/report');
});

test('an id under a route nobody thought of still collapses', async () => {
  const { describeView } = await counter();
  assert.equal(describeView(`/somewhere/${PLAYER}`).path, '/somewhere/:id');
});

test('the sub-pages that sit where an id would are left alone', async () => {
  const { describeView } = await counter();
  for (const path of ['/players/squad', '/players/data', '/players']) {
    assert.deepEqual(describeView(path), { path, event: null });
  }
});

test('a readable key keeps its name — a badge is a question the dashboard can answer', async () => {
  const { describeView } = await counter();
  assert.deepEqual(describeView('/records/badges/appearances'), {
    path: '/records/badges/appearances',
    event: 'badge-page',
  });
  // The board itself is not a badge page, and the opponent slug is readable too.
  assert.deepEqual(describeView('/records'), { path: '/records', event: null });
  assert.deepEqual(describeView('/opponents/old-stoics'), {
    path: '/opponents/old-stoics',
    event: null,
  });
});

test('the script is told to count nothing itself, and carries its one attribute', async () => {
  const c = await counter();
  c.startAnalytics();
  assert.equal(c.appended, c.script);
  assert.equal(c.script.src, SRC);
  assert.equal(c.script.defer, true);
  assert.equal(c.script.attrs['data-goatcounter'], 'https://owfc.goatcounter.com/count');
  assert.equal(window.goatcounter.no_onload, true);
});

test('an attribute whose value has its own = is split on the first one only', async () => {
  const c = await counter({ attr: 'data-cf-beacon={"token":"a=b"}' });
  c.startAnalytics();
  assert.equal(c.script.attrs['data-cf-beacon'], '{"token":"a=b"}');
});

test('views taken before the script lands are held, then filed in order', async () => {
  const c = await counter();
  c.startAnalytics();

  c.countView('/'); // the landing view, always ahead of a deferred script
  c.countView(`/players/${PLAYER}`);
  assert.deepEqual(c.filed, [], 'nothing can be sent before count.js exists');

  c.scriptLands();
  assert.deepEqual(c.filed, [
    { path: '/', event: false },
    { path: '/players/:playerId', event: false },
    { path: 'player-page', event: true },
  ]);

  // And from then on it goes straight out, still through the same shaping.
  c.countView('/records/badges/motm');
  assert.deepEqual(c.filed.slice(3), [
    { path: '/records/badges/motm', event: false },
    { path: 'badge-page', event: true },
  ]);
});

test('what is held is bounded — a dead signal is not a licence to grow', async () => {
  const c = await counter();
  c.startAnalytics();
  for (let i = 0; i < 40; i++) c.countView('/season');
  c.scriptLands();
  assert.equal(c.filed.length, 20);
});

test('a script that never arrives drops what it held and stops holding', async () => {
  const c = await counter();
  c.startAnalytics();
  c.countView('/season');
  c.script.on.error();

  // If the counter turns up anyway, the dropped view stays dropped and the
  // next one goes straight out — nothing is still accumulating behind it.
  window.goatcounter.count = (vars) => c.filed.push(vars);
  c.countView('/records');
  assert.deepEqual(c.filed, [{ path: '/records', event: false }]);
});

test('unconfigured, it touches nothing at all', async () => {
  const c = await counter({ src: null, attr: null });
  c.startAnalytics();
  c.countView(`/players/${PLAYER}`);
  assert.equal(c.appended, null);
  assert.equal(globalThis.goatcounter, undefined);
});

test('configured but not a production build, it still touches nothing', async () => {
  const c = await counter({ prod: null });
  c.startAnalytics();
  c.countView('/season');
  assert.equal(c.appended, null);
});
