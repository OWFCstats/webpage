-- Migration: recent form on the league table
-- Run once in the Supabase Dashboard -> SQL Editor (only needed for databases
-- created before this change; supabase/schema.sql already includes it for
-- fresh installs).
--
-- The fourth stored fact on this site, and the same one league_rows already
-- holds: other clubs' results, which our own rows cannot derive. league_rows
-- stores totals -- played, won, drawn, lost, goals -- and a total says nothing
-- about the order the games came in, so no rival's run of five is derivable
-- from it. The published table prints one, so it gets typed in the same grid
-- on the same night as everything else on the row.
--
-- Our own row is never stored here: leagueStandings() (src/lib/league.js)
-- derives it from our league results, the same way it derives points and goal
-- difference. One source per row -- see the admin grid, which shows our form
-- read-only.
--
-- Oldest first, so the string reads left to right the way the chips are drawn:
-- 'WDLWW' is four games ago through last Saturday. Five is the column's whole
-- width, and the constraint says so; a club that has played twice has a
-- two-character string, and one that has played nothing has null.

alter table public.league_rows
  add column if not exists form text
  check (form is null or form ~ '^[WDL]{0,5}$');

comment on column public.league_rows.form is
  'Recent form for this club, oldest first, e.g. WDLWW -- typed in for rivals, null for us (ours is derived from our own results).';

notify pgrst, 'reload schema';
