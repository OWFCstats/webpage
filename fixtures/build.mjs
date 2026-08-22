// Parses supabase/import_2025_26.sql into fixtures/2025-26.json.
//
// Run with `npm run fixtures:build`. The JSON is committed — this script is
// how it can be checked, not a build step. It exists because a fixture whose
// provenance is "somebody typed it once" is a fixture nobody trusts to still
// match the club's real data, and the whole point of Phase 9 is that every
// later phase judges a page against the real 2025/26 season: 53 players,
// 14 matches, 169 appearances.
//
// Deliberately a faithful parse and nothing more. Columns the spreadsheet
// never had (venue, kick-off, reports, teams) stay null here and are filled in
// by fixtures/datasets.js, where each choice is a decision with a reason next
// to it rather than something smuggled in during a parse.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fixtureId } from './uuid.js';

const here = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(join(here, '..', 'supabase', 'import_2025_26.sql'), 'utf8');

/** The rows of one `values (...)` block, by the comment that heads it. */
function valuesBlock(heading) {
  const start = sql.indexOf(heading);
  if (start === -1) throw new Error(`import SQL has no section "${heading}"`);
  const from = sql.indexOf('from (values', start);
  const to = sql.indexOf('\n) as v(', from);
  if (from === -1 || to === -1) throw new Error(`section "${heading}" has no values block`);
  return sql
    .slice(sql.indexOf('\n', from), to)
    .split('\n')
    .map((line) => line.trim().replace(/,$/, ''))
    .filter((line) => line.startsWith('(') && line.endsWith(')'))
    .map((line) => line.slice(1, -1));
}

/** Splits one row's fields on commas that aren't inside a quoted string. */
function fields(row) {
  const out = [];
  let current = '';
  let quoted = false;
  for (let i = 0; i < row.length; i++) {
    const c = row[i];
    if (c === "'" && row[i + 1] === "'") { current += "''"; i += 1; continue; }
    if (c === "'") { quoted = !quoted; current += c; continue; }
    if (c === ',' && !quoted) { out.push(current.trim()); current = ''; continue; }
    current += c;
  }
  out.push(current.trim());
  return out;
}

/** SQL literal to a JS value: 'text', date 'iso', 12, true/false, null. */
function value(literal) {
  const text = literal.replace(/^date\s+/, '');
  if (text === 'null') return null;
  if (text === 'true') return true;
  if (text === 'false') return false;
  if (text.startsWith("'")) return text.slice(1, -1).replace(/''/g, "'");
  return Number(text);
}

const rows = (heading) => valuesBlock(heading).map((row) => fields(row).map(value));

const players = rows('-- 1) Players').map(([name]) => ({
  id: fixtureId(`player:${name}`),
  name,
  // The import set every player to MID because the spreadsheet had no position
  // data, and the positions migration made the column an optional label. Null
  // is the truthful value and it exercises the "no position" render path.
  position: null,
  status: 'active',
  created_at: '2026-06-01T09:00:00.000Z',
}));

const matches = rows('-- 2) Matches').map(([season, date, opponent, competition, gf, ga, result]) => ({
  id: fixtureId(`match:${date}:${opponent}`),
  season,
  date,
  kickoff_time: null,
  opponent,
  opponent_team_id: null,
  competition,
  venue: null,
  goals_for: gf,
  goals_against: ga,
  own_goals_for: 0,
  own_goals_against: 0,
  result,
  report: null,
  walkover: false,
  created_at: '2026-06-01T09:00:00.000Z',
}));

const appearances = rows('-- 3) Appearances').map(
  ([date, opponent, player, goals, assists, yellows, reds, motm]) => ({
    id: fixtureId(`appearance:${date}:${opponent}:${player}`),
    match_id: fixtureId(`match:${date}:${opponent}`),
    player_id: fixtureId(`player:${player}`),
    // The spreadsheet had no started-vs-sub column, so the import marked
    // everyone as a starter and so does this.
    started: true,
    goals,
    assists,
    yellows,
    reds,
    motm,
    dropout: false,
  }),
);

// The counts the review quoted. If a re-parse moves them, the fixture has
// stopped being the real season and every measurement taken against it is
// suspect — so this fails the build rather than writing the file.
const expected = { players: 53, matches: 14, appearances: 169 };
const got = { players: players.length, matches: matches.length, appearances: appearances.length };
for (const [table, count] of Object.entries(expected)) {
  if (got[table] !== count) {
    throw new Error(`parsed ${got[table]} ${table}, import SQL says ${count}`);
  }
}

const out = join(here, '2025-26.json');
writeFileSync(out, `${JSON.stringify({ players, matches, appearances }, null, 2)}\n`);
console.log(`fixtures/2025-26.json — ${got.players} players, ${got.matches} matches, ${got.appearances} appearances`);
