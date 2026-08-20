import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { validateEmail } from '../../utils/formatters';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateEmail(email)) { setError('Please enter a valid email address.'); return; }
    if (!password) { setError('Password is required.'); return; }
    try {
      await login(email, password);
      navigate('/dashboard/funnel');
    } catch {
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <div
      id="login-page"
      style={{ background: 'var(--bg)', minHeight: '100vh' }}
      className="flex items-center justify-center p-4"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          style={{
            position: 'absolute', top: '-20%', right: '-10%',
            width: '600px', height: '600px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(45,212,191,0.08) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute', bottom: '-10%', left: '-10%',
            width: '500px', height: '500px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(15,118,110,0.06) 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Logo / brand */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-[16px] mb-4"
            style={{ background: 'var(--ink)' }}
          >
            <span style={{ color: '#2DD4BF', fontSize: 24 }}>TB</span>
          </div>
          <h1
            style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text)', fontSize: 28, fontWeight: 700, marginBottom: 6 }}
          >
            TalentBridge Analytics
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: 14 }}>
            Admin portal — team access only
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius)',
            padding: '32px 28px',
            boxShadow: 'var(--shadow)',
          }}
        >
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, fontWeight: 600, marginBottom: 24, color: 'var(--text)' }}>
            Sign in to your account
          </h2>

          {error && (
            <div
              className="animate-fade-in"
              style={{
                background: 'color-mix(in srgb, #EF4444 12%, transparent)',
                border: '1px solid color-mix(in srgb, #EF4444 30%, transparent)',
                borderRadius: 'var(--radius-xs)',
                padding: '10px 14px',
                marginBottom: 20,
                color: '#EF4444',
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ marginBottom: 16 }}>
              <label
                htmlFor="login-email"
                style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: 'var(--text-2)' }}
              >
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@talentbridge.cv"
                className="input"
                disabled={isLoading}
                autoFocus
                autoComplete="email"
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label
                htmlFor="login-password"
                style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: 'var(--text-2)' }}
              >
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input"
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            <button
              id="login-submit"
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '11px 15px', fontSize: 15 }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--faint)', fontSize: 12 }}>
          Access is restricted to TalentBridge team members.
        </p>
      </div>
    </div>
  );
};
