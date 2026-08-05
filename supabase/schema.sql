-- Old Wellingtonians FC — database schema + Row Level Security
-- Run this once in the Supabase Dashboard: SQL Editor → New query → paste → Run.
-- Safe to re-run: it only creates things that don't already exist.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.players (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  -- Optional informational label; no stat depends on it.
  position   text check (position in ('GK', 'DEF', 'MID', 'FWD')),
  status     text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now()
);

create table if not exists public.matches (
  id                uuid primary key default gen_random_uuid(),
  season            text not null,
  date              date not null,
  opponent          text not null,
  competition       text not null,
  -- H = home, A = away, N = neutral. Nullable: not every match has this
  -- recorded, and older rows won't until someone fills it in.
  venue             text check (venue in ('H', 'A', 'N')),
  -- Score columns are nullable so upcoming fixtures can exist before kick-off.
  goals_for         integer check (goals_for >= 0),
  goals_against     integer check (goals_against >= 0),
  own_goals_for     integer not null default 0 check (own_goals_for >= 0),
  own_goals_against integer not null default 0 check (own_goals_against >= 0),
  result            text check (result in ('W', 'D', 'L')),
  report            text,
  created_at        timestamptz not null default now()
);

create table if not exists public.appearances (
  id        uuid primary key default gen_random_uuid(),
  match_id  uuid not null references public.matches (id) on delete cascade,
  player_id uuid not null references public.players (id) on delete cascade,
  started   boolean not null default false,
  goals     integer not null default 0 check (goals >= 0),
  assists   integer not null default 0 check (assists >= 0),
  yellows   integer not null default 0 check (yellows >= 0),
  reds      integer not null default 0 check (reds >= 0),
  motm      boolean not null default false,
  -- Picked but withdrew in the 24h before kick-off; excluded from all
  -- appearance-based stats and counted separately.
  dropout   boolean not null default false,
  unique (match_id, player_id)
);

create index if not exists appearances_match_id_idx  on public.appearances (match_id);
create index if not exists appearances_player_id_idx on public.appearances (player_id);
create index if not exists matches_season_idx        on public.matches (season);
create index if not exists matches_date_idx          on public.matches (date);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Public (anon) visitors: read-only. Logged-in (authenticated) admins: full write.
-- ---------------------------------------------------------------------------

alter table public.players     enable row level security;
alter table public.matches     enable row level security;
alter table public.appearances enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['players', 'matches', 'appearances'] loop
    execute format('drop policy if exists "Public read"  on public.%I', t);
    execute format('drop policy if exists "Admin insert" on public.%I', t);
    execute format('drop policy if exists "Admin update" on public.%I', t);
    execute format('drop policy if exists "Admin delete" on public.%I', t);

    execute format(
      'create policy "Public read" on public.%I for select using (true)', t);
    execute format(
      'create policy "Admin insert" on public.%I for insert to authenticated with check (true)', t);
    execute format(
      'create policy "Admin update" on public.%I for update to authenticated using (true) with check (true)', t);
    execute format(
      'create policy "Admin delete" on public.%I for delete to authenticated using (true)', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Admin accounts
-- ---------------------------------------------------------------------------
-- Writes are allowed for any authenticated user, so keep self-signup OFF:
--   Dashboard → Authentication → Sign In / Up → disable "Allow new users to sign up".
-- Then create each admin by hand:
--   Dashboard → Authentication → Users → Add user → email + password.
