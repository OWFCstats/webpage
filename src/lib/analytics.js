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
 * Which counter is a signup decision, not a code one, so it is two build-time
 * variables rather than a vendor:
 *
 *   VITE_ANALYTICS_SRC    the script URL the provider gives you
 *   VITE_ANALYTICS_ATTR   its one data-attribute, as name=value (optional)
 *
 * Both unset — every local run, every pull request, and the site as it stands
 * until someone signs up — and this module does nothing at all.
 *
 *   Cloudflare  SRC=https://static.cloudflareinsights.com/beacon.min.js
 *               ATTR=data-cf-beacon={"token":"..."}
 *   Plausible   SRC=https://plausible.io/js/script.hash.js
 *               ATTR=data-domain=your-domain
 *   GoatCounter SRC=https://gc.zgo.at/count.js
 *               ATTR=data-goatcounter=https://you.goatcounter.com/count
 *   Umami       SRC=https://cloud.umami.is/script.js
 *               ATTR=data-website-id=...
 */

const src = import.meta.env.VITE_ANALYTICS_SRC;
const attr = import.meta.env.VITE_ANALYTICS_ATTR;

// Production only. `npm run check:layout` and `npm run shots` drive the real
// site through the dev server — every route at six widths, twice — and without
// this a single pull request would file a hundred visits from a robot.
const enabled = Boolean(src) && import.meta.env.PROD;

let started = false;

/** Loads the counter, once, after the page has something on it. */
export function startAnalytics() {
  if (!enabled || started) return;
  started = true;
  const script = document.createElement('script');
  script.src = src;
  script.defer = true;
  if (attr) {
    // Split on the first = only: Cloudflare's value is JSON and has its own.
    const at = attr.indexOf('=');
    if (at > 0) script.setAttribute(attr.slice(0, at), attr.slice(at + 1));
  }
  document.head.appendChild(script);
}

/**
 * One page view, for a move inside the app.
 *
 * The site is on <HashRouter>, so a section change is a `#/players` change.
 * Most counters watch history.pushState — which React Router does call, hash
 * URL and all — but the ones that expose a manual counter are told explicitly
 * rather than trusted to notice, since a tool that only ever counted the
 * landing page would say the squad opened Home and never read anything.
 *
 * Whichever global is there gets the call and the rest are no-ops; none of
 * them is loaded on a first visit before this fires, which is fine — the
 * script counts that view itself.
 */
export function countView(path) {
  if (!enabled) return;
  const w = window;
  if (typeof w.plausible === 'function') w.plausible('pageview', { u: path });
  else if (w.umami && typeof w.umami.track === 'function') w.umami.track();
  else if (w.goatcounter && typeof w.goatcounter.count === 'function') {
    w.goatcounter.count({ path, event: false });
  }
}
