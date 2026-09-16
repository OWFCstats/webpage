-- Migration: venue is required
-- Run once in the Supabase Dashboard -> SQL Editor (only needed for databases
-- created from the original schema; supabase/schema.sql already includes this
-- change for fresh installs).
--
-- venue went in nullable (migration_2026_07_venue.sql) because the rows
-- imported before it existed had nowhere to get one from. Every one of them has
-- since been filled in from the club's own records, so the column has no nulls
-- left and nothing but a new row entered carelessly can put one back.
--
-- Nullable is not free. A null venue is not "no answer", it is a wrong one:
-- matchHomeAway() read `venue !== 'A'` and therefore claimed we were at home on
-- every unrecorded row, and venueTeam() returned no pitch at all. The redesign
-- (ROADMAP.md -> phases 57 to 64) puts home and away on the fixture card, the
-- H/A letter in every list and the goals split on Season, so a guess becomes
-- something a player reads and believes.
--
-- This deliberately does not backfill. A venue nobody recorded cannot be
-- derived from the rows we hold -- that is the whole reason it is a stored
-- column -- so the guard below stops and names the count rather than inventing
-- one. If it fires, fill the rows in from the match editor and run this again:
--
--   select id, season, date, opponent from public.matches where venue is null;

do $$
declare unrecorded integer;
begin
  select count(*) into unrecorded from public.matches where venue is null;
  if unrecorded > 0 then
    raise exception
      'venue is null on % match row(s); fill them in before running this migration', unrecorded
      using hint = 'select id, season, date, opponent from public.matches where venue is null;';
  end if;
end $$;

alter table public.matches
  alter column venue set not null;

comment on column public.matches.venue is
  'H = home, A = away, N = neutral. Required: an unrecorded venue reads as a home game.';

-- Force PostgREST to pick up the changed column immediately rather than waiting
-- for its automatic schema-cache reload.
notify pgrst, 'reload schema';
