import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/results', label: 'Results & Form' },
  { to: '/matches', label: 'Fixtures' },
  { to: '/leaderboards', label: 'Leaderboards' },
  { to: '/stats', label: 'In-Depth' },
  { to: '/players', label: 'Players' },
  { to: '/trends', label: 'Trends' },
];

function Crest() {
  // The club supplies public/crest.png; until it exists we show a monogram.
  const [missing, setMissing] = useState(false);
  if (missing) return <span className="crest-fallback">OW</span>;
  return (
    <img
      src={`${import.meta.env.BASE_URL}crest.png`}
      alt="Wellington College crest"
      onError={() => setMissing(true)}
    />
  );
}

export default function Layout() {
  const { session } = useAuth();
  return (
    <>
      <header className="site-header">
        <div className="inner">
          <NavLink to="/" className="brand">
            <Crest />
            <span>
              <span className="name">Old Wellingtonians FC</span>
              <span className="sub">Club Statistics</span>
            </span>
          </NavLink>
          <nav className="main-nav">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => (isActive ? 'active' : undefined)}
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
      <main className="page">
        <Outlet />
      </main>
      <footer className="site-footer">
        Old Wellingtonians FC · est. on the pitch, settled in the bar
      </footer>
    </>
  );
}
