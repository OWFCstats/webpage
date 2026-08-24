// Cookie-backed storage adapter for supabase-js auth.
// The project rule is "no localStorage or sessionStorage anywhere", and
// supabase-js persists sessions to localStorage by default — this adapter is
// handed to createClient so sessions live in cookies instead. Session payloads
// can exceed the ~4KB per-cookie limit, so values are split across numbered
// chunk cookies (key.0, key.1, ...).

const CHUNK_SIZE = 3000;
const MAX_CHUNKS = 10;

function getCookie(name) {
  const target = `${encodeURIComponent(name)}=`;
  for (const part of document.cookie.split('; ')) {
    if (part.startsWith(target)) {
      return decodeURIComponent(part.slice(target.length));
    }
  }
  return null;
}

function setCookie(name, value, maxAgeSeconds) {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie =
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}` +
    `; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${secure}`;
}

function clearCookie(name) {
  setCookie(name, '', 0);
}

// Splits on the encoded byte size, not the raw character count: a JSON
// payload dense with punctuation can encode to several times its own length,
// and a cookie's real cap applies to what's actually written on the wire.
function chunksOf(value, limit) {
  const chunks = [];
  let start = 0;
  while (start < value.length) {
    let end = start;
    let size = 0;
    while (end < value.length) {
      const charSize = encodeURIComponent(value[end]).length;
      if (size + charSize > limit) break;
      size += charSize;
      end++;
    }
    // A single character can't fit — take it anyway rather than loop forever.
    chunks.push(value.slice(start, end > start ? end : start + 1));
    start = Math.max(end, start + 1);
  }
  return chunks;
}

export const cookieStorage = {
  getItem(key) {
    const single = getCookie(key);
    if (single !== null) return single;
    let value = '';
    for (let i = 0; i < MAX_CHUNKS; i++) {
      const chunk = getCookie(`${key}.${i}`);
      if (chunk === null) break;
      value += chunk;
    }
    return value === '' ? null : value;
  },

  setItem(key, value) {
    this.removeItem(key);
    const maxAge = 60 * 60 * 24 * 365;
    if (encodeURIComponent(value).length <= CHUNK_SIZE) {
      setCookie(key, value, maxAge);
      return;
    }
    chunksOf(value, CHUNK_SIZE)
      .slice(0, MAX_CHUNKS)
      .forEach((chunk, i) => setCookie(`${key}.${i}`, chunk, maxAge));
  },

  removeItem(key) {
    clearCookie(key);
    for (let i = 0; i < MAX_CHUNKS; i++) {
      if (getCookie(`${key}.${i}`) === null) break;
      clearCookie(`${key}.${i}`);
    }
  },
};
