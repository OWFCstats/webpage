// League standings: the one table that can't be derived from our own results.

import { formOf, resultOf } from './matches.js';

/** Five squares is the column's whole width, and the same rule the check
 *  constraint on `league_rows.form` applies (see the migration). A string that
 *  doesn't match is not half-true data, so it draws nothing rather than a
 *  partial run: the input and the database both refuse one, and a row that has
 *  somehow acquired one shouldn't put a chip on Home that says `X`. */
const FORM = /^[WDL]{1,5}$/;

/** A typed form string as chips, oldest first. Null, empty and malformed all
 *  come back as no chips at all. */
export function parseForm(form) {
  const clean = (form ?? '').trim().toUpperCase();
  return FORM.test(clean) ? [...clean] : [];
}

/**
 * Our own five, oldest first, off our own league results — never the stored
 * column, which is only ever filled in for the other clubs. This is not the
 * band's form card on Home: that one is every competition, so the two differ
 * the week after a cup tie, which is why the table's foot says *League only*.
 */
function ourForm(matches, season, n = 5) {
  // formOf already drops anything without a score, so a fixture in the diary
  // can't take a square.
  const league = matches.filter(
    (m) => m.season === season && m.competition?.trim().toLowerCase() === 'league',
  );
  return formOf(league, n).reverse().map(resultOf);
}

/**
 * The standings for one season: hand-entered `league_rows` (see
 * supabase/migration_2026_08_league.sql) joined to their `teams` row, with
 * points and goal difference derived here rather than stored — the same rule
 * every other stat on this site follows.
 *
 * Order: an explicit `position` wins, because a league applies its own
 * tie-breaks that no W/D/L line can show. Rows without one fall in behind on
 * points, then goal difference, then goals scored, then name — so a table
 * entered without positions still ranks itself.
 *
 * Form is the one figure on the row that is stored for some clubs and derived
 * for others, and deliberately: a W/D/L total carries no order, so no rival's
 * run of five is derivable from anything we hold — it is typed in, like the
 * rest of their row. Ours is not, because ours we played. Each row has one
 * source and never two (Phase 73).
 *
 * Returns the division label and the most recent edit alongside the rows, both
 * of which the widget shows and neither of which is worth a second pass.
 */
export function leagueStandings(leagueRows, teams, season, matches = []) {
  const teamById = new Map(teams.map((t) => [t.id, t]));
  // Derived once for the whole table rather than inside the map: every row
  // asks the same question of the same fixture list, and only one row is us.
  const us = ourForm(matches, season);
  const rows = leagueRows
    .filter((r) => r.season === season)
    .map((r) => {
      const team = teamById.get(r.team_id) ?? null;
      return {
        ...r,
        team,
        // A row whose team vanished shouldn't blank the whole table; the
        // foreign key makes this all but impossible, but the table still
        // renders if it happens.
        name: team?.name ?? 'Unknown club',
        // A walkover loss costs 3 points on top of the loss itself (see
        // matchPoints in lib/matches.js) — walkover_losses is how many of a
        // club's losses this season were walkovers, for any club in the
        // table, not just us.
        points: r.won * 3 + r.drawn - (r.walkover_losses ?? 0) * 3,
        goalDifference: r.goals_for - r.goals_against,
        isUs: team?.is_club === true,
        form: team?.is_club === true ? us : parseForm(r.form),
      };
    })
    .sort((a, b) => {
      if (a.position != null && b.position != null) return a.position - b.position;
      if (a.position != null) return -1;
      if (b.position != null) return 1;
      return (
        b.points - a.points ||
        b.goalDifference - a.goalDifference ||
        b.goals_for - a.goals_for ||
        a.name.localeCompare(b.name)
      );
    });
  return {
    rows,
    division: rows.find((r) => r.division)?.division ?? null,
    updatedAt: rows.reduce(
      (latest, r) => (latest == null || r.updated_at > latest ? r.updated_at : latest),
      null,
    ),
  };
}

/**
 * The two rows in one season's table for us and one opponent, ranked and
 * picked out of `leagueStandings` rather than re-deriving points or goal
 * difference, which that function already owns. `them` is null when the
 * season has no table entered, or the opponent has no row in it — a
 * friendly, a cup tie, a club outside the division — which is the common
 * case a head-to-head tape has to render around rather than crash on.
 */
export function twoRows(leagueRows, teams, season, opponentTeamId) {
  const { rows, division, updatedAt } = leagueStandings(leagueRows, teams, season);
  const ranked = rows.map((r, i) => ({ ...r, rank: r.position ?? i + 1 }));
  return {
    us: ranked.find((r) => r.isUs) ?? null,
    them: opponentTeamId ? ranked.find((r) => r.team_id === opponentTeamId) ?? null : null,
    division,
    updatedAt,
  };
}

/**
 * Attack and defence across a whole division, off the same hand-entered rows
 * the standings come from: goals for over played, and goals against over
 * played, each ranked best first. A table sorted on points answers neither
 * question, and these are free — nobody types in anything new for them.
 *
 * One season at a time, because `league_rows` is scoped that way: there is no
 * all-seasons division to combine.
 *
 * Three things a per-game figure has to get right, and every one of them is
 * silent when it's wrong:
 *
 *   * **A club that has played nothing has no ratio.** Dividing by zero is
 *     either NaN or, if the zero is quietly treated as a score of none,
 *     a club that hasn't kicked a ball topping the defence table. Those clubs
 *     come out of both rankings with a null and are named beneath instead. It
 *     is not hypothetical: one of the nine clubs in the club's own 2026/27
 *     division had played nothing a fortnight into the season.
 *   * **The average is the ratio of the totals, not the mean of the ratios.**
 *     The table is not always square: clubs play different numbers of games,
 *     and a mean of ratios lets a club that has played once count as much as
 *     one that has played twelve. Summed over the clubs that have played, so
 *     every goal in the numerator has games behind it in the denominator.
 *   * **One scale for both lists.** Scored and conceded are the same unit, so
 *     they are drawn against one maximum and the two lists can be read against
 *     each other. The two averages are still worked out separately: a complete
 *     division's goals for and goals against are the same pile of goals counted
 *     twice, but this table is typed in by hand and doesn't have to balance —
 *     the committed fixture's is 209 against 193.
 */
export function divisionRatios(leagueRows, teams, season) {
  const { rows, division, updatedAt } = leagueStandings(leagueRows, teams, season);

  const clubs = rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.team?.slug ?? null,
    isUs: r.isUs,
    played: r.played,
    goalsFor: r.goals_for,
    goalsAgainst: r.goals_against,
    scored: r.played > 0 ? r.goals_for / r.played : null,
    conceded: r.played > 0 ? r.goals_against / r.played : null,
  }));

  const playing = clubs.filter((c) => c.played > 0);
  const totals = playing.reduce(
    (t, c) => ({
      played: t.played + c.played,
      goalsFor: t.goalsFor + c.goalsFor,
      goalsAgainst: t.goalsAgainst + c.goalsAgainst,
    }),
    { played: 0, goalsFor: 0, goalsAgainst: 0 },
  );
  const average = (goals) => (totals.played > 0 ? goals / totals.played : null);

  return {
    division,
    updatedAt,
    clubs,
    scored: { rows: rankOn(playing, 'scored', 'most'), average: average(totals.goalsFor) },
    conceded: { rows: rankOn(playing, 'conceded', 'fewest'), average: average(totals.goalsAgainst) },
    // Null only when there is nothing to rank — a goalless division would
    // still have clubs and games, and is a card with every bar at nothing
    // rather than a card with no data.
    scale: playing.length > 0
      ? playing.reduce((max, c) => Math.max(max, c.scored, c.conceded), 0)
      : null,
  };
}

/**
 * One ranking of the clubs that have played, best first, with level clubs
 * sharing a rank — 1, 1, 3, the same way every other board on the site reads
 * a tie (docs/DESIGN.md → *Ties*).
 *
 * Games played breaks a tie ahead of the name, because the same ratio over
 * more football is the better-evidenced one, and it is the only tiebreak here
 * that says anything.
 */
function rankOn(clubs, key, best) {
  const sorted = [...clubs].sort(
    (a, b) =>
      (best === 'most' ? b[key] - a[key] : a[key] - b[key])
      || b.played - a.played
      || a.name.localeCompare(b.name),
  );
  let rank = 0;
  let previous = null;
  return sorted.map((club, i) => {
    if (club[key] !== previous) rank = i + 1;
    previous = club[key];
    return { ...club, value: club[key], rank };
  });
}
