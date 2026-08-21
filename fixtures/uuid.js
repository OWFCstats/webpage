// Deterministic ids for fixture rows.
//
// A fixture row needs a stable id for the same reason a match does: the id is
// in the URL (`/players/<id>`, `/matchday/<id>`), so a screenshot run is only
// comparable with the last one if rebuilding the fixture doesn't renumber
// everybody. Hashed from a caller-supplied key rather than counted, so adding
// a player to the middle of the list doesn't shift the ids after it.
//
// Shaped like a v4 UUID because that is what Supabase hands the real app, and
// a fixture that swaps in short ids would hide anything that depends on the
// real width. Not cryptographic and doesn't need to be — collisions are
// visible immediately as two rows sharing a page.

function fnv1a(input, seed) {
  let hash = seed >>> 0;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

/** Stable UUID-shaped id for `key`, e.g. fixtureId('player:Owen Gibbons'). */
export function fixtureId(key) {
  const words = [0x811c9dc5, 0x1000193, 0x9e3779b9, 0x85ebca6b].map((seed) =>
    fnv1a(key, fnv1a(key, seed)),
  );
  const hex = words.map((w) => w.toString(16).padStart(8, '0')).join('');
  const bytes = hex.match(/../g);
  bytes[6] = `4${bytes[6][1]}`;                                  // version 4
  bytes[8] = `${'89ab'[parseInt(bytes[8][0], 16) % 4]}${bytes[8][1]}`; // variant
  const s = bytes.join('');
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20, 32)}`;
}
