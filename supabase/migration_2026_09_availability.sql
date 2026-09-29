-- Migration: availability — who answered the group chat's poll for a match
-- Run once in the Supabase Dashboard -> SQL Editor (only needed for databases
-- created from the original schema; supabase/schema.sql already includes this
-- change for fresh installs).
--
-- Every match gets a poll in the main WhatsApp chat, and every member is asked
-- to answer it, "no" included. The admin types the answers in here, which does
-- two jobs: the lineup can be filled from the players who said yes, and a
-- season's tally shows who never answers at all.
--
-- Two changes:
--
-- 1. `players.in_chat` -- whether a player is in the main chat, and so is asked
--    the poll. Not the same as `status`: an inactive club legend can be in the
--    chat, and an active ringer who isn't in it physically can't answer.
--
-- 2. `availability` -- one row per player per match they answered. No row is
--    "no reply", which is the state everyone starts in; clearing an answer
--    deletes the row rather than nulling the column.
--
-- Unlike every other table, `availability` is NOT publicly readable. Who
-- ignores the club's polls is the admin's business, not the squad's, so there
-- is no "Public read" policy: a signed-out request gets no rows back. It also
-- means the daily backup (scripts/backup.mjs, which reads with the publishable
-- key) never sees it -- which is accepted: it is working data for the admin,
-- not the club's history.

alter table public.players
  add column if not exists in_chat boolean not null default false;

create table if not exists public.availability (
  id         uuid primary key default gen_random_uuid(),
  match_id   uuid not null references public.matches (id) on delete cascade,
  player_id  uuid not null references public.players (id) on delete cascade,
  -- True said yes, false said no. There is no maybe on the poll.
  available  boolean not null,
  -- Set explicitly by the admin page on every save; no trigger.
  updated_at timestamptz not null default now(),
  unique (match_id, player_id)
);

create index if not exists availability_player_id_idx on public.availability (player_id);

-- ---------------------------------------------------------------------------
-- Row Level Security -- admin only, read included.
-- ---------------------------------------------------------------------------

alter table public.availability enable row level security;

drop policy if exists "Admin read"   on public.availability;
drop policy if exists "Admin insert" on public.availability;
drop policy if exists "Admin update" on public.availability;
drop policy if exists "Admin delete" on public.availability;

create policy "Admin read"   on public.availability for select to authenticated using (true);
create policy "Admin insert" on public.availability for insert to authenticated with check (true);
create policy "Admin update" on public.availability for update to authenticated using (true) with check (true);
create policy "Admin delete" on public.availability for delete to authenticated using (true);

-- Force PostgREST to pick up the new table and column immediately rather than
-- waiting for its automatic schema-cache reload.
notify pgrst, 'reload schema';
