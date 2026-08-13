-- Migration: league standings table
-- Run once in the Supabase Dashboard -> SQL Editor (only needed for databases
-- created from the original schema; supabase/schema.sql already includes
-- this change for fresh installs).
--
-- Every other stat on this site is derived from the club's own three tables,
-- but a league table needs the *other* clubs' results, which those tables
-- can't know. Nothing is scraped: an admin types the published table in after
-- the results come in, one row per club per season. Each row points at a
-- `teams` row rather than carrying a club name, so a club is spelled once and
-- its table row links to the same page its fixtures do.
--
-- Points and goal difference are deliberately not columns here -- both are
-- derived in the client (leagueStandings() in src/lib/stats.js), the same way
-- every other stat on the site is. That's two fewer numbers to get wrong when
-- the table is being entered on a phone on a Saturday night, and no way for a
-- stored total to drift from the W/D/L it's supposed to summarise.

create table if not exists public.league_rows (
  id            uuid primary key default gen_random_uuid(),
  season        text not null,
  -- Free text, e.g. 'Arthurian League Division 5'. Nullable: it's a label for
  -- the table, not an identifier, and the public widget simply omits it when
  -- it's blank.
  division      text,
  team_id       uuid not null references public.teams (id),
  -- The published position, where the league's own order matters more than
  -- the arithmetic: tie-breaks vary by competition and points deductions
  -- don't show up in a W/D/L line at all. Nullable, and when it's null the
  -- client ranks the row on points, then goal difference, then goals scored.
  position      integer,
  played        integer not null default 0,
  won           integer not null default 0,
  drawn         integer not null default 0,
  lost          integer not null default 0,
  goals_for     integer not null default 0,
  goals_against integer not null default 0,
  -- Set explicitly by the admin page on every save (there's no trigger), so
  -- the public table can say how current the standings are.
  updated_at    timestamptz not null default now()
);

-- One row per club per season: re-entering the table upserts onto this pair
-- rather than forking a second row for a club already in it.
create unique index if not exists league_rows_season_team_idx on public.league_rows (season, team_id);
create index if not exists league_rows_season_idx on public.league_rows (season);

-- ---------------------------------------------------------------------------
-- Row Level Security -- same shape as every other table (see schema.sql).
-- ---------------------------------------------------------------------------

alter table public.league_rows enable row level security;

drop policy if exists "Public read"  on public.league_rows;
drop policy if exists "Admin insert" on public.league_rows;
drop policy if exists "Admin update" on public.league_rows;
drop policy if exists "Admin delete" on public.league_rows;

create policy "Public read"  on public.league_rows for select using (true);
create policy "Admin insert" on public.league_rows for insert to authenticated with check (true);
create policy "Admin update" on public.league_rows for update to authenticated using (true) with check (true);
create policy "Admin delete" on public.league_rows for delete to authenticated using (true);

-- Force PostgREST to pick up the new table immediately rather than waiting for
-- its automatic schema-cache reload.
notify pgrst, 'reload schema';
