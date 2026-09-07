-- Migration: when a season's honours go up
-- Run once in the Supabase Dashboard -> SQL Editor (only needed for databases
-- created from the original schema; supabase/schema.sql already includes this
-- change for fresh installs).
--
-- The four season honours -- Player of the Season, Golden Boot, Playmaker, The
-- Dependable -- are end-of-season awards, and three of the four are derived from
-- our own rows. Derived means they have a value from the first whistle of a
-- season, which is how eleven players came to hold The Dependable after one game
-- of 2026/27: everybody who played had one appearance, so everybody led the
-- column.
--
-- The default rule needs no row in here and is in src/lib/awards.js: a season's
-- honours settle on 1 July after it ends, and not while a fixture for it is
-- still in the diary. This table is the override, for the two cases the calendar
-- can't know about -- the club wanting the trophies up on the night of the
-- dinner, and a season that has to be pulled back after a result was entered
-- wrong.
--
-- No row at all is "follow the rule", which is the state every season starts in
-- and nearly all of them stay in. That is the whole reason `honours_published`
-- is `not null`: a row exists only to override, and clearing an override deletes
-- the row rather than nulling the column.

create table if not exists public.season_status (
  id                uuid primary key default gen_random_uuid(),
  season            text not null,
  -- True publishes this season's honours now; false holds them back.
  honours_published boolean not null,
  -- Set explicitly by the admin page on every save; no trigger.
  updated_at        timestamptz not null default now()
);

-- One row per season: pressing the switch again replaces the answer rather than
-- forking a second row.
create unique index if not exists season_status_season_idx
  on public.season_status (season);

-- ---------------------------------------------------------------------------
-- Row Level Security -- same shape as every other table (see schema.sql).
-- ---------------------------------------------------------------------------

alter table public.season_status enable row level security;

drop policy if exists "Public read"  on public.season_status;
drop policy if exists "Admin insert" on public.season_status;
drop policy if exists "Admin update" on public.season_status;
drop policy if exists "Admin delete" on public.season_status;

create policy "Public read"  on public.season_status for select using (true);
create policy "Admin insert" on public.season_status for insert to authenticated with check (true);
create policy "Admin update" on public.season_status for update to authenticated using (true) with check (true);
create policy "Admin delete" on public.season_status for delete to authenticated using (true);

-- Force PostgREST to pick up the new table immediately rather than waiting for
-- its automatic schema-cache reload.
notify pgrst, 'reload schema';
