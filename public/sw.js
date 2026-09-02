/**
 * The offline shell.
 *
 * `manifest.webmanifest` sets `display: standalone`, so the site installs to a
 * home screen and opens with no browser chrome. That is the shortest route the
 * squad has to it, and without this file it is also a promise the site can't
 * keep: on a dead signal an installed app shows the browser's own offline page,
 * which inside a standalone window has no address bar, no back button and no
 * reload anybody can find. The whole point of `Layout`'s boundaries — the frame
 * outlives the page — is undone one layer down, because the frame never renders
 * at all.
 *
 * So the site serves its own shell instead: the document, the bundle, the CSS,
 * the fonts, the crest, the badge drawings. The reader gets the masthead, the
 * tab bar, and a "no connection" note in the page column, which is where the
 * spinner and `ErrorNote` already go.
 *
 * **Network-first, and that is not a preference.** A cache-first worker on a
 * static host is how a squad ends up pinned to a build from three weeks ago,
 * and the club has no channel for telling thirty people to clear a site's
 * storage. Every request tries the network first and only falls back to the
 * cache; a response that arrives refreshes the cache on the way past.
 *
 * **Same-origin GETs only, which is the whole exclusion rule.** Every read and
 * write of club data, and the login behind them, is a cross-origin request to
 * Supabase — so no row, no token and no session ever reaches this cache, and
 * a shared phone in a pub carries nothing away. Not by a list of paths that
 * could go stale, but because those requests are never handled here at all.
 *
 * No build step touches this file: it is served whole and unversioned from
 * `public/`, like the crest and the share card, because a service worker has to
 * live at a stable address inside the scope it controls.
 *
 * Registered by `src/lib/offline.js`, production only.
 */

// Bumped only when the strategy above changes — a fresh deploy is handled by
// the build check in `storeShell`, not by renaming the cache. On activate,
// anything that isn't this name is deleted.
const CACHE = 'owfc-shell-v1';

// The one document this single-page app has. Every navigation inside the scope
// resolves to it, so it is cached under this one key rather than under whatever
// URL the reader happened to arrive on — `/`, `/index.html` and a deep link
// carrying `#/players/...` are all the same file. This worker is served from
// the scope root, so its own directory is the document's URL.
const SHELL = new URL('./', self.location.href).href;

self.addEventListener('install', (event) => {
  // Prime the document on the visit that installs the worker, not the one after
  // it: the first launch is over by the time this runs, so nothing else would
  // put the shell in the cache until the next navigation. The rest of the shell
  // fills in on the way past.
  event.waitUntil((async () => {
    try {
      const cache = await caches.open(CACHE);
      const fresh = await fetch(SHELL);
      if (fresh.status === 200) await storeShell(cache, fresh);
    } catch {
      // No signal on the visit that installs the worker. Nothing to do: the
      // next navigation stores the shell.
    }
  })());
  // No point waiting for every tab to close before a worker whose only job is
  // the visit where the signal dies.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name !== CACHE) await caches.delete(name);
    }
    // Control the page that installed us, so the fonts and badge drawings it
    // asks for after boot are cached on this visit rather than the next.
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  // Not handled, and therefore not cached: a write of any kind, and everything
  // cross-origin — which is every request that carries club data or a login.
  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    request.mode === 'navigate' ? navigation(request) : asset(request),
  );
});

/** The document: network, then the cached shell whatever URL was asked for. */
async function navigation(request) {
  const cache = await caches.open(CACHE);
  try {
    const fresh = await fetch(request);
    if (fresh.status === 200) await storeShell(cache, fresh.clone());
    return fresh;
  } catch (err) {
    const shell = await cache.match(SHELL);
    if (shell) return shell;
    // A first visit with no signal, and nothing to serve. Letting this reject
    // gives the browser's own offline page — the state this file exists to
    // avoid, and the one case where there is no alternative.
    throw err;
  }
}

/** Everything else the shell is made of: network, then whatever we last had. */
async function asset(request) {
  const cache = await caches.open(CACHE);
  try {
    const fresh = await fetch(request);
    // 200 only: a 404 is not worth keeping, and the Cache API refuses a 206.
    if (fresh.status === 200) await cache.put(request, fresh.clone());
    return fresh;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw err;
  }
}

/**
 * Store the document, and drop the previous build with it.
 *
 * `index.html` names its assets by content hash, so a document that differs
 * from the cached one *is* a new deploy. Without this the cache keeps every
 * build the club has ever shipped — nothing breaks, but the site's storage
 * grows by a copy of itself every push to `main`.
 *
 * A text comparison rather than a version stamped in at build time, because
 * this file is deliberately outside the build (see the header).
 */
async function storeShell(cache, response) {
  const html = await response.clone().text();
  const previous = await cache.match(SHELL);
  if (previous && (await previous.text()) !== html) {
    for (const key of await cache.keys()) await cache.delete(key);
  }
  await cache.put(SHELL, response);
}
