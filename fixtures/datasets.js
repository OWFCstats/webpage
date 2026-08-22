// The named fixture datasets, and every deliberate addition to the real season.
//
// `2025-26.json` is the club's actual data (see build.mjs). One real season
// doesn't contain every state a page has to render, so the states it is
// missing are added here, one at a time, each with the reason it exists. The
// rule for this file: a page that looks right against these two datasets looks
// right against the database, and anything added here has to be a state the
// club can really produce.
//
// Two datasets, because the site has two shapes and only one of them has ever
// been looked at:
//
//   mid-season   a season in progress: results behind, fixtures ahead.
//   pre-season   the season finished and next season's fixtures entered, with
//                nothing played in it. Today this blanks four of five sections
//                on Home (see ROADMAP → Phase 10); it has to be renderable
//                before it can be judged.

import season2526 from './2025-26.json' with { type: 'json' };
import { fixtureId } from './uuid.js';

const CLUB = 'Old Wellingtonians';

/** Mirrors slugify() in src/lib/matches.js — teams.slug has to match it. */
function slug(name) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function team(name, extra = {}) {
  return {
    id: fixtureId(`team:${name}`),
    name,
    short_name: null,
    slug: slug(name),
    is_club: false,
    pitch_name: null,
    pitch_address: null,
    postcode: null,
    map_url: null,
    notes: null,
    created_at: '2026-06-01T09:00:00.000Z',
    ...extra,
  };
}

function match(row) {
  return {
    id: fixtureId(`match:${row.date}:${row.opponent}`),
    season: '2025/26',
    kickoff_time: null,
    opponent_team_id: fixtureId(`team:${row.opponent}`),
    venue: null,
    goals_for: null,
    goals_against: null,
    own_goals_for: 0,
    own_goals_against: 0,
    result: null,
    report: null,
    walkover: false,
    created_at: '2026-06-01T09:00:00.000Z',
    ...row,
  };
}

function appearance(matchKey, name, row = {}) {
  return {
    id: fixtureId(`appearance:${matchKey}:${name}`),
    match_id: fixtureId(`match:${matchKey}`),
    player_id: fixtureId(`player:${name}`),
    started: true,
    goals: 0,
    assists: 0,
    yellows: 0,
    reds: 0,
    motm: false,
    dropout: false,
    ...row,
  };
}

// ---------------------------------------------------------------------------
// Teams — the import has none, and without them no opponent page resolves.
// ---------------------------------------------------------------------------

// Pitch details on some clubs and not others on purpose: venueTeam() returns
// null for a club that has none, and the fixture card and the opponent page
// both have to read without an address.
const TEAMS = [
  team(CLUB, {
    is_club: true,
    short_name: 'OWFC',
    pitch_name: 'Wellington College, Big Side',
    pitch_address: 'Duke’s Ride, Crowthorne',
    postcode: 'RG45 7PU',
    map_url: 'https://maps.example.com/wellington-college',
  }),
  team('Old Stoics', {
    short_name: 'Stoics',
    pitch_name: 'Stowe School',
    pitch_address: 'Stowe, Buckingham',
    postcode: 'MK18 5EH',
  }),
  team('Old Cheltonians', { short_name: 'Cheltonians', pitch_name: 'Cheltenham College' }),
  team('Old Oundelians', { short_name: 'Oundelians' }),
  team('Old Salopians', { short_name: 'Salopians' }),
  team('Old Worthians', { short_name: 'Worthians' }),
  team('Old Malvernians', { short_name: 'Malvernians' }),
  team("Old King's Scholars", { short_name: 'OKS' }),
  team('Wellington IX', { short_name: 'Wellington IX' }),
  team('Old Amplefordians', { short_name: 'Amplefordians' }),
];

// ---------------------------------------------------------------------------
// The real season, enriched with the columns the spreadsheet never had
// ---------------------------------------------------------------------------

// Venue alternates per opponent — first meeting home, second away — because
// H/A is a real column now and a season of nulls tests only the null path.
// One match keeps venue null on purpose: that is what every row imported
// before the venue migration looks like, and venueLabel()/venueTeam() both
// have a branch for it.
function withVenues(matches) {
  const seen = new Map();
  return matches.map((m, i) => {
    const n = (seen.get(m.opponent) ?? 0) + 1;
    seen.set(m.opponent, n);
    return {
      ...m,
      opponent_team_id: fixtureId(`team:${m.opponent}`),
      venue: i === 2 ? null : n % 2 === 1 ? 'H' : 'A',
      kickoff_time: i === 2 ? null : '14:00:00',
    };
  });
}

// Reports on two of sixteen results, which is roughly the club's own hit rate.
// Matchday needs both branches: a match with a report and a match without.
const REPORTS = {
  '2026-03-07:Old Stoics':
    'Four unanswered in the second half after a scrappy opening. Tom Simeon took '
    + 'the game away from them with two goals and two assists inside twenty '
    + 'minutes, and the back four barely had a decision to make after that.',
  '2026-02-07:Wellington IX':
    'A clean sheet at last, and a debut worth the wait: Gus Hill scored on his '
    + 'first appearance and went off with the ball. Bertie Morgan dropped out on '
    + 'the Friday night, which is the only blot on an otherwise straight evening.',
};

const withReports = (matches) =>
  matches.map((m) => ({ ...m, report: REPORTS[`${m.date}:${m.opponent}`] ?? m.report }));

const realMatches = withVenues(season2526.matches);

// ---------------------------------------------------------------------------
// The states one real season doesn't contain
// ---------------------------------------------------------------------------

// A walkover. Awarded 3-0 with no team sheet, so it is the one played match
// with no appearance rows at all — every squad-shaped render has to survive it.
// Kept out of the league (a Cup tie against a club we play nowhere else) so it
// can't quietly contradict the hand-entered standings.
const WALKOVER = match({
  date: '2025-11-29',
  opponent: 'Old Amplefordians',
  competition: 'Cup',
  venue: 'A',
  kickoff_time: '14:00:00',
  goals_for: 3,
  goals_against: 0,
  result: 'W',
  walkover: true,
});

// A clean sheet — the real season has none in fourteen games, so the clean
// sheet badge, the club record and the honours board all had nothing to render.
// It carries three more missing states with it, because they are all things
// that happen in one match rather than states of a season:
//   * a debutant who scores  (Gus Hill, no prior appearance, scores and takes MOTM)
//   * a red card             (Jack Perry — the real season has three yellows and no reds)
//   * a late dropout         (Bertie Morgan, who has no other appearance row:
//                             the case where a name is in the squad and every
//                             appearance-based stat has to leave him out)
const CLEAN_SHEET = match({
  date: '2026-02-07',
  opponent: 'Wellington IX',
  competition: 'Friendly',
  venue: 'H',
  kickoff_time: '19:30:00',
  goals_for: 2,
  goals_against: 0,
  result: 'W',
});

const CLEAN_SHEET_SQUAD = [
  appearance('2026-02-07:Wellington IX', 'Gus Hill', { goals: 1, motm: true }),
  appearance('2026-02-07:Wellington IX', 'Tom Simeon', { goals: 1, assists: 1 }),
  appearance('2026-02-07:Wellington IX', 'Jack Perry', { reds: 1 }),
  appearance('2026-02-07:Wellington IX', 'Richard Byers', { yellows: 1 }),
  appearance('2026-02-07:Wellington IX', 'Hugh Grindon', { assists: 1 }),
  appearance('2026-02-07:Wellington IX', 'Owen Gibbons'),
  appearance('2026-02-07:Wellington IX', 'Max Burke'),
  appearance('2026-02-07:Wellington IX', 'Callum Aungier'),
  appearance('2026-02-07:Wellington IX', 'Dom Bonham-Lloyd', { started: false }),
  appearance('2026-02-07:Wellington IX', 'Olly Feather', { started: false }),
  appearance('2026-02-07:Wellington IX', 'Joe Britz'),
  appearance('2026-02-07:Wellington IX', 'David Pugh'),
  appearance('2026-02-07:Wellington IX', 'Bertie Morgan', { started: false, dropout: true }),
];

// Two upcoming fixtures, which is what makes a dataset mid-season rather than
// an archive: the next-fixture card, the countdown and the fixture list all
// need a match with no score. Two rather than one, because "next" and "the one
// after" render differently.
const UPCOMING = [
  match({
    date: '2026-03-28',
    opponent: 'Old Cheltonians',
    competition: 'League',
    venue: 'H',
    kickoff_time: '14:00:00',
  }),
  match({
    date: '2026-04-11',
    opponent: 'Wellington IX',
    competition: 'Friendly',
    venue: 'A',
    kickoff_time: '11:00:00',
  }),
];

// Next season entered and not started. Four fixtures, no results, no
// appearances — the shape that makes 2026/27 the most recent season with a row
// while 2025/26 is still the most recent season with a result.
const NEXT_SEASON = [
  ['2026-09-05', 'Old Oundelians', 'League', 'H'],
  ['2026-09-12', 'Old Stoics', 'League', 'A'],
  ['2026-09-26', 'Old Salopians', 'League', 'H'],
  ['2026-10-03', 'Old Worthians', 'League', 'A'],
].map(([date, opponent, competition, venue]) =>
  match({ season: '2026/27', date, opponent, competition, venue, kickoff_time: '14:00:00' }),
);

// ---------------------------------------------------------------------------
// League standings — hand-entered in the real thing, so hand-written here,
// except our own row: that one is computed from the dataset's own league
// results, because a fixture that contradicts itself is a fixture that sends
// a phase looking for a bug in the page.
// ---------------------------------------------------------------------------

const DIVISION = 'Arthurian League Division 5';

const RIVALS = [
  // name, position, played, won, drawn, lost, for, against
  ['Old Cheltonians', 1, 12, 10, 1, 1, 44, 15],
  ['Old Worthians', 2, 12, 8, 2, 2, 38, 21],
  ['Old Oundelians', 3, 12, 7, 2, 3, 31, 22],
  ["Old King's Scholars", 4, 12, 5, 3, 4, 26, 25],
  ['Old Stoics', 6, 12, 3, 2, 7, 22, 34],
  ['Old Salopians', 7, 12, 1, 3, 8, 17, 40],
];

function leagueRows(matches, season, ourPosition) {
  const ours = matches.filter(
    (m) => m.season === season && m.competition === 'League' && m.goals_for != null,
  );
  const tally = (test) => ours.filter(test).length;
  const us = {
    played: ours.length,
    won: tally((m) => m.goals_for > m.goals_against),
    drawn: tally((m) => m.goals_for === m.goals_against),
    lost: tally((m) => m.goals_for < m.goals_against),
    goals_for: ours.reduce((n, m) => n + m.goals_for, 0),
    goals_against: ours.reduce((n, m) => n + m.goals_against, 0),
  };
  return [
    {
      id: fixtureId(`league:${season}:${CLUB}`),
      season,
      division: DIVISION,
      team_id: fixtureId(`team:${CLUB}`),
      position: ourPosition,
      ...us,
      updated_at: '2026-03-16T20:12:00.000Z',
    },
    ...RIVALS.map(([name, position, played, won, drawn, lost, gf, ga]) => ({
      id: fixtureId(`league:${season}:${name}`),
      season,
      division: DIVISION,
      team_id: fixtureId(`team:${name}`),
      position,
      played,
      won,
      drawn,
      lost,
      goals_for: gf,
      goals_against: ga,
      updated_at: '2026-03-16T20:12:00.000Z',
    })),
  ];
}

// Player of the Season is the one award nobody can derive, so it needs a row
// or the honours board's first line is empty in every dataset.
const SEASON_AWARDS = [
  {
    id: fixtureId('award:2025/26:player-of-the-season'),
    season: '2025/26',
    award_key: 'player-of-the-season',
    player_id: fixtureId('player:Hugh Grindon'),
    note: 'Voted at the end-of-season dinner, one vote clear of Tom Simeon.',
    updated_at: '2026-04-02T21:40:00.000Z',
  },
];

// ---------------------------------------------------------------------------
// The two datasets
// ---------------------------------------------------------------------------

const played2526 = withReports([...realMatches, WALKOVER, CLEAN_SHEET]);
const appearances2526 = [...season2526.appearances, ...CLEAN_SHEET_SQUAD];

// `now` travels with the dataset because three things on the site read the
// clock — the fixture countdown among them — and a screenshot whose caption
// changes with the day it was taken is not a measurement. The harness pins the
// browser clock to this.
export const DATASETS = {
  'mid-season': {
    label: 'Mid-season — results behind, fixtures ahead',
    now: '2026-03-20T10:00:00.000Z',
    data: {
      players: season2526.players,
      matches: [...played2526, ...UPCOMING],
      appearances: appearances2526,
      teams: TEAMS,
      league_rows: leagueRows(played2526, '2025/26', 5),
      season_awards: SEASON_AWARDS,
    },
  },
  'pre-season': {
    label: 'Pre-season — last season finished, next season entered, nothing played',
    now: '2026-08-15T10:00:00.000Z',
    data: {
      players: season2526.players,
      matches: [...played2526, ...NEXT_SEASON],
      appearances: appearances2526,
      teams: TEAMS,
      league_rows: leagueRows(played2526, '2025/26', 5),
      season_awards: SEASON_AWARDS,
    },
  },
};

export const DEFAULT_DATASET = 'mid-season';
