// Paging, because PostgREST caps a response at 1,000 rows.
//
// `scripts/backup.mjs` has paged since Phase 39; `DataContext` never did, and
// `appearances` is the table that reaches the cap first — 155 rows after one
// season, so around season six. That is the worst kind of failure this site can
// have: nothing throws, nothing looks broken, and every derived figure is
// quietly wrong by an amount that grows with the club's history. The whole point
// of "everything is derived" is that a total can't drift from the rows it
// summarises; a truncated read breaks that guarantee underneath everything
// built on it.
//
// See `CLAUDE.md` → *A read that can grow has to page*.

/** PostgREST's own default cap. Ask for more in one page and it trims silently. */
export const PAGE_SIZE = 1000;

/**
 * Enough pages for a few hundred seasons at this club's rate.
 *
 * It exists so a broken endpoint — one answering a full page forever — fails
 * loudly instead of hanging a phone, and it errors rather than returning the
 * rows it has: a partial read that presents itself as complete is the exact bug
 * this module was written to remove, and reintroducing it as the failure mode
 * would be worse than useless.
 */
const MAX_PAGES = 50;

/**
 * Every row a query matches, fetched a page at a time.
 *
 * `pageAt(from, to)` runs one page and returns PostgREST's own
 * `{ data, error }`, which is also what this returns — so a caller handles a
 * failure exactly as it did before paging existed.
 *
 * **The query's order has to be a total order.** Ordering by a column with ties
 * lets rows move between pages while the read is in flight, which drops some
 * and repeats others — a subtler version of the bug being fixed here, and one
 * that would only show up as figures being slightly wrong. Every read in
 * `DataContext` therefore ends its order on something unique.
 */
export async function fetchAllPages(pageAt, pageSize = PAGE_SIZE) {
  const rows = [];
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const from = page * pageSize;
    const { data, error } = await pageAt(from, from + pageSize - 1);
    if (error) return { data: null, error };
    // An empty page ends the read whether or not the previous one was full,
    // which is the case a table whose size is an exact multiple of pageSize
    // lands on.
    if (data == null || data.length === 0) return { data: rows, error: null };
    rows.push(...data);
    if (data.length < pageSize) return { data: rows, error: null };
  }
  return {
    data: null,
    error: {
      message:
        `Stopped reading after ${MAX_PAGES} pages of ${pageSize} rows. `
        + 'That is more than this club can have played, so it is a bug rather '
        + 'than a big season.',
    },
  };
}
