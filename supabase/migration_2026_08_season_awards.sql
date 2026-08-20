-- Migration: hand-picked season awards
-- Run once in the Supabase Dashboard -> SQL Editor (only needed for databases
-- created from the original schema; supabase/schema.sql already includes this
-- change for fresh installs).
--
-- Four of the five awards on the honours board are derived from our own rows:
-- most goals, most assists, most appearances, most MOTMs. Player of the Season
-- is voted by the players, and no formula produces it -- inventing one would be
-- arbitrary and argued with -- so it is the second and last thing on this site
-- an admin types in rather than the site working out (league standings are the
-- other).
--
-- Keyed by `award_key` rather than given a column of its own, so the next
-- hand-picked award the club invents needs a row, not a migration.

create table if not exists public.season_awards (
  id         uuid primary key default gen_random_uuid(),
  season     text not null,
  -- Which award this row is, e.g. 'player-of-the-season'. The client owns the
  -- list of keys it renders; an unknown key here is simply not shown.
  award_key  text not null,
  player_id  uuid not null references public.players (id) on delete cascade,
  -- Optional colour: where it was voted, what it was for. Shown under the name.
  note       text,
  -- Set explicitly by the admin page on every save; no trigger.
  updated_at timestamptz not null default now()
);

-- One winner per award per season: re-picking replaces the name rather than
-- forking a second row. A shared vote would mean widening this index, which is
-- the one thing to look at first if the club ever ties one.
create unique index if not exists season_awards_season_key_idx
  on public.season_awards (season, award_key);
create index if not exists season_awards_season_idx on public.season_awards (season);

-- ---------------------------------------------------------------------------
-- Row Level Security -- same shape as every other table (see schema.sql).
-- ---------------------------------------------------------------------------

alter table public.season_awards enable row level security;

drop policy if exists "Public read"  on public.season_awards;
drop policy if exists "Admin insert" on public.season_awards;
drop policy if exists "Admin update" on public.season_awards;
drop policy if exists "Admin delete" on public.season_awards;

create policy "Public read"  on public.season_awards for select using (true);
create policy "Admin insert" on public.season_awards for insert to authenticated with check (true);
create policy "Admin update" on public.season_awards for update to authenticated using (true) with check (true);
create policy "Admin delete" on public.season_awards for delete to authenticated using (true);

-- Force PostgREST to pick up the new table immediately rather than waiting for
-- its automatic schema-cache reload.
notify pgrst, 'reload schema';
