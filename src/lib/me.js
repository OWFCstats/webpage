// The reader's own name, and the figures Home leads with once it knows it.
//
// This is a *preference*, not authentication: no account, no password, no row
// in the database and nothing sent to the server. The worst case is picking
// the wrong name and seeing the wrong stats, which is fixed by picking again —
// every figure here is public and read-only anyway. DESIGN.md → *What the site
// remembers, and what it doesn't* is the ruling, and the reason it is a cookie
// rather than localStorage is the same rule that put the admin's session in
// one: no localStorage or sessionStorage anywhere.

import { cookieStorage } from './cookieStorage';
import { currentSeasonOf, isPlayed } from './matches';
import { playerTotals } from './players';

/** The cookie. Named here and nowhere else — `scripts/site-map.js` keeps the
 *  harness's copy and `tests/me.test.js` holds the two together. */
export const ME_COOKIE = 'owfc.me';

export function readMe() {
  return cookieStorage.getItem(ME_COOKIE);
}

/** Through the same adapter the session uses, which means the same one-year
 *  Max-Age: a pick that expired over the summer break is one the player would
 *  have to make twice a season. */
export function writeMe(playerId) {
  cookieStorage.setItem(ME_COOKIE, playerId);
}

export function clearMe() {
  cookieStorage.removeItem(ME_COOKIE);
}

/**
 * What Home says to the person holding the phone: this season's figures.
 *
 * The figures are *this season*, because that is what the rest of Home is and
 * a card that quietly used career totals would disagree with the page around
 * it. Career totals and badges live one tap away, on the player's own page —
 * this card is a season snapshot, not the whole shelf.
 *
 * `played` is how many games the club has played in the season, which is the
 * only thing that makes an appearance count mean anything: 7 is a good record
 * out of 9 and a poor one out of 20. Which season it is isn't returned, because
 * Home's own `<h1>` already names it — a second copy on the card would be the
 * page saying the season twice.
 */
export function meSummary(player, matches, appearances) {
  const season = currentSeasonOf(matches);
  const seasonMatches = season ? matches.filter((m) => m.season === season) : [];
  const totals = playerTotals([player], seasonMatches, appearances)[0];
  return {
    played: seasonMatches.filter(isPlayed).length,
    apps: totals.appearances,
    goals: totals.goals,
    assists: totals.assists,
  };
}
