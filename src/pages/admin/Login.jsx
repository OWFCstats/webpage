import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { session } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  // AdminLayout records where the admin was headed before it bounced them
  // here; this used to capture that and then drop it, so a link straight to a
  // match's lineup always landed on the overview instead.
  const from = location.state?.from?.pathname;
  if (session) return <Navigate to={from ?? '/admin'} replace />;

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (err) setError(err.message);
  }

  return (
    <div className="sheet login-box">
      <h1>Admin login</h1>
      <p className="muted">Sign in with your club admin account.</p>
      <form onSubmit={submit}>
        <div className="field" style={{ marginTop: '0.8rem' }}>
          <span>Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </div>
        <div className="field" style={{ marginTop: '0.8rem' }}>
          <span>Password</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        </div>
        {error && <div className="notice error" style={{ marginTop: '0.8rem' }}>{error}</div>}
        <div className="form-actions">
          <button type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        </div>
      </form>
    </div>
  );
}
