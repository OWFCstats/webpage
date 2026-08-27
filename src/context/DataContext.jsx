import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { supabaseRead, supabaseConfigured } from '../lib/supabase';

// The whole club dataset is a few hundred rows at most, so we load it in one
// go and derive every stat client-side (see lib/matches.js, players.js,
// awards.js, league.js and charts.js). refresh() is called by admin pages
// after any write so public views stay current.

const DataContext = createContext(null);

// A first load that fails is usually a hiccup rather than an outage: a phone
// waking on a bad signal, or a token the API rejects for a second. Two quiet
// retries before saying anything is the difference between the stats and an
// error note — and on the home-screen app there is no reload to fall back on.
const RETRY_DELAYS = [600, 1500];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
        supabaseRead.from('players').select('*').order('name'),
        supabaseRead.from('matches').select('*').order('date', { ascending: false }),
        supabaseRead.from('appearances').select('*'),
        supabaseRead.from('teams').select('*').order('name'),
        supabaseRead.from('league_rows').select('*'),
        supabaseRead.from('season_awards').select('*'),
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
