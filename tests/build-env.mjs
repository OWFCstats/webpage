// src/ reads its build-time variables through `import.meta.env`, which Vite
// replaces with literals; Node's ESM loader leaves `import.meta.env` undefined
// and the read throws before a test can assert anything. Same class of problem
// as extensionless.mjs, and the same shape of fix — one loader hook, rather
// than a test runner with its own bundler.
//
// It maps onto `process.env` because that is where the values come from in the
// first place: `VITE_ANALYTICS_SRC=... npm run build`, in deploy.yml. A test
// sets the variable and then imports the module under test dynamically — the
// reads happen at module scope, so a static import would be hoisted above the
// assignment and see nothing.
export async function load(url, context, next) {
  const loaded = await next(url, context);
  if (loaded.format !== 'module' || !url.includes('/src/')) return loaded;
  const source = loaded.source?.toString();
  if (!source?.includes('import.meta.env')) return loaded;
  return { ...loaded, source: source.replaceAll('import.meta.env', 'process.env') };
}
