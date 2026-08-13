-- Migration: kick-off time on a match
-- Run once in the Supabase Dashboard -> SQL Editor (only needed for databases
-- created from the original schema; supabase/schema.sql already includes
-- this change for fresh installs).
--
-- Nullable: most historical rows will never have a kick-off time, and an
-- upcoming fixture can be created before the time is confirmed. Local (UK)
-- time only -- no time zone, matching how `date` is already stored.

alter table public.matches
  add column if not exists kickoff_time time;

comment on column public.matches.kickoff_time is
  'Local kick-off time, e.g. 14:00:00. Null means not yet confirmed / not recorded.';

-- PostgREST (the API layer the site talks to) caches the table schema and
-- won't see the new column until that cache reloads. Supabase normally does
-- this automatically a few seconds after a DDL change, but this forces it
-- immediately so "Could not find the 'kickoff_time' column ... in the schema
-- cache" clears right away instead of needing a wait or a manual reload
-- (Dashboard -> Settings -> API -> "Reload schema").
notify pgrst, 'reload schema';
