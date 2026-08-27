// The dev-only stand-in for src/lib/supabase.js.
//
// Wired by a `resolve.alias` in vite.config.js, not by a flag inside src/.
// That is the whole trick: `lib/supabase.js` exports null when it has no
// credentials and DataContext turns that null into an error message, so a
// fixture flag read at runtime would mean editing both of them and leaving a
// dev-only branch in the shipped app forever. An alias swaps the module and
// src/ never learns this file exists.
//
// It answers the API surface the app actually uses and nothing else — see
// query() below. Writes land in memory so the admin flows can be walked
// through, and they are gone on reload: this is a fixture, not a database.
//
// Never bundled into a production build. `npm run build` doesn't set the
// alias, and if it ever did, `supabaseConfigured` would be true with no
// backend behind it — which is why the alias lives in one `if` in one file.

import { DATASETS, DEFAULT_DATASET } from './datasets.js';

const params = new URLSearchParams(globalThis.location?.search ?? '');
const requested = params.get('fixture') || import.meta.env.VITE_FIXTURE || DEFAULT_DATASET;
const dataset = DATASETS[requested] ?? DATASETS[DEFAULT_DATASET];

if (!DATASETS[requested]) {
  console.warn(
    `[fixture] no dataset "${requested}" — using "${DEFAULT_DATASET}". `
    + `Available: ${Object.keys(DATASETS).join(', ')}`,
  );
}

// One deep copy at boot, so a write in the admin section can't reach back into
// the dataset module and change what the next page load starts from.
const tables = structuredClone(dataset.data);

console.info(`[fixture] ${requested} — ${dataset.label}`);

// Ids for rows created in the session. Supabase generates these server-side;
// nothing in the app reads their shape beyond using them in a URL.
let created = 0;
const newId = () => `fixture-${(created += 1).toString().padStart(4, '0')}`;

function rowsOf(table) {
  if (!tables[table]) tables[table] = [];
  return tables[table];
}

const matchesFilters = (row, filters) =>
  filters.every(({ kind, column, value }) =>
    kind === 'in' ? value.includes(row[column]) : row[column] === value,
  );

/**
 * A thenable query builder — the same shape the app chains onto: select /
 * insert / update / upsert / delete, then eq / in / order / single. Nothing
 * runs until it's awaited, which is also how supabase-js behaves.
 */
function query(table) {
  const state = { op: 'select', payload: null, filters: [], orders: [], single: false, onConflict: null };
  const ok = (data) => ({ data, error: null, status: 200 });

  function run() {
    const rows = rowsOf(table);
    if (state.op === 'insert' || state.op === 'upsert') {
      const incoming = (Array.isArray(state.payload) ? state.payload : [state.payload]).map((r) => ({
        id: r.id ?? newId(),
        ...r,
      }));
      const keys = state.onConflict?.split(',').map((k) => k.trim()) ?? [];
      const written = incoming.map((row) => {
        const existing = keys.length
          ? rows.find((r) => keys.every((k) => r[k] === row[k]))
          : rows.find((r) => r.id === row.id);
        if (existing && state.op === 'upsert') {
          Object.assign(existing, row, { id: existing.id });
          return existing;
        }
        rows.push(row);
        return row;
      });
      return ok(state.single ? written[0] ?? null : written);
    }
    if (state.op === 'delete') {
      tables[table] = rows.filter((r) => !matchesFilters(r, state.filters));
      return ok(state.single ? null : []);
    }
    if (state.op === 'update') {
      const hit = rows.filter((r) => matchesFilters(r, state.filters));
      for (const row of hit) Object.assign(row, state.payload);
      return ok(state.single ? hit[0] ?? null : hit);
    }
    let out = rows.filter((r) => matchesFilters(r, state.filters));
    for (const { column, ascending } of [...state.orders].reverse()) {
      out = out.slice().sort((a, b) => {
        const [x, y] = [a[column], b[column]];
        const cmp = x === y ? 0 : x == null ? -1 : y == null ? 1 : x < y ? -1 : 1;
        return ascending ? cmp : -cmp;
      });
    }
    return ok(state.single ? out[0] ?? null : out);
  }

  const builder = {
    select() { return builder; },
    insert(payload) { state.op = 'insert'; state.payload = payload; return builder; },
    update(payload) { state.op = 'update'; state.payload = payload; return builder; },
    upsert(payload, options) {
      state.op = 'upsert';
      state.payload = payload;
      state.onConflict = options?.onConflict ?? null;
      return builder;
    },
    delete() { state.op = 'delete'; return builder; },
    eq(column, value) { state.filters.push({ kind: 'eq', column, value }); return builder; },
    in(column, value) { state.filters.push({ kind: 'in', column, value }); return builder; },
    order(column, options) {
      state.orders.push({ column, ascending: options?.ascending !== false });
      return builder;
    },
    single() { state.single = true; return builder; },
    maybeSingle() { state.single = true; return builder; },
    then(resolve, reject) { return Promise.resolve().then(run).then(resolve, reject); },
  };
  return builder;
}

// Auth. Signed out by default, because that is what a visitor is and the
// public pages are what the harness measures. `?admin=1` boots signed in so
// the admin section is reachable without typing a password; otherwise any
// email and password will do at /#/admin/login. Sessions live in memory only.
const listeners = new Set();
const FIXTURE_SESSION = {
  access_token: 'fixture',
  user: { id: '00000000-0000-4000-8000-000000000001', email: 'admin@fixture.local' },
};

let session = params.get('admin') === '1' ? FIXTURE_SESSION : null;

function emit(event) {
  for (const fn of listeners) fn(event, session);
}

export const supabaseConfigured = true;

export const supabase = {
  from: query,
  auth: {
    async getSession() { return { data: { session }, error: null }; },
    async signInWithPassword() {
      session = FIXTURE_SESSION;
      emit('SIGNED_IN');
      return { data: { session }, error: null };
    },
    async signOut() {
      session = null;
      emit('SIGNED_OUT');
      return { error: null };
    },
    onAuthStateChange(callback) {
      listeners.add(callback);
      return { data: { subscription: { unsubscribe: () => listeners.delete(callback) } } };
    },
  },
};

// src/lib/supabase.js splits reads off onto their own client so a public page
// never carries a login; the fixture has no auth to carry, so both names point
// at the same in-memory tables.
export const supabaseRead = supabase;

// What the harness reads to pin the browser clock — see fixtures/datasets.js.
export const fixtureNow = dataset.now;
export const fixtureName = requested;
