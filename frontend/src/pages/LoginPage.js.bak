import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HardHat } from 'lucide-react';
import { login } from '../services/api';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const demoEmail = process.env.REACT_APP_DEMO_EMAIL;
  const demoPassword = process.env.REACT_APP_DEMO_PASSWORD;
  const demoAvailable = Boolean(demoEmail && demoPassword);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(email, password);
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      if (onLogin) onLogin(res.user, res.token);
      nav('/', { replace: true });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-shell">
      <form onSubmit={submit} className="login-card">
        <div className="login-brand">
          <HardHat size={28} color="#f59e0b" />
          <div>
            <div className="login-title">Construction Safety Hub</div>
            <div className="login-sub">OSHA-compliant site management</div>
          </div>
        </div>

        <label className="login-field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>
        <label className="login-field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {error && <div className="error">{error}</div>}

        <button
          type="button"
          onClick={() => { setEmail(demoEmail); setPassword(demoPassword); setError(''); }}
          disabled={!demoAvailable || loading}
          aria-label="Fill demo credentials"
          style={{ width: '100%', marginBottom: '12px', padding: '10px 14px', borderRadius: '8px', border: '1px solid currentColor', background: 'transparent', cursor: 'pointer' }}
        >
          Fill demo credentials
        </button>
        <button type="submit" className="btn" disabled={loading} style={{ width: '100%', padding: '10px 14px' }}>
          {loading ? <><span className="spinner" /> Signing in...</> : 'Sign In'}
        </button>

        {!demoAvailable && <div className="login-hint">Demo credentials are not configured for this app session.</div>}
      </form>
    </div>
  );
}
