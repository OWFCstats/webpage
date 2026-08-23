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
 * `budget` names a row of the *Page length* table in docs/DESIGN.md, which is
 * the authority for the numbers — the harness reads them out of the doc rather
 * than keeping a second copy. Null means the route has no budget of its own.
 * `charts` marks a route with a Recharts surface on it, which needs its
 * animation to finish before a screenshot means anything.
 */
export const ROUTES = [
  { id: 'home', route: '/', name: 'Home', budget: 'Home' },
  { id: 'matchday', route: '/matchday', name: 'Matchday — latest', budget: 'Matchday' },
  {
    id: 'matchday-clean-sheet',
    route: `/matchday/${match('2026-02-07', 'Wellington IX')}`,
    name: 'Matchday — clean sheet, debut goal, red card, dropout',
    budget: 'Matchday',
  },
  {
    id: 'matchday-walkover',
    route: `/matchday/${match('2025-11-29', 'Old Amplefordians')}`,
    name: 'Matchday — walkover, no team sheet',
    budget: 'Matchday',
  },
  { id: 'season', route: '/season', name: 'Season', budget: 'Season', charts: true },
  { id: 'season-all', route: '/season?season=all', name: 'Season — all seasons', budget: 'Season', charts: true },
  { id: 'players', route: '/players', name: 'Players — leaderboards', budget: 'Players → Leaderboards' },
  { id: 'players-squad', route: '/players/squad', name: 'Players — squad', budget: 'Players → Squad' },
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
  {
    id: 'player-never-played',
    route: `/players/${player('Alex Hannon')}`,
    name: 'Player detail — never played',
    budget: 'Player detail',
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
];

// Both datasets get measured. pre-season is the one nobody has looked at, and
// it is the state a newcomer is most likely to arrive in (ROADMAP → Phase 10).
export const DATASET_NAMES = ['mid-season', 'pre-season'];
