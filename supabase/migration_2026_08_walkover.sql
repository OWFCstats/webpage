-- Migration: walkover matches
-- Run once in the Supabase Dashboard -> SQL Editor (only needed for databases
-- created from the original schema; supabase/schema.sql already includes
-- this change for fresh installs).
--
-- A walkover is awarded 3-0 when the opposition doesn't show up: no team
-- sheet exists and no player is credited with a goal. The flag exists so the
-- admin UI can tell a walkover apart from an ordinary match that's simply
-- missing its lineup (which is flagged as unfinished data) -- everything
-- else (team goals for/against, W/D/L, points) is just the normal
-- goals_for/goals_against/result columns, already handled by every existing
-- stat.

alter table public.matches
  add column if not exists walkover boolean not null default false;

comment on column public.matches.walkover is
  'True for a 3-0 result awarded because the opposition did not field a team. No appearances rows exist for these matches by design.';
