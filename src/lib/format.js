// Display formatting: dates, times, rates and pluralisation. No football
// domain logic — anything that needs a match or player row lives elsewhere.

/** Format a per-game rate to 2 decimal places for display. */
export function rate(value) {
  return value.toFixed(2);
}

/** UK-friendly kick-off time, e.g. "14:00:00" -> "2:00pm". Empty string when
 * not recorded. */
export function formatKickoff(time) {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const period = h < 12 ? 'am' : 'pm';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')}${period}`;
}

/** Days until a fixture, or null once it's in the past. */
export function daysUntil(iso) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const then = new Date(`${iso}T00:00:00`);
  const days = Math.round((then - today) / 86400000);
  return days < 0 ? null : days;
}

export function countdownLabel(iso) {
  const days = daysUntil(iso);
  if (days === null) return null;
  if (days === 0) return 'Kick-off today';
  if (days === 1) return 'Kick-off tomorrow';
  if (days < 14) return `Kick-off in ${days} days`;
  return `Kick-off in ${Math.round(days / 7)} weeks`;
}

export function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** "Sat 14 Mar 2026" — for the scoreboard's own meta line, where the day of
 *  the week is worth carrying and a ladder rung's date is not. */
export function weekdayDate(iso) {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}

/** "14 Mar" — for a row inside a season, where the year is the season's and
 *  repeating it sixteen times down a ladder says nothing. */
export function dayMonth(iso) {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/** "12 Aug 2026, 21:04" — for a stored timestamp (not a date-only column),
 *  where the time of day is the point: standings entered after the Saturday
 *  results are a different thing from standings entered on the Monday. */
export function formatDateTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

/** "Feb 2025" — for a badge plate, where a full date doesn’t fit. */
export function monthYear(iso) {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

/** "1 goal" / "3 goals" — the copy reads as a sentence, so it has to agree. */
export function plural(n, one, many) {
  return `${n} ${n === 1 ? one : many}`;
}

/** "OG" — a player's monogram, for the circles that stand in for photos we
 *  don't have. Two initials: a third stops fitting the circle. */
export function initials(name) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

/** "3rd" — for a rank shown beside a figure. Two pages want it (a player's
 *  rank list and their stat grid), so it lives here rather than in either. */
export function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * A match report clamped to its first ~300 characters at a word boundary, so
 * a long write-up doesn't set the length of the page it sits on. Paragraphs
 * (blank-line separated) are kept whole where they fit; the one the cut
 * falls inside is trimmed to the last word boundary and its own tail becomes
 * the first paragraph of `rest`, so reopening it reads as paragraphs rather
 * than one block. `rest` is empty when the whole report already fits within
 * `limit` — the caller's signal to render it whole and show no control.
 */
export function clampReport(text, limit = 300) {
  const paragraphs = text.trim().split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  if (text.length <= limit) return { head: paragraphs, rest: [] };

  const head = [];
  const rest = [];
  let used = 0;
  for (const p of paragraphs) {
    if (rest.length > 0) {
      rest.push(p);
      continue;
    }
    if (used + p.length <= limit) {
      head.push(p);
      used += p.length;
      continue;
    }
    const budget = limit - used;
    const cut = p.lastIndexOf(' ', budget);
    const at = cut > 0 ? cut : budget;
    head.push(`${p.slice(0, at).trimEnd()}…`);
    const tail = p.slice(at).trim();
    if (tail) rest.push(tail);
  }
  return { head, rest };
}
