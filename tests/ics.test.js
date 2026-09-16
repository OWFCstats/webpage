// tests/ics.test.js — lib/ics.js is the one part of Phase 57 with a right
// answer: a wrong DTSTART or a wrong day carry is invisible in a screenshot
// and wrong every time a player actually adds the fixture to their phone.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fixtureIcs, fixtureIcsFilename } from '../src/lib/ics.js';

const NOW = new Date('2026-03-20T10:00:00.000Z');

const HOME_GROUND = {
  pitch_name: 'Wellington College, Big Side',
  pitch_address: 'Duke’s Ride, Crowthorne',
  postcode: 'RG45 7PU',
};

const homeFixture = {
  id: 'match-1',
  date: '2026-03-28',
  kickoff_time: '14:00:00',
  opponent: 'Old Cheltonians',
  venue: 'H',
};

test('a timed fixture gets a DTSTART/DTEND two hours apart, home team first', () => {
  const ics = fixtureIcs(homeFixture, HOME_GROUND, NOW);
  assert.match(ics, /DTSTART:20260328T140000\r\n/);
  assert.match(ics, /DTEND:20260328T160000\r\n/);
  assert.match(ics, /SUMMARY:Old Wellingtonians v Old Cheltonians\r\n/);
});

test('a kick-off crossing midnight carries the DTEND onto the next day', () => {
  const late = { ...homeFixture, kickoff_time: '23:15:00' };
  const ics = fixtureIcs(late, HOME_GROUND, NOW);
  assert.match(ics, /DTSTART:20260328T231500\r\n/);
  assert.match(ics, /DTEND:20260329T011500\r\n/);
});

test('an unconfirmed kick-off is an all-day event, not a guessed time', () => {
  const tbc = { ...homeFixture, kickoff_time: null };
  const ics = fixtureIcs(tbc, HOME_GROUND, NOW);
  assert.match(ics, /DTSTART;VALUE=DATE:20260328\r\n/);
  assert.match(ics, /DTEND;VALUE=DATE:20260329\r\n/);
  assert.ok(!ics.includes('DTSTART:2026'));
});

test('an away fixture reads the opponent first, home team second', () => {
  const away = { ...homeFixture, venue: 'A' };
  const ics = fixtureIcs(away, null, NOW);
  assert.match(ics, /SUMMARY:Old Cheltonians v Old Wellingtonians\r\n/);
});

test('the ground becomes one LOCATION line, comma-joined', () => {
  const ics = fixtureIcs(homeFixture, HOME_GROUND, NOW);
  // Unfolded: RFC 5545 wraps a line past 75 octets onto a continuation line
  // starting with a space, and this LOCATION is long enough to fold.
  const unfolded = ics.replace(/\r\n /g, '');
  assert.match(
    unfolded,
    /LOCATION:Wellington College\\, Big Side\\, Duke’s Ride\\, Crowthorne\\, RG45 7PU\r\n/,
  );
});

test('no team resolved for the ground means no LOCATION line at all', () => {
  const ics = fixtureIcs(homeFixture, null, NOW);
  assert.ok(!ics.includes('LOCATION'));
});

test('DTSTAMP is generated in UTC, not read from the fixture', () => {
  const ics = fixtureIcs(homeFixture, HOME_GROUND, NOW);
  assert.match(ics, /DTSTAMP:20260320T100000Z\r\n/);
});

test('the filename slugs the opponent and keeps the date', () => {
  assert.equal(fixtureIcsFilename(homeFixture), 'owfc-vs-old-cheltonians-2026-03-28.ics');
});

test("an opponent name with punctuation slugs down to letters and numbers", () => {
  const match = { ...homeFixture, opponent: "Old King's Scholars" };
  assert.equal(fixtureIcsFilename(match), 'owfc-vs-old-king-s-scholars-2026-03-28.ics');
});
