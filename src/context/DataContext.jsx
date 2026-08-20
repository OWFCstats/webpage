import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase';

// The whole club dataset is a few hundred rows at most, so we load it in one
// go and derive every stat client-side (see lib/matches.js, players.js,
// awards.js, league.js and charts.js). refresh() is called by admin pages
// after any write so public views stay current.

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [state, setState] = useState({
    players: [],
    matches: [],
    appearances: [],
    teams: [],
    leagueRows: [],
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
    const [players, matches, appearances, teams, leagueRows] = await Promise.all([
      supabase.from('players').select('*').order('name'),
      supabase.from('matches').select('*').order('date', { ascending: false }),
      supabase.from('appearances').select('*'),
      supabase.from('teams').select('*').order('name'),
      supabase.from('league_rows').select('*'),
    ]);
    const failed = [players, matches, appearances, teams, leagueRows].find((r) => r.error);
    if (failed) {
      setState((s) => ({ ...s, loading: false, error: failed.error.message }));
      return;
    }
    hasLoaded.current = true;
    setState({
      players: players.data,
      matches: matches.data,
      appearances: appearances.data,
      teams: teams.data,
      leagueRows: leagueRows.data,
      loading: false,
      error: null,
    });
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
