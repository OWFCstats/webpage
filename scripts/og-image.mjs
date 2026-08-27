// npm run og — the share card and the home-screen icons.
//
// Pasting the site into the squad WhatsApp is how it actually spreads, and a
// link with no og:image is a grey rectangle with a URL in it. This draws the
// masthead — crest, club name, the one gold label — at 1200x630 and writes it
// to public/, along with the icons the web app manifest needs.
//
// Rendered in Chromium against src/styles/tokens.css rather than drawn with
// colours typed into this file, for the same reason lib/tokens.js exists:
// tokens.css stays the only place a colour is written down. The fonts come out
// of node_modules, so the card is set in the site's own faces.
//
// The output is committed — public/ is what the browser fetches whole and
// unversioned, and a social scraper has to find these at a stable address.
// Re-run it when the crest or the palette changes; nothing runs it in CI.

import { mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { executablePath } from './harness.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const url = (...parts) => pathToFileURL(join(root, ...parts)).href;

const CREST = url('public', 'crest.png');
const TOKENS = url('src', 'styles', 'tokens.css');
const CASLON = url('node_modules', '@fontsource', 'libre-caslon-display', 'files', 'libre-caslon-display-latin-400-normal.woff2');
const ARCHIVO = url('node_modules', '@fontsource-variable', 'archivo', 'files', 'archivo-latin-wght-normal.woff2');

const FONTS = `
  @font-face {
    font-family: 'Libre Caslon Display';
    src: url('${CASLON}') format('woff2');
  }
  @font-face {
    font-family: 'Archivo Variable';
    src: url('${ARCHIVO}') format('woff2-variations');
    font-weight: 100 900;
  }
`;

// The masthead, at poster size. Centred rather than left-aligned like the real
// header: a share card gets cropped differently by every app that renders one,
// and what survives every crop is the middle.
const CARD = `<!doctype html>
<link rel="stylesheet" href="${TOKENS}">
<style>
  ${FONTS}
  html, body { margin: 0; }
  body {
    width: 1200px; height: 630px;
    background: var(--board);
    display: grid; place-items: center;
    /* The header's gold rule, at the scale of a 1200px card. */
    border-bottom: 10px solid var(--gold);
    box-sizing: border-box;
  }
  .card { display: grid; justify-items: center; gap: 34px; }
  img { width: 236px; height: 236px; object-fit: contain; }
  .name {
    font-family: 'Libre Caslon Display', Georgia, serif;
    font-weight: 600; font-size: 82px; letter-spacing: -0.015em;
    color: var(--on-board); margin: 0;
  }
  .sub {
    font-family: 'Archivo Variable', system-ui, sans-serif;
    font-weight: 600; font-size: 27px; letter-spacing: 0.28em;
    text-transform: uppercase; color: var(--gold); margin: 0;
  }
</style>
<div class="card">
  <img src="${CREST}" alt="">
  <p class="name">Old Wellingtonians FC</p>
  <p class="sub">Club Statistics</p>
</div>`;

// A maskable icon is masked to whatever shape the phone likes, and only the
// middle 80% is guaranteed to survive it. The crest sits at 62% of the square
// on the club's own green, which clears that on every shape.
const icon = (size) => `<!doctype html>
<link rel="stylesheet" href="${TOKENS}">
<style>
  html, body { margin: 0; }
  body {
    width: ${size}px; height: ${size}px;
    background: var(--board);
    display: grid; place-items: center;
  }
  img { width: ${Math.round(size * 0.62)}px; height: ${Math.round(size * 0.62)}px; object-fit: contain; }
</style>
<img src="${CREST}" alt="">`;

const SHOTS = [
  { file: 'og.png', width: 1200, height: 630, html: CARD },
  { file: 'icon-512.png', width: 512, height: 512, html: icon(512) },
  { file: 'icon-192.png', width: 192, height: 192, html: icon(192) },
  // iOS ignores the manifest's icons and takes this one.
  { file: 'apple-touch-icon.png', width: 180, height: 180, html: icon(180) },
];

const browser = await chromium.launch({ executablePath: executablePath() });
try {
  await mkdir(join(root, 'public'), { recursive: true });
  // Written to disk and opened as a file:// page rather than handed to
  // setContent: an about:blank document can't load a file:// crest or font,
  // and the card renders as bare text on green.
  const scratch = join(tmpdir(), 'owfc-og');
  await mkdir(scratch, { recursive: true });
  for (const { file, width, height, html } of SHOTS) {
    const page = await browser.newPage({ viewport: { width, height } });
    const source = join(scratch, `${file}.html`);
    await writeFile(source, html);
    await page.goto(pathToFileURL(source).href);
    // setContent resolves when the DOM is ready, which is before a woff2 or a
    // 108 KB crest has arrived — screenshot then and the card is set in
    // Georgia with a hole where the badge goes.
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() =>
      [...document.images].every((img) => img.complete && img.naturalWidth > 0));
    const buffer = await page.screenshot({ type: 'png' });
    await writeFile(join(root, 'public', file), buffer);
    await page.close();
    console.log(`public/${file} — ${width}x${height}, ${(buffer.length / 1024).toFixed(1)} KB`);
  }
} finally {
  await browser.close();
  await rm(join(tmpdir(), 'owfc-og'), { recursive: true, force: true });
}
