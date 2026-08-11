import { useEffect, useState } from 'react';

/** True on phone-width screens; Recharts needs the breakpoint in JS as well as
 *  CSS, so every chart on the site shares this one hook. */
export function useIsNarrow(query = '(max-width: 700px)') {
  const [narrow, setNarrow] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e) => setNarrow(e.matches);
    mq.addEventListener('change', onChange);
    setNarrow((prev) => (prev === mq.matches ? prev : mq.matches));
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return narrow;
}
