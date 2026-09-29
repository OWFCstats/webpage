// Availability — who answered the group chat's poll for a match.
//
// Admin-only, read included, which makes it the one table `DataContext` never
// loads: the public client would get no rows back, and a page that did load it
// would be carrying who ignores the club's polls to every visitor. The admin
// pages read it for themselves through `useAvailability`, with the login.
//
// A row is an answer, yes or no. No row is "no reply", and both answers count as
// a reply: the point of the tally is to find the members who never answer, not
// the ones who can't make it.

/**
 * Who is asked the poll: everyone ticked as in the main chat, whatever their
 * status — an inactive club legend is still in the chat. Anyone else with an
 * answer on record is kept too, so unticking a player never hides what was
 * already typed in for them.
 */
export function pollList(players, answers = new Map()) {
  return players
    .filter((p) => p.in_chat || answers.has(p.id))
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** One match's answers, as playerId → true (yes) / false (no). */
export function answersFor(rows, matchId) {
  const out = new Map();
  for (const r of rows) if (r.match_id === matchId) out.set(r.player_id, r.available);
  return out;
}

/** Everyone who said yes, for filling a lineup from. */
export function availableIds(rows, matchId) {
  return new Set(
    rows.filter((r) => r.match_id === matchId && r.available).map((r) => r.player_id),
  );
}

/**
 * Yes, no and no-reply counts for every match that has an answer. No reply is
 * counted over the chat, the same list the match's own page shows.
 */
export function pollCounts(rows, players) {
  const chat = new Set(players.filter((p) => p.in_chat).map((p) => p.id));
  const out = new Map();
  for (const r of rows) {
    const c = out.get(r.match_id) ?? { yes: 0, no: 0, noReply: chat.size };
    if (r.available) c.yes += 1;
    else c.no += 1;
    if (chat.has(r.player_id)) c.noReply -= 1;
    out.set(r.match_id, c);
  }
  return out;
}

/**
 * A season's reply tally, worst first.
 *
 * Only a match with at least one answer counts as a poll. A game the admin
 * never typed a poll in for would otherwise count against everyone, and the
 * members who most needed chasing would be lost in a column of zeros.
 */
export function pollTally(players, matches, rows, season) {
  const byId = new Map(matches.filter((m) => m.season === season).map((m) => [m.id, m]));
  const seasonRows = rows.filter((r) => byId.has(r.match_id));
  const polled = new Set(seasonRows.map((r) => r.match_id));
  const polls = [...polled].map((id) => byId.get(id)).sort((a, b) => (a.date < b.date ? -1 : 1));

  const tally = players
    .filter((p) => p.in_chat)
    .map((p) => {
      const mine = seasonRows.filter((r) => r.player_id === p.id);
      const lastReply = mine.reduce((latest, r) => {
        const d = byId.get(r.match_id).date;
        return latest && latest > d ? latest : d;
      }, null);
      return {
        player: p,
        replied: mine.length,
        yes: mine.filter((r) => r.available).length,
        no: mine.filter((r) => !r.available).length,
        lastReply,
      };
    })
    .sort((a, b) => a.replied - b.replied || a.player.name.localeCompare(b.player.name));

  return { polls, tally };
}

/**
 * What a failed availability read says. The table arrives by migration, and
 * until it has been run every admin page that reads it would show PostgREST's
 * own "could not find the table" — true, but it doesn't say what to do.
 */
export function describeAvailabilityError(message = '') {
  if (/availability|in_chat/.test(message) && /(does not exist|could not find|schema cache)/i.test(message)) {
    return 'The availability table isn’t in the database yet. Run '
      + 'supabase/migration_2026_09_availability.sql in the Supabase SQL Editor.';
  }
  return message;
}
