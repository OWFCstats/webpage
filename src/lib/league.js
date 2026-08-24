// League standings: the one table that can't be derived from our own results.

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
 * Returns the division label and the most recent edit alongside the rows, both
 * of which the widget shows and neither of which is worth a second pass.
 */
export function leagueStandings(leagueRows, teams, season) {
  const teamById = new Map(teams.map((t) => [t.id, t]));
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
