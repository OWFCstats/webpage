// lib/offline.js — what a reader is told when the connection is gone, and the
// registration that gets them a frame to be told it in. Both are invisible when
// they work and both only happen on the connection nobody is testing on, which
// is the case for asserting them here rather than trusting a read-through.
//
// Imported dynamically, with a fresh query string each time, because the module
// reads its build variables at module scope — a static import would be hoisted
// above process.env. Same reason as tests/analytics.test.js.

import assert from 'node:assert/strict';
import { test } from 'node:test';

let instance = 0;

/** The module, with a fake browser around it. `prod` null means unset. */
async function offline({ prod = '1', base = './', worker = true, readyState = 'loading' } = {}) {
  for (const [name, value] of Object.entries({ PROD: prod, BASE_URL: base })) {
    if (value === null) delete process.env[name];
    else process.env[name] = value;
  }

  const registered = [];
  const listeners = [];
  const original = {
    navigator: globalThis.navigator,
    add: globalThis.addEventListener,
    document: globalThis.document,
  };
  globalThis.document = { readyState };

  Object.defineProperty(globalThis, 'navigator', {
    value: worker
      ? { serviceWorker: { register: (url, opts) => { registered.push([url, opts]); return Promise.resolve({}); } } }
      : {},
    configurable: true,
    writable: true,
  });
  globalThis.addEventListener = (type, handler, opts) => listeners.push({ type, handler, opts });

  const mod = await import(`../src/lib/offline.js?${(instance += 1)}`);
  const restore = () => {
    Object.defineProperty(globalThis, 'navigator', { value: original.navigator, configurable: true, writable: true });
    globalThis.addEventListener = original.add;
    if (original.document === undefined) delete globalThis.document;
    else globalThis.document = original.document;
  };
  return { mod, registered, listeners, restore };
}

test('registers the worker after load, once, at the base URL', async () => {
  const { mod, registered, listeners, restore } = await offline({ base: './' });
  try {
    mod.registerServiceWorker();
    assert.equal(registered.length, 0, 'nothing before load — the first paint comes first');
    assert.equal(listeners.length, 1);
    assert.equal(listeners[0].type, 'load');
    assert.deepEqual(listeners[0].opts, { once: true });

    listeners[0].handler();
    assert.deepEqual(registered, [['./sw.js', { updateViaCache: 'none' }]]);
  } finally {
    restore();
  }
});

test('a load event already missed still registers', async () => {
  // A module script runs before `load`, so this shouldn't happen — but if it
  // ever did, waiting for an event that has been and gone would leave a phone
  // with no shell and nothing to show for it.
  const { mod, registered, listeners, restore } = await offline({ readyState: 'complete' });
  try {
    mod.registerServiceWorker();
    assert.deepEqual(listeners, []);
    assert.deepEqual(registered, [['./sw.js', { updateViaCache: 'none' }]]);
  } finally {
    restore();
  }
});

test('does nothing outside a production build', async () => {
  // The harness drives the real pages through the dev server; a worker there
  // would serve `npm run shots` a site from the previous run.
  const { mod, registered, listeners, restore } = await offline({ prod: null });
  try {
    mod.registerServiceWorker();
    assert.deepEqual(listeners, []);
    assert.deepEqual(registered, []);
  } finally {
    restore();
  }
});

test('does nothing where service workers do not exist', async () => {
  const { mod, listeners, restore } = await offline({ worker: false });
  try {
    mod.registerServiceWorker();
    assert.deepEqual(listeners, []);
  } finally {
    restore();
  }
});

test('a registration that rejects is not the site going down', async () => {
  const { mod, listeners, restore } = await offline();
  try {
    globalThis.navigator.serviceWorker.register = () => Promise.reject(new Error('no'));
    mod.registerServiceWorker();
    listeners[0].handler();
    // The rejection is swallowed; an unhandled one would take the load handler
    // with it on a browser that simply doesn't do this.
    await new Promise((resolve) => setImmediate(resolve));
  } finally {
    restore();
  }
});

test('every engine’s way of saying the network is gone reads as no connection', async () => {
  const { mod, restore } = await offline();
  try {
    const { describeLoadFailure } = mod;
    for (const message of [
      'Failed to fetch',
      'TypeError: Failed to fetch',
      'Load failed',
      'NetworkError when attempting to fetch resource.',
      'Network request failed',
    ]) {
      assert.match(describeLoadFailure(message, { online: true }), /^No connection/, message);
    }
  } finally {
    restore();
  }
});

test('a browser that knows it is offline needs no message to go on', async () => {
  const { mod, restore } = await offline();
  try {
    assert.match(mod.describeLoadFailure('anything at all', { online: false }), /^No connection/);
    assert.match(mod.describeLoadFailure(undefined, { online: false }), /^No connection/);
  } finally {
    restore();
  }
});

test('a real API failure still says what it was', async () => {
  const { mod, restore } = await offline();
  try {
    const { describeLoadFailure } = mod;
    // PostgREST's own errors: a reader can't act on these, but an admin
    // reading them over the phone is how one gets fixed.
    assert.equal(
      describeLoadFailure('permission denied for table appearances', { online: true }),
      'Couldn’t load data: permission denied for table appearances',
    );
    assert.equal(
      describeLoadFailure('JWT issued at future', { online: true }),
      'Couldn’t load data: JWT issued at future',
    );
  } finally {
    restore();
  }
});
