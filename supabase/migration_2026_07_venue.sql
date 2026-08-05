-- Migration: home / away / neutral on a match
-- Run once in the Supabase Dashboard → SQL Editor.
--
-- Nullable on purpose: existing matches keep an empty venue and simply show no
-- (H)/(A) marker until someone fills it in from the match editor.

alter table public.matches
  add column if not exists venue text check (venue in ('H', 'A', 'N'));

comment on column public.matches.venue is
  'H = home, A = away, N = neutral. Null means not recorded.';
