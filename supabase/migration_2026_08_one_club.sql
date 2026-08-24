-- Migration: only one team can be "us"
-- Run once in the Supabase Dashboard → SQL Editor (only needed for databases
-- created before this change; supabase/schema.sql already includes it for
-- fresh installs).
--
-- Nothing stopped a second team from being saved with is_club = true, but
-- venueTeam() (src/lib/matches.js) just takes teams.find(t => t.is_club) --
-- with two rows set, every home fixture's pitch would silently resolve to
-- whichever one sorts first alphabetically.
--
-- If this fails to apply, a second row already has is_club = true in this
-- database — find it (select name from teams where is_club) and clear the
-- flag on whichever one isn't Old Wellingtonians, then re-run this file.

create unique index if not exists teams_one_club_idx
  on public.teams (is_club)
  where is_club;
