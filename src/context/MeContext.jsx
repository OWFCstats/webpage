import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { clearMe, readMe, writeMe } from '../lib/me';
import { countEvent } from '../lib/analytics';

// Which player the reader says they are, held in a cookie on their own phone.
//
// A sibling of AuthContext and deliberately not part of it: a session is
// authentication and grants writes, this is a preference and grants nothing.
// DESIGN.md → *What the site remembers, and what it doesn't* is the ruling on
// why conflating the two is the mistake worth guarding against.
const MeContext = createContext({ meId: null, pickMe: () => {}, forgetMe: () => {} });

export function MeProvider({ children }) {
  // Read once, synchronously: Home decides what it leads with on its first
  // render, and a pick that arrived an effect later would show the stranger's
  // Home to a player who has already made one.
  const [meId, setMeId] = useState(() => readMe());

  const pickMe = useCallback((playerId) => {
    writeMe(playerId);
    setMeId(playerId);
    // Whether anybody picks at all is the only thing that says whether this
    // feature works — no id goes with it, and none could: the counter is
    // cookieless and this is the one thing the site knows that it doesn't.
    countEvent('me-pick');
  }, []);

  const forgetMe = useCallback(() => {
    clearMe();
    setMeId(null);
  }, []);

  const value = useMemo(() => ({ meId, pickMe, forgetMe }), [meId, pickMe, forgetMe]);
  return <MeContext.Provider value={value}>{children}</MeContext.Provider>;
}

export function useMe() {
  return useContext(MeContext);
}
