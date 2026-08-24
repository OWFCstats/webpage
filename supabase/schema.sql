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

create table if not exists public.matches (
  id                uuid primary key default gen_random_uuid(),
  season            text not null,
  date              date not null,
  -- Local (UK) kick-off time. Nullable: most historical rows will never have
  -- one, and an upcoming fixture can be created before the time is confirmed.
  kickoff_time      time,
  -- Denormalised name, kept in sync with opponent_team_id on every write so
  -- anything still reading the text column (older rows, exports) keeps
  -- working. opponent_team_id is the source of truth for grouping a club's
  -- matches under one page.
  opponent          text not null,
  opponent_team_id  uuid references public.teams (id),
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
  -- Awarded 3-0 because the opposition didn't field a team: no team sheet,
  -- no individual scorers. goals_for/goals_against/result are still set
  -- normally so every existing stat (top scorers excepted -- they read
  -- appearances, which stay empty) treats it like any other result.
  walkover          boolean not null default false,
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

-- Hand-entered league standings: one row per club per season. A league table
-- is the one thing the club's own results can't derive -- it needs the other
-- clubs' games -- so an admin types the published table in each week. Points
-- and goal difference are not stored: both are derived client-side (see
-- leagueStandings in src/lib/league.js) like every other stat here.
create table if not exists public.league_rows (
  id            uuid primary key default gen_random_uuid(),
  season        text not null,
  -- Free-text label for the table, e.g. 'Arthurian League Division 5'.
  division      text,
  team_id       uuid not null references public.teams (id),
  -- The published position, where the league's own order matters more than
  -- the arithmetic (tie-breaks vary; points deductions don't show up in a
  -- W/D/L line at all). Null means "rank this row on points, then GD".
  position      integer check (position is null or position >= 1),
  played        integer not null default 0 check (played >= 0),
  won           integer not null default 0 check (won >= 0),
  drawn         integer not null default 0 check (drawn >= 0),
  lost          integer not null default 0 check (lost >= 0),
  goals_for     integer not null default 0 check (goals_for >= 0),
  goals_against integer not null default 0 check (goals_against >= 0),
  -- Walkover losses charged this season, for whichever club conceded them --
  -- each one costs 3 points on top of the loss itself (see leagueStandings in
  -- src/lib/league.js), which a W/D/L line alone can't show.
  walkover_losses integer not null default 0 check (walkover_losses >= 0),
  -- Set explicitly on every save by the admin page; no trigger.
  updated_at    timestamptz not null default now()
);

-- Hand-picked season awards: the honours board's one column no formula can
-- produce. Golden Boot, Assist King, The Dependable and Most MOTM are all
-- derived from our own rows; Player of the Season is voted by the players, so
-- an admin types it in. Keyed by `award_key` so the next hand-picked award the
-- club invents needs a row rather than another migration.
create table if not exists public.season_awards (
  id         uuid primary key default gen_random_uuid(),
  season     text not null,
  -- Which award this row is, e.g. 'player-of-the-season'. The client owns the
  -- list of keys it renders; an unknown key here is simply not shown.
  award_key  text not null,
  player_id  uuid not null references public.players (id) on delete cascade,
  -- Optional colour: where it was voted, what it was for. Shown under the name.
  note       text,
  -- Set explicitly on every save by the admin page; no trigger.
  updated_at timestamptz not null default now()
);

create index if not exists appearances_match_id_idx  on public.appearances (match_id);
create index if not exists appearances_player_id_idx on public.appearances (player_id);
create index if not exists matches_season_idx        on public.matches (season);
create index if not exists matches_date_idx          on public.matches (date);
create index if not exists matches_opponent_team_id_idx on public.matches (opponent_team_id);

-- Case-insensitive: "Old Wimbledonians" and "old wimbledonians" are the same
-- club and must collide on insert rather than fork a second row.
create unique index if not exists teams_name_lower_idx on public.teams (lower(name));
create unique index if not exists teams_slug_idx        on public.teams (slug);

-- At most one row can be "us" — venueTeam() (src/lib/matches.js) just takes
-- the first is_club row it finds, so a second one would silently take over
-- every home fixture's pitch.
create unique index if not exists teams_one_club_idx on public.teams (is_club) where is_club;

-- One row per club per season: re-entering the table upserts onto this pair
-- rather than forking a second row for a club already in it.
create unique index if not exists league_rows_season_team_idx on public.league_rows (season, team_id);
create index if not exists league_rows_season_idx on public.league_rows (season);

-- One winner per award per season: re-picking replaces the name rather than
-- forking a second row.
create unique index if not exists season_awards_season_key_idx
  on public.season_awards (season, award_key);
create index if not exists season_awards_season_idx on public.season_awards (season);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Public (anon) visitors: read-only. Logged-in (authenticated) admins: full write.
-- ---------------------------------------------------------------------------

alter table public.players     enable row level security;
alter table public.matches     enable row level security;
alter table public.appearances enable row level security;
alter table public.teams       enable row level security;
alter table public.league_rows enable row level security;
alter table public.season_awards enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['players', 'matches', 'appearances', 'teams', 'league_rows', 'season_awards'] loop
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
