import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { supabaseRead, supabaseConfigured } from '../lib/supabase';
import { fetchAllPages } from '../lib/paging';

// Every read the site makes, in one place. The whole dataset is small enough to
// hold in memory and derive every stat from client-side (see lib/matches.js,
// players.js, awards.js, league.js and charts.js). refresh() is called by admin
// pages after any write so public views stay current.
//
// "Small" is not the same as "bounded": each read is paged, because PostgREST
// answers at most 1,000 rows and `appearances` passes that around season six.
// See lib/paging.js.

const DataContext = createContext(null);

// A first load that fails is usually a hiccup rather than an outage: a phone
// waking on a bad signal, or a token the API rejects for a second. Two quiet
// retries before saying anything is the difference between the stats and an
// error note — and on the home-screen app there is no reload to fall back on.
const RETRY_DELAYS = [600, 1500];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * One table, every row, paged — see `lib/paging.js` for why any of this is
 * necessary.
 *
 * `order` receives the query and adds the sort. It has to end on something
 * unique, because paging an order that has ties lets rows move between pages;
 * `id` does that job for five of the six, and `appearances` gets it from the
 * `unique (match_id, player_id)` constraint the table already carries.
 */
const readAll = (table, order) =>
  fetchAllPages((from, to) =>
    order(supabaseRead.from(table).select('*')).range(from, to));

export function DataProvider({ children }) {
  const [state, setState] = useState({
    players: [],
    matches: [],
    appearances: [],
    teams: [],
    leagueRows: [],
    seasonAwards: [],
    loading: true,
    error: null,
  });

  // After the first successful load, refreshes run in the background (loading
  // stays false) so open pages — e.g. the lineup editor right after a save —
  // aren't unmounted by the global spinner.
  const hasLoaded = useRef(false);

  const refresh = useCallback(async () => {
    if (!supabaseConfigured) {
      setState((s) => ({ ...s, loading: false, error: 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to .env.local.' }));
      return;
    }
    setState((s) => ({ ...s, loading: !hasLoaded.current, error: null }));

    for (let attempt = 0; ; attempt++) {
      const [players, matches, appearances, teams, leagueRows, seasonAwards] = await Promise.all([
        readAll('players', (q) => q.order('name').order('id')),
        readAll('matches', (q) => q.order('date', { ascending: false }).order('id')),
        readAll('appearances', (q) => q.order('match_id').order('player_id')),
        readAll('teams', (q) => q.order('name').order('id')),
        readAll('league_rows', (q) => q.order('season').order('id')),
        readAll('season_awards', (q) => q.order('season').order('id')),
      ]);
      const failed = [players, matches, appearances, teams, leagueRows, seasonAwards].find((r) => r.error);
      if (!failed) {
        hasLoaded.current = true;
        setState({
          players: players.data,
          matches: matches.data,
          appearances: appearances.data,
          teams: teams.data,
          leagueRows: leagueRows.data,
          seasonAwards: seasonAwards.data,
          loading: false,
          error: null,
        });
        return;
      }
      if (attempt >= RETRY_DELAYS.length) {
        setState((s) => ({ ...s, loading: false, error: failed.error.message }));
        return;
      }
      await wait(RETRY_DELAYS[attempt]);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <DataContext.Provider value={{ ...state, refresh }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
