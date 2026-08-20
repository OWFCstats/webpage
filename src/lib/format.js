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
