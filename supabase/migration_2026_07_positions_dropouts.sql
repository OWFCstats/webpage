-- Migration: flexible positions + 24h dropout tracking
-- Run once in Supabase Dashboard → SQL Editor (only needed for databases
-- created from the original schema; supabase/schema.sql already includes
-- these changes for fresh installs).
--
-- 1. Positions become an optional informational label — no stat depends on
--    them any more (clean sheets are now credited to the whole team).
-- 2. appearances.dropout marks a player who was picked but dropped out in
--    the 24 hours before kick-off; dropout rows are excluded from every
--    appearance-based stat and counted separately.

alter table public.players alter column position drop not null;

alter table public.appearances
  add column if not exists dropout boolean not null default false;

-- Optional: clear the imported placeholder positions (the 2025/26 import set
-- everyone to MID because the spreadsheet had no position data). Uncomment to
-- blank them all and set real labels later where useful:
-- update public.players set position = null where position = 'MID';
