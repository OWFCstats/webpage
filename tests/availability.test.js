// lib/availability.js — the group chat's poll, as the admin types it in.
//
// The two things that would quietly mislead: a tally that counts a game nobody
// entered a poll for as a miss for everyone, and a poll list that drops a name
// the moment the player is unticked from the chat, taking their answers with it.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  answersFor,
  availableIds,
  describeAvailabilityError,
  pollCounts,
  pollList,
  pollTally,
} from '../src/lib/availability.js';

const players = [
  { id: 'p-ann', name: 'Ann', status: 'active', in_chat: true },
  { id: 'p-bob', name: 'Bob', status: 'inactive', in_chat: true },
  { id: 'p-cat', name: 'Cat', status: 'active', in_chat: true },
  { id: 'p-ringer', name: 'Dan the ringer', status: 'active', in_chat: false },
];

const matches = [
  { id: 'm1', season: '2026/27', date: '2026-09-05' },
  { id: 'm2', season: '2026/27', date: '2026-09-12' },
  { id: 'm3', season: '2026/27', date: '2026-09-19' },
  { id: 'old', season: '2025/26', date: '2026-03-14' },
];

const row = (match_id, player_id, available) => ({ match_id, player_id, available });

test('the poll list is the chat, whatever their status, and not the ringers', () => {
  assert.deepEqual(pollList(players).map((p) => p.id), ['p-ann', 'p-bob', 'p-cat']);
});

test('a player unticked from the chat keeps their answer on the list', () => {
  const answers = answersFor([row('m1', 'p-ringer', true)], 'm1');
  assert.ok(pollList(players, answers).some((p) => p.id === 'p-ringer'));
});

test('availableIds is the yeses for one match and nothing else', () => {
  const rows = [row('m1', 'p-ann', true), row('m1', 'p-bob', false), row('m2', 'p-cat', true)];
  assert.deepEqual([...availableIds(rows, 'm1')], ['p-ann']);
  assert.equal(availableIds(rows, null).size, 0);
});

test('no reply is counted over the chat, not over everyone who answered', () => {
  const rows = [row('m1', 'p-ann', true), row('m1', 'p-bob', false), row('m1', 'p-ringer', true)];
  assert.deepEqual(pollCounts(rows, players).get('m1'), { yes: 2, no: 1, noReply: 1 });
  assert.equal(pollCounts(rows, players).has('m2'), false);
});

test('the tally counts only games with a poll entered, and an Out is a reply', () => {
  const rows = [
    row('m1', 'p-ann', true),
    row('m1', 'p-bob', false),
    row('m2', 'p-ann', false),
    // Another season's answer never reaches this season's tally.
    row('old', 'p-cat', true),
  ];
  const { polls, tally } = pollTally(players, matches, rows, '2026/27');
  // m3 has no answers, so it isn't a poll anybody missed.
  assert.deepEqual(polls.map((m) => m.id), ['m1', 'm2']);
  assert.deepEqual(
    tally.map((t) => [t.player.id, t.replied, t.yes, t.no, t.lastReply]),
    [
      ['p-cat', 0, 0, 0, null],
      ['p-bob', 1, 0, 1, '2026-09-05'],
      ['p-ann', 2, 1, 1, '2026-09-12'],
    ],
  );
});

test('a missing migration says which file to run', () => {
  const msg = describeAvailabilityError("Could not find the table 'public.availability' in the schema cache");
  assert.match(msg, /migration_2026_09_availability\.sql/);
  assert.equal(describeAvailabilityError('permission denied'), 'permission denied');
});
