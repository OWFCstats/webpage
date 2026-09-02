/**
 * Usage counting, and nothing else.
 *
 * GitHub Pages is a file host — there are no server logs to read — so the only
 * way to know whether anybody opened the site after Saturday's game is a small
 * script in the page. The question this has to answer is "did the squad come
 * back", not "who are they", so what goes in is a cookieless counter: no
 * personal data, no consent banner, and nothing that would make the site worth
 * avoiding.
 *
 * The *configuration* names no vendor. Which counter the club signs up to is a
 * dashboard decision, so it arrives as two build-time variables:
 *
 *   VITE_ANALYTICS_SRC    the script URL the provider gives you
 *   VITE_ANALYTICS_ATTR   its one data-attribute, as name=value (optional)
 *
 * Both unset — every local run, every pull request, and the site until the club
 * is signed up — and this module does nothing at all: no script, no requests,
 * nothing in the bundle.
 *
 * The *counting* names one, because it has to. This is a hash-routed app on a
 * static host: every route shares one pathname, so a counter left to its own
 * devices files every visit against `/` and reports that the squad opened Home
 * and read nothing. Only a provider with a manual `count(path)` can be told
 * otherwise, and the call is per-vendor. GoatCounter is the one the club uses
 * and the one this file serves:
 *
 *   SRC=https://gc.zgo.at/count.js
 *   ATTR=data-goatcounter=https://<yours>.goatcounter.com/count
 *
 * Two others were listed here and neither can do the job: Cloudflare Web
 * Analytics exposes no manual counter at all, and Plausible's hash script
 * counts a `hashchange` itself, so it would double every move. README →
 * *Counting usage* has what adding a third would take.
 */

const src = import.meta.env.VITE_ANALYTICS_SRC;
const attr = import.meta.env.VITE_ANALYTICS_ATTR;

// Production only. `npm run check:layout` and `npm run shots` drive the real
// site through the dev server — every route at six widths, twice — and without
// this a single pull request would file a hundred visits from a robot.
//
// `!!src`, not `Boolean(src)`: this is the line the "nothing in the bundle"
// promise rests on. Vite replaces an unset variable with `undefined`, esbuild
// folds `!!undefined && true` to `false` and drops every guarded body — but it
// will not fold a call to a global it can't prove nobody reassigned, so the
// tidier-looking spelling left the whole module, vendor names and all, in the
// bundle of a site with no counter.
const enabled = !!src && import.meta.env.PROD;

// Every id in the database is a `uuid`, so a raw pathname fills the dashboard
// with a row per player and a row per match, each counting one or two visits,
// and no way to read either. The param name comes from the segment in front of
// the id so a collapsed path still says which route it was.
const ID_PARAM = { players: ':playerId', matchday: ':matchId', matches: ':matchId' };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * What to file for a route: the path to count it under, and the named event it
 * fires, if any.
 *
 * Only opaque ids collapse. A badge key and an opponent slug are readable and
 * there are a couple of dozen of each, so "which badge is the squad chasing"
 * is a question the dashboard can answer — a template path would throw that
 * answer away to fix a problem those routes don't have.
 *
 * The two events are this site's job 1 as a number. A path count says Players
 * got opened; it cannot say whether anybody looked up their own goals, which
 * is the question that decides whether the badges work. Phase 48 splits
 * `player-page` into a reader's own page and somebody else's, once the site
 * knows which name is theirs.
 */
export function describeView(pathname) {
  const parts = pathname.split('/');
  const path = parts
    .map((part, i) => (UUID.test(part) ? (ID_PARAM[parts[i - 1]] ?? ':id') : part))
    .join('/');

  let event = null;
  if (path === '/players/:playerId') event = 'player-page';
  else if (path.startsWith('/records/badges/')) event = 'badge-page';
  return { path, event };
}

let started = false;

// Views taken before the deferred script arrives, which used to be dropped in
// silence — likeliest on exactly the connection this site is designed for, and
// certain for the first view of every visit now that the site files that one
// itself. Held until the script's fate is settled either way, and bounded,
// because a reader on a dead signal can tap a long way and a queue that grows
// with every tap is a leak.
const HELD_MAX = 20;
let holding = true;
let held = [];

function file(path, event) {
  if (holding) {
    if (held.length < HELD_MAX) held.push([path, event]);
    return;
  }
  const counter = window.goatcounter;
  if (counter && typeof counter.count === 'function') counter.count({ path, event });
}

/** Loads the counter, once, after the page has something on it. */
export function startAnalytics() {
  if (!enabled || started) return;
  started = true;

  // `no_onload` is GoatCounter's own switch for a single-page app, and it has
  // to be set before count.js runs, which is where it reads it. Without it the
  // script files a view of its own on load — taken from <link rel="canonical">,
  // which is `/` on every route of this site. That view is not Home's: it
  // arrives identically whether the reader landed on Home or on a player page
  // pasted into the group chat, so it both inflated Home and lost the one
  // arrival worth knowing about. The site files every view; the script files
  // none.
  window.goatcounter = { no_onload: true };

  const script = document.createElement('script');
  script.src = src;
  script.defer = true;
  if (attr) {
    // Split on the first = only: a provider's value can be JSON and have its own.
    const at = attr.indexOf('=');
    if (at > 0) script.setAttribute(attr.slice(0, at), attr.slice(at + 1));
  }
  script.addEventListener('load', () => {
    holding = false;
    const waiting = held;
    held = [];
    for (const [path, event] of waiting) file(path, event);
  });
  // Blocked by an extension, or a network that never answers. Nothing held is
  // going anywhere, so drop it and stop holding — every later view then falls
  // through to a counter that isn't there, which is a no-op rather than a
  // queue quietly refilling to its bound.
  script.addEventListener('error', () => {
    holding = false;
    held = [];
  });
  document.head.appendChild(script);
}

/**
 * One page view — every move inside the app, and the first paint, since with
 * `no_onload` nothing else counts that either.
 *
 * The site is on <HashRouter>, so a section change is a `#/players` change and
 * the pathname the browser reports never moves. The counter is told explicitly
 * rather than trusted to notice.
 */
export function countView(pathname) {
  if (!enabled) return;
  const { path, event } = describeView(pathname);
  file(path, false);
  if (event) file(event, true);
}
