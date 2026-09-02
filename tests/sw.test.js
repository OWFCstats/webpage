// public/sw.js — the offline shell, driven in a fake worker.
//
// This file is the one part of the site nobody can eyeball: it only does
// anything on a connection that has stopped working, and when it is wrong the
// symptom is either a blank standalone window or a squad pinned to last
// month's build. Neither shows up in a screenshot, so the strategy is asserted
// instead — network-first, shell-only, same-origin GETs, and a new deploy
// evicting the old one.
//
// It is a classic worker script rather than a module, so it is read and run in
// a vm context with the four globals it touches. `Request` is a plain object:
// undici refuses `mode: 'navigate'`, and the worker only ever reads `method`,
// `url` and `mode`.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

const SOURCE = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');
const ORIGIN = 'https://oldwellingtoniansfc.com';
const SCOPE = `${ORIGIN}/`;

const key = (req) => (typeof req === 'string' ? req : req.url);

/** Enough of the Cache API for what the worker asks of it. */
function fakeCaches() {
  const stores = new Map();
  const open = (name) => {
    if (!stores.has(name)) stores.set(name, new Map());
    const entries = stores.get(name);
    return Promise.resolve({
      match: async (req) => entries.get(key(req)),
      put: async (req, res) => { entries.delete(key(req)); entries.set(key(req), res); },
      delete: async (req) => entries.delete(key(req)),
      keys: async () => [...entries.keys()],
    });
  };
  return {
    api: { open, keys: async () => [...stores.keys()], delete: async (n) => stores.delete(n) },
    stores,
  };
}

/**
 * The worker, installed and activated, with a fetch it can be told to fail.
 * `serve` answers by URL; anything it doesn't know 404s.
 */
async function worker({ serve = {} } = {}) {
  const listeners = {};
  const { api: caches, stores } = fakeCaches();
  const state = { online: true, served: [], responses: { ...serve } };

  const context = {
    caches,
    URL,
    Response,
    console,
    fetch: async (req) => {
      const url = key(req);
      state.served.push(url);
      if (!state.online) throw new TypeError('Failed to fetch');
      const body = state.responses[url];
      if (body == null) return new Response('nope', { status: 404 });
      return new Response(body, { status: 200 });
    },
    self: {
      location: { href: `${SCOPE}sw.js`, origin: ORIGIN },
      addEventListener: (type, handler) => { listeners[type] = handler; },
      skipWaiting: () => { state.skipWaiting = true; },
      clients: { claim: async () => { state.claimed = true; } },
    },
  };
  vm.runInNewContext(SOURCE, context);

  // An event, as the worker uses one: waitUntil to hold the lifecycle open and
  // respondWith to take the response.
  const fire = async (type, request) => {
    const held = [];
    let answered;
    listeners[type]({ request, waitUntil: (p) => held.push(p), respondWith: (p) => { answered = p; } });
    await Promise.all(held);
    return answered;
  };

  return { state, stores, fire, listeners, cache: () => stores.get('owfc-shell-v1') };
}

const get = (url, mode = 'no-cors') => ({ method: 'GET', url, mode });
// Sorted: what is in the cache is the assertion, and the order a fake Map
// happens to hold it in is not.
const keys = (w) => [...w.cache().keys()].sort();
const navigate = (url) => ({ method: 'GET', url, mode: 'navigate' });

test('install stores the document, so the visit that installs it counts', async () => {
  const w = await worker({ serve: { [SCOPE]: '<html>build one</html>' } });
  await w.fire('install');
  assert.equal(w.state.skipWaiting, true);
  assert.equal(await (await w.cache().get(SCOPE)).text(), '<html>build one</html>');
});

test('install with no signal leaves the worker in place and empty', async () => {
  const w = await worker();
  w.state.online = false;
  await w.fire('install');
  assert.equal(w.cache().size, 0);
});

test('activate drops every cache but this one, then takes the page over', async () => {
  // A cache name is bumped when the strategy changes, and the shell an older
  // one holds was written by a worker that no longer exists.
  const w = await worker({ serve: { [SCOPE]: '<html>build one</html>' } });
  await w.fire('install');
  w.stores.set('owfc-shell-v0', new Map([[SCOPE, new Response('an older strategy')]]));
  w.stores.set('something-else', new Map());

  await w.fire('activate');
  assert.deepEqual([...w.stores.keys()], ['owfc-shell-v1']);
  assert.equal(await (await w.cache().get(SCOPE)).text(), '<html>build one</html>');
  assert.equal(w.state.claimed, true);
});

test('a write is never handled, and therefore never cached', async () => {
  const w = await worker();
  assert.equal(await w.fire('fetch', { method: 'POST', url: `${SCOPE}anything`, mode: 'cors' }), undefined);
});

test('Supabase is never handled — no row, no token, nothing to leave behind', async () => {
  const w = await worker();
  const reads = [
    'https://abc.supabase.co/rest/v1/players?select=*',
    'https://abc.supabase.co/auth/v1/token?grant_type=password',
    'https://gc.zgo.at/count.js',
  ];
  for (const url of reads) {
    assert.equal(await w.fire('fetch', get(url, 'cors')), undefined, url);
  }
  assert.equal(w.cache(), undefined, 'nothing was even opened');
});

test('the network wins, and refreshes the cache on the way past', async () => {
  const w = await worker({ serve: { [`${SCOPE}assets/app-aaa.js`]: 'one' } });
  const asset = get(`${SCOPE}assets/app-aaa.js`);
  assert.equal(await (await w.fire('fetch', asset)).text(), 'one');

  w.state.responses[`${SCOPE}assets/app-aaa.js`] = 'two';
  assert.equal(await (await w.fire('fetch', asset)).text(), 'two');
  assert.equal(await (await w.cache().get(`${SCOPE}assets/app-aaa.js`)).text(), 'two');
});

test('a 404 is answered but not kept', async () => {
  const w = await worker();
  const missing = get(`${SCOPE}crest.png`);
  assert.equal((await w.fire('fetch', missing)).status, 404);
  assert.equal(await w.cache().get(`${SCOPE}crest.png`), undefined);
});

test('with no signal the shell is served, whatever URL was asked for', async () => {
  const w = await worker({
    serve: { [SCOPE]: '<html>shell</html>', [`${SCOPE}assets/app.css`]: 'body{}' },
  });
  await w.fire('fetch', navigate(SCOPE));
  await w.fire('fetch', get(`${SCOPE}assets/app.css`));

  w.state.online = false;
  // A deep link out of the group chat: one document, so it answers from the
  // one key the shell is stored under rather than 404ing on its own URL.
  assert.equal(await (await w.fire('fetch', navigate(`${SCOPE}index.html`))).text(), '<html>shell</html>');
  assert.equal(await (await w.fire('fetch', get(`${SCOPE}assets/app.css`))).text(), 'body{}');
});

test('a first visit with no signal has nothing to serve, and says so', async () => {
  const w = await worker();
  w.state.online = false;
  await assert.rejects(w.fire('fetch', navigate(SCOPE)), /Failed to fetch/);
});

test('a fresh deploy replaces the old one rather than stacking on it', async () => {
  const w = await worker({
    serve: {
      [SCOPE]: '<html src="app-aaa.js">',
      [`${SCOPE}assets/app-aaa.js`]: 'one',
      [`${SCOPE}assets/app-bbb.js`]: 'two',
    },
  });
  await w.fire('fetch', navigate(SCOPE));
  await w.fire('fetch', get(`${SCOPE}assets/app-aaa.js`));
  assert.equal(w.cache().size, 2);

  // index.html names its assets by content hash, so a changed document is a
  // new build and everything under the old hashes is dead weight.
  w.state.responses[SCOPE] = '<html src="app-bbb.js">';
  await w.fire('fetch', navigate(SCOPE));
  assert.deepEqual(keys(w), [SCOPE]);

  await w.fire('fetch', get(`${SCOPE}assets/app-bbb.js`));
  assert.deepEqual(keys(w), [SCOPE, `${SCOPE}assets/app-bbb.js`]);
});

test('an unchanged document keeps the build it already has', async () => {
  const w = await worker({
    serve: { [SCOPE]: '<html src="app-aaa.js">', [`${SCOPE}assets/app-aaa.js`]: 'one' },
  });
  await w.fire('fetch', navigate(SCOPE));
  await w.fire('fetch', get(`${SCOPE}assets/app-aaa.js`));
  await w.fire('fetch', navigate(SCOPE));
  assert.deepEqual(keys(w), [SCOPE, `${SCOPE}assets/app-aaa.js`]);
});
