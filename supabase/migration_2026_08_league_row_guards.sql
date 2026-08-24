-- Migration: guard league_rows against negative table entries
-- Run once in the Supabase Dashboard → SQL Editor (only needed for databases
-- created before this change; supabase/schema.sql already includes it for
-- fresh installs).
--
-- Every other stats table (matches, appearances) rejects a negative count at
-- the database, not just in the admin form. league_rows never got the same
-- checks: LeagueGrid's number inputs carry min="0", but Save isn't inside a
-- <form>, so the browser never enforces it, and a typo like "-3" for goals
-- against would have saved silently and shown up on the public League Table.

alter table public.league_rows drop constraint if exists league_rows_position_check;
alter table public.league_rows add constraint league_rows_position_check
  check (position is null or position >= 1);

alter table public.league_rows drop constraint if exists league_rows_played_check;
alter table public.league_rows add constraint league_rows_played_check check (played >= 0);

alter table public.league_rows drop constraint if exists league_rows_won_check;
alter table public.league_rows add constraint league_rows_won_check check (won >= 0);

alter table public.league_rows drop constraint if exists league_rows_drawn_check;
alter table public.league_rows add constraint league_rows_drawn_check check (drawn >= 0);

alter table public.league_rows drop constraint if exists league_rows_lost_check;
alter table public.league_rows add constraint league_rows_lost_check check (lost >= 0);

alter table public.league_rows drop constraint if exists league_rows_goals_for_check;
alter table public.league_rows add constraint league_rows_goals_for_check check (goals_for >= 0);

alter table public.league_rows drop constraint if exists league_rows_goals_against_check;
alter table public.league_rows add constraint league_rows_goals_against_check
  check (goals_against >= 0);

notify pgrst, 'reload schema';
