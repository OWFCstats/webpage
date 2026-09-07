// lib/awards.js — club records, season honours and the three badge classes.
//
// The rules worth pinning are the ones a later phase could quietly break: ties
// stay whole, a dropout is not an appearance, a walkover credits nobody, a
// record nobody holds is null rather than zero — and, from Phase 15, that the
// ladder in DESIGN.md is the ladder the code hands out. Phase 17 adds the two
// the squad cards read: fifty shelves in one pass have to agree with the one
// the player page asks for, and a card shows only what somebody holds.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DATASETS } from '../fixtures/datasets.js';
import {
  BADGES,
  CAREER_BADGES,
  EVENT_BADGES,
  METALS,
  SEASON_AWARDS,
  badgeDetail,
  clubBadges,
  clubRecords,
  heldBadges,
  honoursDate,
  honoursSettled,
  nextCareerBadge,
  playerBadges,
  seasonRecords,
  squadBadges,
} from '../src/lib/awards.js';
import { playerTotals } from '../src/lib/players.js';

const mid = DATASETS['mid-season'].data;
const pre = DATASETS['pre-season'].data;
const named = (name) => mid.players.find((p) => p.name === name);

// The mid-season fixture is mid-season: on 20 March 2026 the 2025/26 season is
// still being played, so none of its four honours has been handed out yet
// (Phase 55 — `honoursSettled`). Every assertion about who won what publishes
// the season first, which is what an admin does at the end-of-season dinner and
// is also what exercises the `season_status` override.
//
// `pre-season` needs none of this: by 15 August the date has come round and the
// dataset carries the published row anyway, which is why the two datasets sit
// on either side of this rule rather than a third one being added for it.
const PUBLISHED = { seasonStatus: [{ season: '2025/26', honours_published: true }] };

test('a record nobody holds is null, not zero', () => {
  const empty = clubRecords([]);
  assert.equal(empty.played, 0);
  assert.equal(empty.biggestWin, null);
  assert.equal(empty.longestUnbeaten, null);
  assert.equal(empty.firstCleanSheet, null);
  assert.equal(empty.cleanSheets, 0);
});

test('club records read off the fixture', () => {
  const records = clubRecords(mid.matches);
  assert.equal(records.played, 16);
  assert.equal(records.cleanSheets, 2);
  assert.equal(records.biggestWin.goals_for - records.biggestWin.goals_against, 4);
  assert.equal(records.longestWinning.count, 2);
  assert.equal(records.longestUnbeaten.count, 3);
  // A run carries its own games so the page can list them.
  assert.equal(records.longestUnbeaten.matches.length, 3);
  assert.ok(records.longestUnbeaten.from < records.longestUnbeaten.to);
});

test('the two runs coincide only when they hold the same games', () => {
  // The fixture's unbeaten run is three games and its winning run is two of
  // them, so the records list prints both rows.
  assert.equal(clubRecords(mid.matches).runsCoincide, false);

  // A club that has only ever won holds one run twice over, which is the state
  // the real 2025/26 season was in — and two rows naming the same two matches
  // read as a bug rather than as a young club's record.
  const wins = [
    { id: 'a', date: '2025-09-06', opponent: 'Old Stoics', venue: 'H', goals_for: 2, goals_against: 0, competition: 'League' },
    { id: 'b', date: '2025-09-13', opponent: 'Old Salopians', venue: 'A', goals_for: 3, goals_against: 1, competition: 'League' },
  ];
  const both = clubRecords(wins);
  assert.equal(both.longestUnbeaten.count, 2);
  assert.equal(both.longestWinning.count, 2);
  assert.equal(both.runsCoincide, true);

  // One loss at the end leaves the unbeaten run longer than the winning one.
  const mixed = clubRecords([
    ...wins,
    { id: 'c', date: '2025-09-20', opponent: 'Old Cheltonians', venue: 'H', goals_for: 1, goals_against: 1, competition: 'League' },
  ]);
  assert.equal(mixed.longestUnbeaten.count, 3);
  assert.equal(mixed.longestWinning.count, 2);
  assert.equal(mixed.runsCoincide, false);
});

test('a club with no result has no runs to coincide', () => {
  const empty = clubRecords([]);
  assert.equal(empty.longestWinning, null);
  assert.equal(empty.runsCoincide, false, 'both rows are named, not merged into one');
});

test('an unplayed fixture sets no record', () => {
  // pre-season adds four fixtures and no results, so every mark is unmoved.
  const before = clubRecords(mid.matches);
  const after = clubRecords(pre.matches);
  assert.equal(after.played, before.played);
  assert.equal(after.highestScoring.date, before.highestScoring.date);
});

test('the season honours are the four trophies, and a tie stays whole', () => {
  const [season] = seasonRecords(mid.players, mid.matches, mid.appearances, mid.season_awards, PUBLISHED);
  assert.deepEqual(
    season.awards.map((a) => a.key),
    ['player-of-the-season', 'golden-boot', 'playmaker', 'the-dependable'],
    'Most MOTM is a Class 2 event now, and Assist King is called Playmaker',
  );
  const boot = season.awards.find((a) => a.key === 'golden-boot');
  assert.deepEqual(boot.leaders.map((p) => p.name), ['Tom Simeon']);
  assert.equal(boot.value, 7);
  // Two players level on appearances would both be The Dependable; on this
  // fixture the tie is in the MOTM count, which the star badge carries.
  const dependable = season.awards.find((a) => a.key === 'the-dependable');
  assert.equal(dependable.value, 14);
});

test('the voted award comes from the row, with no mark', () => {
  const [season] = seasonRecords(mid.players, mid.matches, mid.appearances, mid.season_awards, PUBLISHED);
  const pots = season.awards[0];
  assert.equal(pots.key, 'player-of-the-season');
  assert.deepEqual(pots.leaders.map((p) => p.name), ['Hugh Grindon']);
  assert.equal(pots.value, null, 'a vote has no number behind it');
  assert.match(pots.note, /end-of-season dinner/);
});

test('an award with no row and no mark names nobody', () => {
  const [season] = seasonRecords(mid.players, mid.matches, mid.appearances, [], PUBLISHED);
  assert.deepEqual(season.awards[0].leaders, []);
  const nothingPlayed = seasonRecords(pre.players, pre.matches, pre.appearances, pre.season_awards)[0];
  assert.equal(nothingPlayed.season, '2026/27');
  assert.equal(nothingPlayed.summary.played, 0);
  for (const award of nothingPlayed.awards) {
    assert.deepEqual(award.leaders, [], `${award.label} invented a winner from a column of zeroes`);
  }
});

test('a season row lists only the competitions actually played', () => {
  const [season] = seasonRecords(mid.players, mid.matches, mid.appearances, mid.season_awards);
  assert.deepEqual(season.competitions, ['Cup', 'Friendly', 'League']);
  const next = seasonRecords(pre.players, pre.matches, pre.appearances, [])[0];
  assert.deepEqual(next.competitions, [], 'a fixture is not a competition played');
});

test('a dropout is not an appearance and a walkover credits nobody', () => {
  const totals = playerTotals(mid.players, mid.matches, mid.appearances);
  const bertie = totals.find((r) => r.player.name === 'Bertie Morgan');
  assert.equal(bertie.appearances, 0);
  assert.equal(bertie.dropouts, 1);
  // Sixteen played matches, and the club's most-present player has fourteen:
  // the walkover has no team sheet, so nobody can have appeared in it.
  const most = Math.max(...totals.map((r) => r.appearances));
  assert.equal(most, 14);
});

test('the ladder in the docs is the ladder the code hands out', () => {
  // DESIGN.md → Badges and awards, and ROADMAP.md → Phase 15 carry this table.
  // If the two ever disagree the doc is wrong, so it is asserted here.
  assert.deepEqual(
    CAREER_BADGES.map((b) => [b.key, ...b.tiers]),
    [
      ['appearances', 1, 10, 25, 50],
      ['goals', 1, 5, 15, 30],
      ['assists', 1, 4, 12, 25],
      ['clean-sheets', 1, 5, 12, 25],
    ],
  );
  assert.deepEqual(METALS, ['bronze', 'silver', 'gold', 'diamond']);
  assert.deepEqual(EVENT_BADGES.map((b) => b.key), ['motm', 'hat-trick']);
  assert.equal(BADGES.length, 10, 'four career badges, two events, four trophies');
  assert.equal(BADGES.filter((b) => b.class === 'career').length, 4);
  assert.ok(!BADGES.some((b) => b.key === 'brace'), 'there is no brace');
  assert.ok(
    SEASON_AWARDS.every((a) => a.class === 'trophy'),
    'the honours board rows and the trophy badges are the same four objects',
  );
});

test('bronze is one, so everyone who has been picked holds something', () => {
  const board = clubBadges(mid.players, mid.matches, mid.appearances, mid.season_awards);
  const totals = playerTotals(mid.players, mid.matches, mid.appearances);
  const picked = totals.filter((r) => r.appearances > 0).length;
  const appearances = board.career.find((b) => b.key === 'appearances');
  assert.equal(appearances.holders, picked, 'a debut is a badge');
  // A player holds one tier, so the rungs partition the holders rather than
  // each counting everyone who passed through: a name on two rungs of the
  // same badge reads as two players.
  assert.equal(
    appearances.tiers.reduce((total, t) => total + t.holders, 0),
    picked,
    'the rungs add up to the holders — nobody stands on two',
  );
  assert.ok(appearances.tiers[1].holders > 0);
  assert.equal(appearances.top, 'silver', 'the board wears the best metal anyone holds');
  // Clean sheets stays and stays hard: it is the one badge the club may hold
  // none of, and an empty rung keeps its place rather than being trimmed.
  const clean = board.career.find((b) => b.key === 'clean-sheets');
  assert.equal(clean.tiers.length, 4);
  assert.equal(clean.tiers[1].holders, 0);
});

test('a shelf is all four career badges, held or not', () => {
  const shelf = playerBadges(named('Owen Gibbons'), mid.players, mid.matches, mid.appearances, mid.season_awards);
  assert.deepEqual(shelf.career.map((b) => b.key), CAREER_BADGES.map((b) => b.key));
  const apps = shelf.career.find((b) => b.key === 'appearances');
  assert.equal(apps.metal, 'silver');
  assert.match(apps.since, /\d{4}$/, 'an earned badge says when it fell');
  assert.deepEqual(apps.next, { metal: 'gold', threshold: 25, need: 15 });
  // Three goals in one game is a hat-trick, and it stacks rather than tiering.
  assert.equal(shelf.events.find((b) => b.key === 'hat-trick').count, 1);
  assert.equal(shelf.trophies.every((t) => Array.isArray(t.seasons)), true);
});

test('a player who has never played still has four badges to chase', () => {
  const shelf = playerBadges(named('Alex Hannon'), mid.players, mid.matches, mid.appearances, mid.season_awards);
  assert.equal(shelf.career.length, 4);
  assert.ok(shelf.career.every((b) => b.metal === null));
  assert.deepEqual(
    shelf.career.map((b) => b.next.need),
    [1, 1, 1, 1],
    'every ladder starts one away',
  );
  assert.ok(shelf.events.every((b) => b.count === 0));
});

test('the winner of a season trophy holds the badge for that year', () => {
  const shelf = playerBadges(named('Tom Simeon'), mid.players, mid.matches, mid.appearances, mid.season_awards, PUBLISHED);
  const boot = shelf.trophies.find((t) => t.key === 'golden-boot');
  assert.deepEqual(boot.seasons, ['2025/26']);
  const voted = playerBadges(named('Hugh Grindon'), mid.players, mid.matches, mid.appearances, mid.season_awards, PUBLISHED);
  assert.deepEqual(voted.trophies.find((t) => t.key === 'player-of-the-season').seasons, ['2025/26']);
});

test('a badge page lists every tier, its holders and who is closest', () => {
  const page = badgeDetail('appearances', mid.players, mid.matches, mid.appearances, mid.season_awards);
  assert.deepEqual(page.tiers.map((t) => t.metal), METALS);
  assert.ok(page.tiers[0].count > page.tiers[1].count);
  assert.equal(page.tiers[2].count, 0, 'a tier nobody has reached is still named');
  // The bug this closed: a silver holder was listed under bronze as well,
  // because reaching silver means passing 1 appearance too. A player holds
  // the best tier they have reached and only that one.
  const listed = page.tiers.flatMap((t) => t.holders.map((h) => h.player.id));
  assert.equal(new Set(listed).size, listed.length, 'no name on two rungs');
  const silver = badgeDetail('assists', mid.players, mid.matches, mid.appearances, mid.season_awards);
  assert.equal(silver.tiers[1].count, 1);
  assert.ok(
    !silver.tiers[0].holders.some((h) => h.player.id === silver.tiers[1].holders[0].player.id),
    'the club playmaker is on silver, not on both',
  );
  assert.ok(page.chasing.length > 0);
  assert.ok(
    page.chasing.every((row) => row.need > 0 && row.count > 0),
    'a name that has never been picked is not chasing anything yet',
  );
  const needs = page.chasing.map((row) => row.need);
  assert.deepEqual(needs, [...needs].sort((a, b) => a - b), 'closest first');
});

test('an event page counts, a trophy page lists years', () => {
  const event = badgeDetail('hat-trick', mid.players, mid.matches, mid.appearances, mid.season_awards);
  assert.equal(event.awarded, 1);
  assert.deepEqual(event.holders.map((h) => [h.player.name, h.count]), [['Owen Gibbons', 1]]);
  const trophy = badgeDetail('golden-boot', mid.players, mid.matches, mid.appearances, mid.season_awards, PUBLISHED);
  assert.deepEqual(trophy.wins.map((w) => w.season), ['2025/26']);
  assert.deepEqual(trophy.roll.map((r) => [r.player.name, r.seasons.length]), [['Tom Simeon', 1]]);
  assert.equal(badgeDetail('nothing-like-this', mid.players, mid.matches, mid.appearances), null);
});

test('a season with nothing played hands out no badges', () => {
  // pre-season is next season's fixtures on top of the same history, so what
  // has to hold is that the new season wins nothing while the old one keeps
  // everything: entering fixtures must never move a badge.
  const board = clubBadges(pre.players, pre.matches, pre.appearances, pre.season_awards);
  for (const trophy of board.trophies) {
    assert.ok(
      !trophy.wins.some((win) => win.season === '2026/27'),
      `${trophy.label} invented a winner from a column of zeroes`,
    );
  }
  // And the other half of it, end to end through the dataset: pre-season's own
  // `season_status` row has 2025/26 published, so the trophies it won are still
  // standing on the shelf while the new season's are not.
  assert.deepEqual(
    board.trophies.find((t) => t.key === 'golden-boot').wins.map((w) => w.season),
    ['2025/26'],
  );
  const played = clubBadges(mid.players, mid.matches, mid.appearances, mid.season_awards, PUBLISHED);
  assert.deepEqual(
    board.career.map((b) => b.holders),
    played.career.map((b) => b.holders),
  );
});

test('every shelf in one pass is the shelf the player page asks for', () => {
  // The squad cards need one per name and playerBadges walks the whole
  // appearance log per call. Cheaper is only worth having if it agrees.
  const all = squadBadges(mid.players, mid.matches, mid.appearances, mid.season_awards, PUBLISHED);
  assert.equal(all.size, mid.players.length, 'everyone gets a shelf, played or not');
  for (const player of mid.players) {
    assert.deepEqual(
      all.get(player.id),
      playerBadges(player, mid.players, mid.matches, mid.appearances, mid.season_awards, PUBLISHED),
      player.name,
    );
  }
});

test('a card shows what somebody holds, in the board\'s order, with its mark', () => {
  const all = squadBadges(mid.players, mid.matches, mid.appearances, mid.season_awards, PUBLISHED);
  const held = heldBadges(all.get(named('Owen Gibbons').id));
  const order = BADGES.map((b) => b.key);
  assert.deepEqual(
    held.map((b) => b.key),
    held.map((b) => b.key).slice().sort((a, b) => order.indexOf(a) - order.indexOf(b)),
    'the shelf reads in the order the badge board shows them',
  );
  assert.ok(held.every((b) => METALS.includes(b.metal)), 'an unheld badge never reaches a card');
  assert.equal(held.find((b) => b.key === 'appearances').mark, 'silver');
  assert.equal(held.find((b) => b.key === 'hat-trick').mark, '×1');
  // Only Class 1 tiers, so the other two arrive gold whoever holds them.
  assert.equal(held.find((b) => b.key === 'hat-trick').metal, 'gold');
});

test('a player who was picked and never played has an empty shelf', () => {
  const all = squadBadges(mid.players, mid.matches, mid.appearances, mid.season_awards, PUBLISHED);
  assert.deepEqual(heldBadges(all.get(named('Alex Hannon').id)), []);
  // A trophy won once carries its season as its mark, and only reaches a card
  // once it has a season in it at all.
  const boot = heldBadges(all.get(named('Tom Simeon').id)).find((b) => b.key === 'golden-boot');
  assert.equal(boot.mark, '2025/26');
  assert.equal(boot.count, 1);
});

const family = (key, count, tiers) => ({
  key,
  label: key,
  next: count < tiers.at(-1) ? { need: tiers.find((t) => t > count) - count } : null,
});

test('the next badge is the nearest rung, not the first family in the list', () => {
  // Appearances is four away, goals one. The board lists appearances first.
  const badges = {
    career: [family('appearances', 21, [1, 10, 25, 50]), family('goals', 4, [1, 5, 15, 30])],
  };
  assert.equal(nextCareerBadge(badges).key, 'goals');
});

test('a tie goes to board order — the one they are actually about to earn', () => {
  const badges = {
    career: [family('appearances', 9, [1, 10, 25, 50]), family('goals', 4, [1, 5, 15, 30])],
  };
  assert.equal(nextCareerBadge(badges).key, 'appearances');
});

test('every career badge at diamond has no next rung, and says so with null', () => {
  const badges = { career: [family('appearances', 50, [1, 10, 25, 50])] };
  assert.equal(nextCareerBadge(badges), null);
});

test('a player with no shelf at all — no rows — has no next badge either', () => {
  assert.equal(nextCareerBadge({ career: [] }), null);
});

// ---------------------------------------------------------------------------
// When a season's honours go up — Phase 55
// ---------------------------------------------------------------------------
//
// The bug: one friendly into 2026/27, every player who turned up had one
// appearance, so all eleven led the column and all eleven held The Dependable.
// An end-of-season award needs the season to have ended, and three of the four
// are derived — which means they have a leader from the first whistle unless
// something stops them.

/** A season of `played` results and `fixtures` still in the diary, with one
 *  player scoring in every game so the derived three all have a leader. */
function seasonOf(season, year, { played, fixtures = 0, scorer = 'p1' }) {
  const matches = [];
  const appearances = [];
  for (let i = 0; i < played + fixtures; i++) {
    const id = `${season}:${i}`;
    const scored = i < played;
    matches.push({
      id,
      season,
      date: `${year}-0${1 + (i % 9)}-10`,
      opponent: 'Old Stoics',
      competition: 'League',
      venue: 'H',
      goals_for: scored ? 2 : null,
      goals_against: scored ? 1 : null,
    });
    if (!scored) continue;
    for (const player of ['p1', 'p2']) {
      appearances.push({
        match_id: id,
        player_id: player,
        goals: player === scorer ? 2 : 0,
        assists: player === scorer ? 0 : 1,
        yellows: 0,
        reds: 0,
        motm: false,
        started: true,
        dropout: false,
      });
    }
  }
  return { matches, appearances };
}

const TWO = [
  { id: 'p1', name: 'Ada Lovelace', status: 'active' },
  { id: 'p2', name: 'Grace Hopper', status: 'active' },
];

test('the honours date is 1 July after the season ends', () => {
  assert.equal(honoursDate('2025/26'), '2026-07-01');
  assert.equal(honoursDate('2026/27'), '2027-07-01');
  // A label those four digits aren't a year in is treated as history rather
  // than as a season in play: hiding an old season's honours for ever is the
  // failure that loses a season quietly.
  assert.equal(honoursDate('the first one'), null);
  assert.equal(honoursSettled('the first one', [], { today: '2026-09-07' }), true);
});

test('a season still being played hands out no honours', () => {
  const { matches, appearances } = seasonOf('2026/27', 2026, { played: 1, fixtures: 2 });
  const on = { today: '2026-09-07' };
  assert.equal(honoursSettled('2026/27', matches, on), false);

  const [season] = seasonRecords(TWO, matches, appearances, [], on);
  assert.equal(season.settled, false);
  for (const award of season.awards) {
    assert.deepEqual(award.leaders, [], `${award.label} was handed out after one game`);
    assert.equal(award.value, null);
  }

  // And the surfaces that draw a trophy, which is the half that actually broke:
  // eleven Dependables on eleven squad cards.
  const shelves = squadBadges(TWO, matches, appearances, [], on);
  for (const player of TWO) {
    const held = heldBadges(shelves.get(player.id));
    assert.deepEqual(held.filter((b) => b.class === 'trophy'), [], player.name);
  }
  assert.deepEqual(badgeDetail('the-dependable', TWO, matches, appearances, [], on).wins, []);
});

test('a fixture still in the diary holds the honours past 1 July', () => {
  // A cup final in July is a real thing, and the club's own season end moves by
  // a fortnight either way — so the date alone is not enough.
  const open = seasonOf('2025/26', 2026, { played: 5, fixtures: 1 });
  assert.equal(honoursSettled('2025/26', open.matches, { today: '2026-07-20' }), false);

  const done = seasonOf('2025/26', 2026, { played: 6 });
  assert.equal(honoursSettled('2025/26', done.matches, { today: '2026-07-20' }), true);
  // Before the date, an empty diary settles nothing either: every entered
  // fixture played and next month's not entered yet is the ordinary state of
  // mid-season, and it must not publish a season by accident.
  assert.equal(honoursSettled('2025/26', done.matches, { today: '2026-03-20' }), false);
});

test('an admin overrides the date in both directions', () => {
  const { matches, appearances } = seasonOf('2026/27', 2026, { played: 1, fixtures: 2 });
  const today = '2026-09-07';

  // The night of the dinner: the trophies go up before the calendar says so.
  const up = { today, seasonStatus: [{ season: '2026/27', honours_published: true }] };
  assert.equal(honoursSettled('2026/27', matches, up), true);
  const [published] = seasonRecords(TWO, matches, appearances, [], up);
  assert.equal(published.settled, true);
  assert.deepEqual(
    published.awards.find((a) => a.key === 'golden-boot').leaders.map((p) => p.name),
    ['Ada Lovelace'],
  );

  // And back: a result entered wrong pulls the season off the board again, even
  // though its own date has long gone.
  const back = seasonOf('2025/26', 2026, { played: 6 });
  assert.equal(
    honoursSettled('2025/26', back.matches, {
      today,
      seasonStatus: [{ season: '2025/26', honours_published: false }],
    }),
    false,
  );
});

test('a trophy won twice is a count, not a bigger badge', () => {
  const first = seasonOf('2025/26', 2026, { played: 4 });
  const second = seasonOf('2026/27', 2027, { played: 4 });
  const matches = [...first.matches, ...second.matches];
  const appearances = [...first.appearances, ...second.appearances];
  // Both seasons over: the second one's date has come round and neither has a
  // fixture left in the diary.
  const on = { today: '2027-08-01' };

  const shelf = playerBadges(TWO[0], TWO, matches, appearances, [], on);
  const boot = shelf.trophies.find((b) => b.key === 'golden-boot');
  assert.deepEqual(boot.seasons, ['2026/27', '2025/26'], 'newest first, every season named');

  // The card and the hero draw a count, because a drawing cannot say there are
  // two of it — and the seasons themselves are on the cabinet and the trophy's
  // own page, which is where there is a column for them.
  const held = heldBadges(shelf).find((b) => b.key === 'golden-boot');
  assert.equal(held.count, 2);
  assert.equal(held.mark, '×2');
  assert.equal(held.metal, 'gold', 'a trophy is gold at every count — there is no tier');

  // One win keeps its year, which is the better fact while there is one of them.
  const once = heldBadges(playerBadges(TWO[1], TWO, matches, appearances, [], on))
    .find((b) => b.key === 'playmaker');
  assert.equal(once.count, 2);
  const onlyFirst = seasonRecords(TWO, first.matches, first.appearances, [], on);
  assert.equal(onlyFirst.length, 1);
  const single = heldBadges(playerBadges(TWO[0], TWO, first.matches, first.appearances, [], on))
    .find((b) => b.key === 'golden-boot');
  assert.equal(single.count, 1);
  assert.equal(single.mark, '2025/26');

  // The trophy's own page is the year list, and its roll counts seasons.
  const page = badgeDetail('golden-boot', TWO, matches, appearances, [], on);
  assert.deepEqual(page.wins.map((w) => w.season), ['2026/27', '2025/26']);
  assert.deepEqual(page.roll.map((r) => [r.player.name, r.seasons.length]), [['Ada Lovelace', 2]]);
});
