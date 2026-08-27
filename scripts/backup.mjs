// Pulls every row out of Supabase and commits it to the repo.
//
// The club's history lives in one free-tier Postgres instance with no
// automated backups, which makes a mistyped delete on a Saturday night
// unrecoverable. This is the second copy: six JSON files and one SQL script,
// versioned in git, diffable season by season.
//
// It runs daily from .github/workflows/backup.yml, which means it is also the
// keepalive — Supabase pauses a free project after about a week with no
// requests, and in June nobody opens the site. A fetch a day keeps it awake.
// A third job falls out of the same call: if Supabase is down or paused the
// fetch fails, the script exits non-zero and GitHub emails whoever owns the
// repo. That is the whole of the site's monitoring.
//
//   npm run backup                                 # env vars already set
//   node --env-file=.env.local scripts/backup.mjs  # locally, off .env.local

import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, '..', 'backups');

// The publishable key is enough: every table is `for select using (true)`
// (supabase/schema.sql). A backup that needed the service key would mean a
// key with write access sitting in CI, which is a worse trade than a backup
// that can only read.
const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

// One list, two jobs: the order rows come back in, and the order they can be
// inserted in without tripping a foreign key. Matches point at teams,
// appearances at both matches and players, so teams and players come first.
// Every `order` ends in a unique column so two runs over unchanged data
// produce byte-identical files and the diff means something.
const TABLES = [
  { name: 'teams', order: 'name.asc,id.asc' },
  { name: 'players', order: 'name.asc,id.asc' },
  { name: 'matches', order: 'date.asc,id.asc' },
  { name: 'appearances', order: 'match_id.asc,player_id.asc' },
  { name: 'league_rows', order: 'season.asc,team_id.asc' },
  { name: 'season_awards', order: 'season.asc,award_key.asc' },
];

// PostgREST caps a response at 1,000 rows. Appearances is the table that will
// pass that first — 169 rows after one season — and a backup that silently
// stopped at a thousand would be worse than none.
const PAGE = 1000;

// Nothing changes for weeks in the off-season, and a run that writes nothing
// leaves no commit. GitHub disables a scheduled workflow after 60 days of
// repository inactivity, which would take the keepalive down with it, so an
// unchanged backup still rewrites the manifest once a month.
const HEARTBEAT_DAYS = 30;

async function fetchAll(table, order) {
  const rows = [];
  for (let offset = 0; ; offset += PAGE) {
    const query = `select=*&order=${order}&limit=${PAGE}&offset=${offset}`;
    const res = await fetch(`${url}/rest/v1/${table}?${query}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!res.ok) {
      throw new Error(`${table}: ${res.status} ${res.statusText} — ${await res.text()}`);
    }
    const page = await res.json();
    rows.push(...page);
    if (page.length < PAGE) return rows;
  }
}

/** One value as a SQL literal. Columns here are text, numeric, bool or null. */
function literal(value) {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return `'${String(value).replaceAll("'", "''")}'`;
}

/** An upsert block for one table, or a note saying it was empty. */
function insertBlock(table, rows) {
  if (rows.length === 0) return `-- ${table}: no rows\n`;
  const cols = Object.keys(rows[0]);
  const quoted = cols.map((c) => `"${c}"`).join(', ');
  const values = rows
    .map((row) => `  (${cols.map((c) => literal(row[c])).join(', ')})`)
    .join(',\n');
  // Keyed on the primary key so a restore over a partly-recovered database
  // updates rather than duplicating.
  const updates = cols
    .filter((c) => c !== 'id')
    .map((c) => `  "${c}" = excluded."${c}"`)
    .join(',\n');
  return `insert into public.${table} (${quoted}) values\n${values}\non conflict (id) do update set\n${updates};\n`;
}

function digest(text) {
  return createHash('sha256').update(text).digest('hex').slice(0, 16);
}

function previousManifest() {
  try {
    return JSON.parse(readFileSync(join(out, 'manifest.json'), 'utf8'));
  } catch {
    return null;
  }
}

if (!url || !key) {
  console.error(
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (or run with --env-file=.env.local).',
  );
  process.exit(1);
}

const now = new Date();
const dumped = [];
try {
  for (const { name, order } of TABLES) {
    const rows = await fetchAll(name, order);
    dumped.push({ name, rows, json: `${JSON.stringify(rows, null, 2)}\n` });
    console.log(`${name}: ${rows.length} rows`);
  }
} catch (err) {
  // The failure that matters is a paused project: a free Supabase instance
  // sleeps after about a week idle, and the site is down until someone
  // resumes it in the dashboard. Say so rather than leaving a stack trace.
  console.error(`Backup failed: ${err.message}`);
  console.error('If the project is paused, resume it in the Supabase dashboard.');
  process.exit(1);
}

const tables = Object.fromEntries(
  dumped.map(({ name, rows, json }) => [name, { rows: rows.length, digest: digest(json) }]),
);

const before = previousManifest();
const unchanged =
  before &&
  TABLES.every(
    ({ name }) =>
      before.tables?.[name]?.digest === tables[name].digest &&
      before.tables?.[name]?.rows === tables[name].rows,
  );
const sinceHeartbeat = before?.generated_at
  ? (now - new Date(before.generated_at)) / 86_400_000
  : Infinity;

if (unchanged && sinceHeartbeat < HEARTBEAT_DAYS) {
  console.log(`No change (last written ${Math.floor(sinceHeartbeat)} days ago). Nothing to commit.`);
  process.exit(0);
}

mkdirSync(out, { recursive: true });
for (const { name, json } of dumped) writeFileSync(join(out, `${name}.json`), json);

const restore = [
  '-- Restore the club dataset from the JSON beside this file.',
  '--',
  '-- Generated by scripts/backup.mjs. Paste into the Supabase SQL editor.',
  '-- The blocks are ordered so foreign keys resolve, and each one upserts on',
  '-- the primary key: running this over a live database repairs and adds, it',
  '-- does not remove. A true point-in-time restore means emptying the tables',
  '-- first (delete from season_awards, league_rows, appearances, matches,',
  '-- players, teams — that order) and then running this.',
  `--\n-- Taken ${now.toISOString()}`,
  '',
  ...dumped.map(({ name, rows }) => insertBlock(name, rows)),
].join('\n');
writeFileSync(join(out, 'restore.sql'), restore);

writeFileSync(
  join(out, 'manifest.json'),
  `${JSON.stringify({ generated_at: now.toISOString(), tables }, null, 2)}\n`,
);

const total = dumped.reduce((n, { rows }) => n + rows.length, 0);
console.log(unchanged ? `Heartbeat: rewrote manifest, ${total} rows unchanged.` : `Wrote ${total} rows.`);
