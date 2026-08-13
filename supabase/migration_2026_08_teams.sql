-- Migration: teams table
-- Run once in the Supabase Dashboard -> SQL Editor (only needed for databases
-- created from the original schema; supabase/schema.sql already includes
-- this change for fresh installs).
--
-- `matches.opponent` is free text, which is why the stats layer needs
-- slugify() plus fuzzy matching to group a club under one page -- any typo
-- forks a new opponent. This adds a real `teams` table with a proper
-- identity per club (including a place for Old Wellingtonians' own pitch,
-- for a later issue that derives the fixture address from venue + pitch),
-- and links matches to it via a new nullable `opponent_team_id`.
-- `matches.opponent` itself is untouched -- the public pages still read it,
-- and the switchover to opponent_team_id is a later issue.

create table if not exists public.teams (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  -- Optional short label for tight layouts (e.g. table columns); falls back
  -- to `name` wherever it's blank.
  short_name    text,
  slug          text not null,
  -- True only for Old Wellingtonians -- the one row that is us, not an
  -- opponent. Lets a later issue tell "our pitch" apart from "their pitch".
  is_club       boolean not null default false,
  pitch_name    text,
  pitch_address text,
  postcode      text,
  map_url       text,
  notes         text,
  created_at    timestamptz not null default now()
);

-- Case-insensitive: "Old Wimbledonians" and "old wimbledonians" are the same
-- club and must collide on insert rather than fork a second row.
create unique index if not exists teams_name_lower_idx on public.teams (lower(name));
create unique index if not exists teams_slug_idx        on public.teams (slug);

-- ---------------------------------------------------------------------------
-- Row Level Security -- same shape as every other table (see schema.sql).
-- ---------------------------------------------------------------------------

alter table public.teams enable row level security;

drop policy if exists "Public read"  on public.teams;
drop policy if exists "Admin insert" on public.teams;
drop policy if exists "Admin update" on public.teams;
drop policy if exists "Admin delete" on public.teams;

create policy "Public read"  on public.teams for select using (true);
create policy "Admin insert" on public.teams for insert to authenticated with check (true);
create policy "Admin update" on public.teams for update to authenticated using (true) with check (true);
create policy "Admin delete" on public.teams for delete to authenticated using (true);

-- ---------------------------------------------------------------------------
-- Seed: one row per distinct opponent already recorded, plus our own club.
-- Skips any name that's already present (safe to re-run, and safe if an
-- admin has already started managing teams by hand).
-- ---------------------------------------------------------------------------

with candidates as (
  (
    -- One row per opponent spelling, case-insensitively -- ties broken the
    -- same way the public opponent pages already do (see opponentMatches in
    -- src/lib/stats.js): the most recently played spelling wins.
    -- Parenthesized: DISTINCT ON + ORDER BY can't stand as a bare UNION arm.
    select distinct on (lower(opponent)) opponent as name, false as is_club, date
    from public.matches
    where opponent is not null and trim(opponent) <> ''
    order by lower(opponent), date desc
  )

  union all

  select 'Old Wellingtonians', true, null
),
deduped as (
  -- Guard against "Old Wellingtonians" also having been recorded as an
  -- opponent string somewhere -- the is_club row wins that collision.
  select distinct on (lower(name)) name, is_club
  from candidates
  order by lower(name), is_club desc
),
slugged as (
  select
    name,
    is_club,
    -- Mirrors slugify() in src/lib/stats.js: trim, lowercase, collapse
    -- non-alphanumeric runs to a single hyphen, strip leading/trailing ones.
    regexp_replace(regexp_replace(lower(trim(name)), '[^a-z0-9]+', '-', 'g'), '^-+|-+$', '', 'g') as base_slug
  from deduped
),
numbered as (
  -- Two different club names can still slugify the same (e.g. punctuation-only
  -- differences); number them so the unique slug index never blocks the seed.
  select name, is_club, base_slug,
    row_number() over (partition by base_slug order by name) as rn
  from slugged
)
insert into public.teams (name, slug, is_club)
select
  name,
  case when rn = 1 then base_slug else base_slug || '-' || rn end,
  is_club
from numbered
where not exists (select 1 from public.teams t where lower(t.name) = lower(numbered.name));

-- ---------------------------------------------------------------------------
-- Link matches to teams. Nullable and additive: `opponent` remains the
-- source of truth for every existing public page.
-- ---------------------------------------------------------------------------

alter table public.matches
  add column if not exists opponent_team_id uuid references public.teams (id);

create index if not exists matches_opponent_team_id_idx on public.matches (opponent_team_id);

update public.matches m
set opponent_team_id = t.id
from public.teams t
where m.opponent_team_id is null
  and lower(m.opponent) = lower(t.name);

-- Force PostgREST to pick up the new table and column immediately rather
-- than waiting for its automatic schema-cache reload.
notify pgrst, 'reload schema';
