-- Migration: walkover point deductions in the league table
-- Run once in the Supabase Dashboard -> SQL Editor (only needed for databases
-- created before this change; supabase/schema.sql already includes it for
-- fresh installs).
--
-- A walkover loss costs a club 3 points on top of not winning the game (see
-- matchPoints() in src/lib/matches.js) -- but league_rows only ever stored
-- W/D/L, so the published points total had no way to show that, for us or
-- for anyone else in the division. The only workaround was typing a
-- `position` that didn't match the arithmetic. This column counts how many
-- walkover losses a club was charged this season, for whichever club it was
-- against; leagueStandings() (src/lib/league.js) now deducts 3 points per
-- walkover loss when it works points out from W/D/L, so the total on the
-- public table is automatic again instead of needing a position override to
-- paper over it.

alter table public.league_rows
  add column if not exists walkover_losses integer not null default 0
  check (walkover_losses >= 0);

comment on column public.league_rows.walkover_losses is
  'Walkover losses this club was charged this season -- each one costs 3 points on top of the loss itself.';

notify pgrst, 'reload schema';
