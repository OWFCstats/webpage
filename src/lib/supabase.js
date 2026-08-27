import { createClient } from '@supabase/supabase-js';
import { cookieStorage } from './cookieStorage';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabaseConfigured = Boolean(url && key);

export const supabase = supabaseConfigured
  ? createClient(url, key, {
      auth: {
        storage: cookieStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null;

// Public reads go through their own client, which sends the publishable key and
// never a signed-in user's token.
//
// Sharing the one client meant an admin's session rode along on every page
// load, and a token that had just been refreshed was sometimes rejected by the
// API as issued a second in the future — "JWT issued at future" — so the site
// opened on an error note and only a manual reload cleared it. On a phone with
// the site saved to the home screen there is no address bar to reload from,
// which made a transient failure a dead end.
//
// Every table is `for select using (true)` (supabase/schema.sql), so a read
// never needed the session in the first place. Supplying `accessToken` is what
// makes this client sessionless: supabase-js then skips its auth module
// entirely, so nothing here starts a second session, refreshes a token or
// touches storage. It answers null — "no session" — rather than the key itself,
// so supabase-js authorises the request exactly as it does for a signed-out
// visitor: the headers are byte-identical, and they stay right if the club ever
// swaps a legacy anon key for an `sb_publishable_…` one, which is not a JWT.
//
// Writes still go through `supabase` above, which is the only thing that
// should carry a login.
export const supabaseRead = supabaseConfigured
  ? createClient(url, key, { accessToken: async () => null })
  : null;
