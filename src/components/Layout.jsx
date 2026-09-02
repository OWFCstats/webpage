import { Suspense, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMe } from '../context/MeContext';
import { countView, startAnalytics } from '../lib/analytics';
import ErrorBoundary from './ErrorBoundary';
import { Crest, Spinner } from './bits';

// Home is the front door — a dashboard of the season at a glance — and the
// four sections behind it. Anything narrower than an idea of its own lives
// inside one of these rather than in the nav — see the Leaderboards/Squad
// selector on Players, or the season chips on a player's own page.
const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/matchday', label: 'Matchday' },
  { to: '/season', label: 'Season' },
  { to: '/players', label: 'Players' },
  { to: '/records', label: 'Records' },
];

// Simple line icons so the bottom bar reads at 16px without colour emoji.
const ICONS = {
  '/': (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M2.4 7.6 8 2.8l5.6 4.8" />
      <path d="M3.9 6.9v5.6a.7.7 0 0 0 .7.7h6.8a.7.7 0 0 0 .7-.7V6.9" />
      <path d="M6.6 13.2V9.6h2.8v3.6" />
    </svg>
  ),
  '/matchday': (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="6" />
      <path d="M8 4.6 5.2 6.7l1.1 3.3h3.4l1.1-3.3z" />
    </svg>
  ),
  '/season': (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <rect x="2.5" y="3.5" width="11" height="10" rx="1.5" />
      <path d="M2.5 6.6h11M5.6 2.1v2.6M10.4 2.1v2.6" />
    </svg>
  ),
  '/players': (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="6.2" cy="6" r="2.2" />
      <path d="M2.4 13.1c0-2.1 1.7-3.5 3.8-3.5s3.8 1.4 3.8 3.5" />
      <circle cx="11.7" cy="6.7" r="1.7" />
      <path d="M11.2 9.8c1.7-.1 3.1 1.1 3.1 3.3" />
    </svg>
  ),
  '/records': (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M5.2 2.6h5.6v3.1a2.8 2.8 0 0 1-5.6 0z" />
      <path d="M5.2 3.7H3.3c0 1.8.8 2.6 1.9 2.8M10.8 3.7h1.9c0 1.8-.8 2.6-1.9 2.8M8 8.6v2.3M5.9 13.4h4.2l-.5-2.5H6.4z" />
    </svg>
  ),
};

export default function Layout() {
  const { session } = useAuth();
  const { meId } = useMe();
  // The bottom bar carries the five public tabs; on admin screens it would
  // only get in the way of the save buttons.
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');

  // Usage counting, if a counter is configured — see lib/analytics.js, which
  // does nothing at all when one isn't. It lives here because this is the one
  // component every route renders inside.
  useEffect(() => {
    startAnalytics();
    // Every view, the first one included: the script is told not to count
    // anything itself, because on a hash-routed site the view it would take is
    // `/` whether the reader landed on Home or on a player page shared into
    // the group chat. Pathname, not location.key, for the same reason <main>
    // is keyed on it below: a ?q= change is somebody typing in a search box,
    // and that isn't a second visit.
    countView(pathname, meId);
    // Pathname alone: `meId` is read for the split between a reader's own page
    // and somebody else's, but picking a name is not a second visit to the page
    // you picked it on, so it must not re-file the view.
  }, [pathname]);

  return (
    <>
      <header className="site-header">
        <div className="inner">
          <NavLink to="/" className="brand">
            <Crest />
            <span>
              <span className="name">Old Wellingtonians FC</span>
              <span className="sub label">Club Statistics</span>
            </span>
          </NavLink>
          <nav className="main-nav">
            {/* Desktop only: below 700px these are hidden by CSS and the
                bottom tab bar carries the same five sections. */}
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  isActive ? 'section-link active' : 'section-link'
                }
              >
                {item.label}
              </NavLink>
            ))}
            <NavLink
              to="/admin"
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              {session ? 'Admin' : 'Log in'}
            </NavLink>
          </nav>
        </div>
      </header>
      {/* Keyed so <main> remounts on a section change and the page-in fade in
          layout.css actually fires. Without it the element persists for the
          life of the tab and the fade only ever ran once, on first paint.
          Pathname, not location.key: a ?q= change is the user typing in a
          search box, and that must not refade the page under them. */}
      <main className="page" key={pathname}>
        {/* The waiting and the failing both belong in the page column, not
            around the whole document. The admin section is fetched on demand,
            and with the boundary outside this element a tap on "Add result"
            took the masthead, the tab bar and the footer down with it — a
            spinner alone on empty paper while the chunk arrived, and nothing
            at all if it never did. Both are inside the key, so a failed page
            clears itself on the next navigation. */}
        <ErrorBoundary>
          <Suspense fallback={<Spinner />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      <footer className="site-footer">
        Old Wellingtonians FC · est. on the pitch, settled in the bar
      </footer>
      {/* Phones get the five sections at thumb height; the header keeps only
          the brand and Admin / Log in. Hidden on desktop via CSS. */}
      {!isAdmin && (
        <nav className="tab-bar" aria-label="Primary">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              {ICONS[item.to]}
              {item.label}
            </NavLink>
          ))}
        </nav>
      )}
    </>
  );
}
