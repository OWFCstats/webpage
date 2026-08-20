import { Navigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from '../../components/bits';

export default function AdminLayout() {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner />;
  if (!session) return <Navigate to="/admin/login" replace state={{ from: location }} />;

  return (
    <div>
      <div className="section-head">
        <h1>Admin</h1>
        <div className="controls" style={{ marginBottom: 0 }}>
          <span className="muted">{session.user.email}</span>
          <button className="secondary small" onClick={() => supabase.auth.signOut()}>
            Sign out
          </button>
        </div>
      </div>
      <nav className="controls" aria-label="Admin sections">
        <NavLink to="/admin" end className={({ isActive }) => `btn small ${isActive ? '' : 'secondary'}`}>
          Overview
        </NavLink>
        <NavLink to="/admin/new-result" className={({ isActive }) => `btn small ${isActive ? '' : 'secondary'}`}>
          Add result
        </NavLink>
        <NavLink to="/admin/players" className={({ isActive }) => `btn small ${isActive ? '' : 'secondary'}`}>
          Players
        </NavLink>
        <NavLink to="/admin/teams" className={({ isActive }) => `btn small ${isActive ? '' : 'secondary'}`}>
          Teams
        </NavLink>
        <NavLink to="/admin/matches" className={({ isActive }) => `btn small ${isActive ? '' : 'secondary'}`}>
          Matches
        </NavLink>
        <NavLink to="/admin/league" className={({ isActive }) => `btn small ${isActive ? '' : 'secondary'}`}>
          League
        </NavLink>
        <NavLink to="/admin/awards" className={({ isActive }) => `btn small ${isActive ? '' : 'secondary'}`}>
          Awards
        </NavLink>
      </nav>
      <Outlet />
    </div>
  );
}
