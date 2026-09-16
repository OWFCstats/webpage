// lib/ics.js — one .ics file for one fixture. No library: a single VEVENT is
// a dozen lines and one folded property, and a dependency for that would
// cost more than it saves.
//
// Every date is built with plain calendar arithmetic (Date.UTC, read back
// with the UTC getters) rather than the local Date the rest of the site
// uses — not because the kick-off isn't local, but because this module never
// converts between zones at all: it treats "2026-03-28 14:00" as a wall-clock
// value and does day/hour carrying on the numbers themselves, which is
// correct regardless of which timezone the machine generating the file is
// in. Reaching for the system's local Date here would make the file depend
// on where it happens to be built.

import { matchHomeAway } from './matches';

const pad = (n) => String(n).padStart(2, '0');

/** `YYYYMMDD` from a `date` column. */
const ymd = (iso) => iso.replace(/-/g, '');

/** `iso` shifted by `days` (negative goes back), as `YYYYMMDD` — calendar
 *  arithmetic done in UTC purely to get correct month/year carrying, not
 *  because the date means anything in UTC. */
function shiftedYmd(iso, days) {
  const [y, mo, d] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(y, mo - 1, d + days));
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}`;
}

/** `YYYYMMDDTHHMMSS` — floating local time: no `Z`, no `TZID`. A fixture's
 *  kick-off is always UK local, and a floating time is read as the reader's
 *  own device zone by every calendar app that matters here. */
function stamp(iso, time) {
  const [h, m] = time.split(':');
  return `${ymd(iso)}T${pad(Number(h))}${pad(Number(m))}00`;
}

/** `time` plus `hours`, carrying into the next day where it crosses
 *  midnight — for a timed event's DTEND, a two-hour block from kick-off. */
function stampPlusHours(iso, time, hours) {
  const [h, m] = time.split(':').map(Number);
  let endHour = h + hours;
  let dayShift = 0;
  if (endHour >= 24) {
    endHour -= 24;
    dayShift = 1;
  }
  return `${shiftedYmd(iso, dayShift)}T${pad(endHour)}${pad(m)}00`;
}

/** Backslash, comma, semicolon and newline are the four characters RFC 5545
 *  TEXT values have to escape — an opponent's name or a ground's address can
 *  carry any of them. */
function escapeText(value) {
  return value.replace(/[\\,;]/g, (c) => `\\${c}`).replace(/\n/g, '\\n');
}

/** RFC 5545 §3.1: a content line over 75 octets folds onto a continuation
 *  line starting with a single space. Nothing here runs that long today, but
 *  a long opponent name next to a long ground address could, and an
 *  unfolded long line is invalid rather than merely untidy. */
function fold(line) {
  if (line.length <= 75) return line;
  const parts = [];
  let rest = line;
  while (rest.length > 75) {
    parts.push(rest.slice(0, 75));
    rest = ` ${rest.slice(75)}`;
  }
  parts.push(rest);
  return parts.join('\r\n');
}

/** A ground as one LOCATION line: pitch name, address and postcode, in
 *  whatever subset a team record carries. `team` is `venueTeam()`'s return —
 *  null (no team resolves, or the venue wasn't a pitch anyone owns) renders
 *  with no LOCATION line rather than a guess. */
function locationOf(team) {
  if (!team) return '';
  return [team.pitch_name, team.pitch_address, team.postcode].filter(Boolean).join(', ');
}

/**
 * A single-event .ics for one fixture. Timed when the kick-off is confirmed
 * — a two-hour block, a match plus a warm-up either side — or an all-day
 * placeholder when it isn't, since "some time on the 28th" is still worth a
 * calendar entry rather than no entry at all. `ground` is the team the
 * fixture is played at (`venueTeam(match, teams)`); `now` is the generation
 * time for DTSTAMP, a parameter so a test can pin it.
 */
export function fixtureIcs(match, ground, now = new Date()) {
  const { homeTeam, awayTeam } = matchHomeAway(match);
  const location = escapeText(locationOf(ground));
  const dtstamp = `${now.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Old Wellingtonians FC//stats site//EN',
    'BEGIN:VEVENT',
    `UID:${match.id}@oldwellingtoniansfc.com`,
    `DTSTAMP:${dtstamp}`,
  ];

  if (match.kickoff_time) {
    lines.push(`DTSTART:${stamp(match.date, match.kickoff_time)}`);
    lines.push(`DTEND:${stampPlusHours(match.date, match.kickoff_time, 2)}`);
  } else {
    lines.push(`DTSTART;VALUE=DATE:${ymd(match.date)}`);
    lines.push(`DTEND;VALUE=DATE:${shiftedYmd(match.date, 1)}`);
  }

  lines.push(`SUMMARY:${escapeText(`${homeTeam} v ${awayTeam}`)}`);
  if (location) lines.push(`LOCATION:${location}`);
  lines.push('END:VEVENT', 'END:VCALENDAR');

  return `${lines.map(fold).join('\r\n')}\r\n`;
}

/** `owfc-vs-old-cheltonians-2026-03-28.ics` — a filename a phone's downloads
 *  list can tell apart from the fixture before or after it. */
export function fixtureIcsFilename(match) {
  const slug = match.opponent
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `owfc-vs-${slug}-${match.date}.ics`;
}
