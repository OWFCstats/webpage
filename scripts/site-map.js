// What the harness looks at: the widths, the routes, and which budget each
// route answers to. Shared by `npm run shots` and `npm run check:layout` so
// the two can't drift into measuring different sites — which is how three
// rounds of "measured, not eyeballed" checks each held themselves to a
// slightly different invariant (see ROADMAP → Phase 9).

import { fixtureId } from '../fixtures/uuid.js';

// 320 is the narrowest phone still in use, 375 is the design target, 700 is
// the breakpoint where the bottom bar hands navigation back to the header,
// and 1400 is a desktop. 360 and 414 are the two widths the league table was
// measured against in Phase 2.
export const WIDTHS = [320, 360, 375, 414, 700, 1400];

// The width every budget and every by-hand check is stated at.
export const DESIGN_WIDTH = 375;

// Ids are computed the same way fixtures/datasets.js computes them, so a route
// here points at a known row rather than at whatever happens to be first.
const match = (date, opponent) => fixtureId(`match:${date}:${opponent}`);
const player = (name) => fixtureId(`player:${name}`);

/**
 * The "me" cookie, so a route can be measured as a player who has picked their
 * own name sees it. The name is `src/lib/me.js`'s — kept here rather than
 * imported because that module reaches into `src/` through extensionless
 * imports the harness has no loader for, and `tests/me.test.js` asserts the two
 * still say the same thing.
 */
export const ME_COOKIE = 'owfc.me';

/**
 * `budget` names a row of the *Page length* table in docs/DESIGN.md, which is
 * the authority for the numbers — the harness reads them out of the doc rather
 * than keeping a second copy. Null means the route has no budget of its own.
 * `charts` marks a route with a Recharts surface on it, which needs its
 * animation to finish before a screenshot means anything, and `me` boots the
 * page as a reader who has picked that player as their own name.
 */
export const ROUTES = [
  { id: 'home', route: '/', name: 'Home', budget: 'Home' },
  // Home as the squad sees it. `me` sets the cookie a reader's own pick lives
  // in, which is the only difference between these two routes and the whole of
  // Phase 48 on this page: the question becomes their season. Two of them,
  // because the figures and the empty state are different shapes and a player
  // who has not played this season is the commoner of the two in September.
  {
    id: 'home-me',
    route: '/',
    name: 'Home — a player who has picked their name',
    budget: 'Home',
    me: player('Owen Gibbons'),
  },
  {
    id: 'home-me-unplayed',
    route: '/',
    name: 'Home — picked, no appearances this season',
    budget: 'Home',
    me: player('Alex Hannon'),
  },
  { id: 'matchday', route: '/matchday', name: 'Matchday — latest', budget: 'Matchday' },
  {
    id: 'matchday-clean-sheet',
    route: `/matchday/${match('2026-02-07', 'Wellington IX')}`,
    name: 'Matchday — clean sheet, debut goal, red card, dropout',
    budget: 'Matchday',
  },
  // Same match, report expanded — the clamp's whole point is that the
  // clamped height is the one that matters for the budget, but the open one
  // still has to be measured rather than assumed safe (DESIGN.md → Structure).
  {
    id: 'matchday-clean-sheet-open',
    route: `/matchday/${match('2026-02-07', 'Wellington IX')}`,
    name: 'Matchday — clean sheet, report open',
    budget: 'Matchday',
    open: true,
  },
  {
    id: 'matchday-walkover',
    route: `/matchday/${match('2025-11-29', 'Old Amplefordians')}`,
    name: 'Matchday — walkover, no team sheet',
    budget: 'Matchday',
  },
  { id: 'season', route: '/season', name: 'Season', budget: 'Season → any sub-page' },
  {
    id: 'season-charts',
    route: '/season/charts',
    name: 'Season — charts',
    budget: 'Season → any sub-page',
    charts: true,
  },
  { id: 'players', route: '/players', name: 'Players — leaderboards', budget: 'Players → Leaderboards' },
  // The default is the tiles, which is why the bare address measures those and
  // the list carries the param. Both are measured precisely because both are
  // addresses: the tiles carry badge drawings the list has no column for, and an
  // unmeasured view is where a clipped name hides.
  {
    id: 'players-squad',
    route: '/players/squad',
    name: 'Players — squad, cards',
    budget: 'Players → Squad',
  },
  {
    id: 'players-squad-list',
    route: '/players/squad?layout=list',
    name: 'Players — squad, team sheet',
    budget: 'Players → Squad',
  },
  // The all-time default is the one every other squad route measures; this
  // one exercises the season filter instead, so the "top 20 of the whole
  // club" cap and the single-season case don't quietly diverge unmeasured.
  {
    id: 'players-squad-season',
    route: `/players/squad?season=${encodeURIComponent('2025/26')}`,
    name: 'Players — squad, filtered to one season',
    budget: 'Players → Squad',
  },
  // One wide table now, not five groups behind a switcher, so one route
  // covers it — the name column is still the one at risk of hiding a letter,
  // and it's exercised at every width like every other route here.
  {
    id: 'players-data',
    route: '/players/data',
    name: 'Players — data centre',
    budget: 'Players → Data centre',
  },
  {
    id: 'players-data-season',
    route: `/players/data?season=${encodeURIComponent('2025/26')}`,
    name: 'Players — data centre, filtered to one season',
    budget: 'Players → Data centre',
  },
  {
    id: 'player-regular',
    route: `/players/${player('Owen Gibbons')}`,
    name: 'Player detail — a regular',
    budget: 'Player detail',
    charts: true,
  },
  {
    id: 'player-debutant',
    route: `/players/${player('Gus Hill')}`,
    name: 'Player detail — one appearance, scored on debut',
    budget: 'Player detail',
    charts: true,
  },
  // Carries the cookie as well, so the "This is me" toggle is measured in both
  // states across the three player routes: pressed here, unpressed on the two
  // above. A reader who has picked a name and never played is also the state
  // the hero has least content to hold up.
  {
    id: 'player-never-played',
    route: `/players/${player('Alex Hannon')}`,
    name: 'Player detail — never played, and the reader',
    budget: 'Player detail',
    me: player('Alex Hannon'),
  },
  { id: 'opponent', route: '/opponents/old-stoics', name: 'Opponent detail', budget: 'Opponent detail' },
  // One route per Records sub-page: the 2,000px budget is per sub-page, so a
  // single /records measurement would say nothing about the two behind it.
  { id: 'records', route: '/records', name: 'Records — badges', budget: 'Records → any sub-page' },
  {
    id: 'records-honours',
    route: '/records/honours',
    name: 'Records — honours',
    budget: 'Records → any sub-page',
  },
  {
    id: 'records-all-time',
    route: '/records/all-time',
    name: 'Records — all-time',
    budget: 'Records → any sub-page',
  },
  // One route per badge class: the three render different pages, and the
  // drawings on them are what the icon invariant is measuring from Phase 15 on.
  {
    id: 'badge-career',
    route: '/records/badges/appearances',
    name: 'Badge — career, four metals',
    budget: 'Records → any sub-page',
  },
  {
    id: 'badge-event',
    route: '/records/badges/motm',
    name: 'Badge — a stackable event',
    budget: 'Records → any sub-page',
  },
  {
    id: 'badge-trophy',
    route: '/records/badges/player-of-the-season',
    name: 'Badge — a season trophy',
    budget: 'Records → any sub-page',
  },

  // The write side. `admin: true` boots the page signed in via the fixture
  // stub's own ?admin=1 (fixtures/README.md) — without it these all redirect
  // to the login and measure nothing.
  //
  // It was outside this list until the admin review, and that is exactly how
  // three of its pages came to hide columns on a phone while every public page
  // was measured at six widths on every pull request: the match list hid 484px
  // of its 738px at 375px, which put Edit, Lineup and Report off screen and
  // left the lineup editor unreachable from the only page that links to it.
  // A section the club uses on a phone every Saturday is not an exception to
  // the rule it is the best example of. No budget: these are working screens
  // whose length is the squad's, not a reader's — a fifteen-slot lineup is as
  // long as it is.
  { id: 'admin-home', route: '/admin', name: 'Admin — overview', admin: true },
  { id: 'admin-new-result', route: '/admin/new-result', name: 'Admin — add result', admin: true },
  { id: 'admin-players', route: '/admin/players', name: 'Admin — players', admin: true },
  { id: 'admin-teams', route: '/admin/teams', name: 'Admin — teams', admin: true },
  { id: 'admin-matches', route: '/admin/matches', name: 'Admin — matches', admin: true },
  { id: 'admin-match-new', route: '/admin/matches/new', name: 'Admin — create match', admin: true },
  {
    id: 'admin-match-edit',
    route: `/admin/matches/${match('2026-02-07', 'Wellington IX')}`,
    name: 'Admin — edit match',
    admin: true,
  },
  // The clean-sheet match, because it is the one with a full team sheet, a
  // dropout and a red card — the widest a lineup row ever gets.
  {
    id: 'admin-lineup',
    route: `/admin/matches/${match('2026-02-07', 'Wellington IX')}/lineup`,
    name: 'Admin — lineup & stats',
    admin: true,
  },
  {
    id: 'admin-report',
    route: `/admin/matches/${match('2026-02-07', 'Wellington IX')}/report`,
    name: 'Admin — match report',
    admin: true,
  },
  { id: 'admin-league', route: '/admin/league', name: 'Admin — league table', admin: true },
  { id: 'admin-awards', route: '/admin/awards', name: 'Admin — awards', admin: true },
];

// Both datasets get measured. pre-season is the one nobody has looked at, and
// it is the state a newcomer is most likely to arrive in (ROADMAP → Phase 10).
export const DATASET_NAMES = ['mid-season', 'pre-season'];
