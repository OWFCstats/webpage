import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// Fixture mode: `npm run dev:fixture` (and the shots / layout harness) serve
// the real pages against fixtures/, with no Supabase credentials anywhere.
//
// It is an alias rather than a flag inside src/ on purpose. lib/supabase.js
// exports null when it is unconfigured and DataContext turns that into an
// error, so a runtime flag would have to be read in both — and would leave a
// dev-only branch in the shipped bundle. Swapping the whole module means src/
// has no idea fixtures exist, and a production build can't accidentally pick
// them up: the alias is only added when FIXTURE is set, which no deploy does.
//
// The regex matches every relative spelling of the import — '../lib/supabase'
// from context/, '../../lib/supabase' from pages/admin/ — because a path alias
// keyed on one of them would silently miss the others and leave half the app
// talking to a client that isn't there.
const fixtureMode = Boolean(process.env.FIXTURE);
const stub = fileURLToPath(new URL('./fixtures/supabase-stub.js', import.meta.url));

// The site's own address, and the only absolute URL in the build. Everything
// else is relative on purpose (see `base` below), but a link preview can't be:
// og:image is fetched by WhatsApp's scraper, not by a browser that already
// knows where it is, and a relative one is simply dropped.
//
// So it comes in at build time. The default is the GitHub Pages address; a
// custom domain means setting the SITE_URL repository variable in
// .github/workflows/deploy.yml and re-running the deploy — one value in one
// place, and no page has to know about it.
const siteUrl = (process.env.SITE_URL || 'https://owfcstats.github.io/webpage').replace(/\/+$/, '');

const siteUrlPlugin = {
  name: 'owfc-site-url',
  transformIndexHtml: {
    // Before Vite's own HTML pass, which decodeURI()s every href it finds and
    // throws "URI malformed" on a bare %SITE_URL% — the placeholder has to be
    // gone by then.
    order: 'pre',
    handler: (html) => html.replaceAll('%SITE_URL%', siteUrl),
  },
};

// base './' keeps every asset reference relative, so the same build works on
// GitHub Pages (served from /<repo>/) and on a custom domain later.
export default defineConfig({
  plugins: [react(), siteUrlPlugin],
  base: './',
  resolve: {
    alias: fixtureMode ? [{ find: /^(?:\.\.\/)+lib\/supabase$/, replacement: stub }] : [],
  },
});
