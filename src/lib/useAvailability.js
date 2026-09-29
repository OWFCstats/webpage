import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from './supabase';
import { fetchAllPages } from './paging';
import { availableIds, describeAvailabilityError } from './availability';

/**
 * The poll answers for a set of matches, and the one write that changes them.
 *
 * Read with `supabase`, the signed-in client, not `supabaseRead`: the table has
 * no public read policy, so the sessionless client would get an empty list back
 * and every page would say nobody had answered. Paged like every other read —
 * forty members a match passes PostgREST's thousand-row cap inside two seasons.
 *
 * Each tap saves on its own. Forty names on a phone at a pub table is too many
 * to lose to a Save button that was never pressed, so an answer is written as
 * it is given, shown at once, and put back if the write fails.
 */
export function useAvailability(matchIds) {
  const key = [...matchIds].sort().join(',');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ids = key ? key.split(',') : [];
    let live = true;
    if (ids.length === 0) {
      setRows([]);
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    fetchAllPages((from, to) =>
      supabase
        .from('availability')
        .select('*')
        .in('match_id', ids)
        .order('match_id')
        .order('player_id')
        .range(from, to),
    ).then(({ data, error: err }) => {
      if (!live) return;
      setRows(data ?? []);
      setError(err ? describeAvailabilityError(err.message) : null);
      setLoading(false);
    });
    return () => {
      live = false;
    };
  }, [key]);

  /**
   * `available` is true, false, or null to clear the answer back to no reply;
   * `previous` is what the row said before the tap, which is what a failed
   * write puts back.
   */
  const setAnswer = useCallback(async (matchId, playerId, available, previous = null) => {
    setRows((prev) => withAnswer(prev, matchId, playerId, available));
    setError(null);
    const { error: err } = available == null
      ? await supabase.from('availability').delete().eq('match_id', matchId).eq('player_id', playerId)
      : await supabase.from('availability').upsert(
          { match_id: matchId, player_id: playerId, available, updated_at: new Date().toISOString() },
          { onConflict: 'match_id,player_id' },
        );
    if (err) {
      setRows((prev) => withAnswer(prev, matchId, playerId, previous));
      setError(describeAvailabilityError(err.message));
    }
  }, []);

  return { rows, loading, error, setAnswer };
}

/**
 * Everyone who said yes for one match, for the lineup editors to fill from.
 * Empty while it loads, when nothing was entered, and when the read fails —
 * the fill button just doesn't appear, and the lineup is picked by hand as it
 * always was.
 */
export function useSaidIn(matchId) {
  const { rows } = useAvailability(matchId ? [matchId] : []);
  return useMemo(() => availableIds(rows, matchId), [rows, matchId]);
}

function withAnswer(rows, matchId, playerId, available) {
  const rest = rows.filter((r) => !(r.match_id === matchId && r.player_id === playerId));
  return available == null ? rest : [...rest, { match_id: matchId, player_id: playerId, available }];
}
