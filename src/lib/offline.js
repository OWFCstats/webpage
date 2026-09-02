/**
 * Being on a bad connection, or none at all — the two halves of it.
 *
 * The site is designed around a phone on a Saturday night, and it installs to a
 * home screen where there is no address bar and no reload. So:
 *
 * - `registerServiceWorker()` puts `public/sw.js` in front of every request, so
 *   the app opens to its own frame with no signal rather than to the browser's
 *   offline page. That file's header is the whole design.
 * - `describeLoadFailure()` decides what a failed read says. A phone with no
 *   signal is not a broken site, and "Couldn't load data: Failed to fetch" is
 *   the sentence a reader gets told for standing in a car park.
 */

// Production only, and for the same reason `lib/analytics.js` is: `npm run
// dev:fixture`, `npm run shots` and `npm run check:layout` all drive the real
// pages through the dev server, and a worker caching a fixture build would
// serve the harness a site from the previous run.
const enabled = import.meta.env.PROD;

/**
 * Registers the worker, and never lets it matter if it fails.
 *
 * A registration that rejects — an unsupported browser, a private window, a
 * `sw.js` that 404s off a half-finished deploy — is the site working exactly as
 * it did before this file existed. It is not worth a line of UI.
 */
export function registerServiceWorker() {
  if (!enabled) return;
  const container = globalThis.navigator?.serviceWorker;
  if (!container) return;

  const register = () => {
    container
      // Relative to the document, which is the scope root on both origins the
      // site is served from — github.io/webpage/ and the domain's own root.
      // `updateViaCache: 'none'` so the browser re-asks for this file rather
      // than serving it from its own HTTP cache; a worker that can't be
      // replaced is the one bug on this whole page with no remedy.
      .register(`${import.meta.env.BASE_URL}sw.js`, { updateViaCache: 'none' })
      .catch(() => {});
  };

  // After load, so registering never competes with the first paint for the
  // connection it is there to survive — but not *only* after load, because a
  // module script that has already missed the event would never register at
  // all, and the symptom is a phone with no signal weeks later.
  if (globalThis.document?.readyState === 'complete') register();
  else globalThis.addEventListener('load', register, { once: true });
}

// What a dead connection looks like by the time supabase-js is done with it.
// Every engine words it differently and none of them use a code: Chrome throws
// "Failed to fetch", Safari "Load failed", Firefox "NetworkError when
// attempting to fetch resource". PostgREST's own failures arrive as a message
// with a code beside it, so there is nothing here they collide with.
const NETWORK = /failed to fetch|load failed|networkerror|network request failed/i;

const NO_CONNECTION = 'No connection — the stats will load as soon as you’re back online.';

/**
 * One sentence for the page column, whole rather than a fragment: the offline
 * case can't be led into by "Couldn't load data:", and `ErrorNote` has one
 * producer (`DataContext`) so there is nothing else the prefix was buying.
 *
 * `onLine === false` is the browser being certain; true only means it has an
 * interface, which a pub car park also has, so the message text is the other
 * half of the test.
 */
export function describeLoadFailure(
  message,
  { online = globalThis.navigator?.onLine !== false } = {},
) {
  if (!online || NETWORK.test(message ?? '')) return NO_CONNECTION;
  return `Couldn’t load data: ${message}`;
}
