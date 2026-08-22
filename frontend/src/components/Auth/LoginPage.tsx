import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import tblogo from '../../assets/tblogo.svg';
import { useAuth } from '../../context/AuthContext';
import { validateEmail } from '../../utils/formatters';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      style={{ background: 'var(--bg)', minHeight: '100vh', position: 'relative' }}
      className="flex items-center justify-center p-4 selection:bg-teal-500 selection:text-white"
    >
      {/* Ambient Mistral Sunset & Teal Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          style={{
            position: 'absolute',
            top: '-15%',
            right: '-10%',
            width: '650px',
            height: '650px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(250,82,15,0.07) 0%, rgba(255,184,62,0.03) 50%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-15%',
            left: '-10%',
            width: '650px',
            height: '650px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(20,184,166,0.08) 0%, rgba(15,118,110,0.03) 50%, transparent 70%)',
          }}
        />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Logo / Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-3">
            <img
              src={tblogo}
              alt="TalentBridge"
              style={{ height: 36, width: 'auto' }}
            />
          </div>
          <p style={{ color: 'var(--text-2)', fontSize: 13.5, fontWeight: 400 }}>
            Executive Intelligence &amp; Analytics Portal
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius)',
            padding: '34px 30px',
            boxShadow: 'var(--shadow-lg)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top Edge Sunset Stripe */}
          <div className="sunset-stripe absolute top-0 left-0 right-0" style={{ height: 3 }} />

          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>
              Sign in to Portal
            </h2>
            <p style={{ fontSize: 12.5, color: 'var(--dim)', marginTop: 4 }}>
              Enter your corporate credentials or choose a test account below
            </p>
          </div>

          {error && (
            <div
              className="animate-fade-in flex items-center gap-2.5"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: 'var(--radius-xs)',
                padding: '10px 14px',
                marginBottom: 20,
                color: '#EF4444',
                fontSize: 13,
              }}
            >
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ marginBottom: 18 }}>
              <label
                htmlFor="login-email"
                style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7, fontWeight: 600, fontSize: 13, color: 'var(--text-2)' }}
              >
                <Mail size={13.5} color="var(--dim)" />
                Work Email
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
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7, fontWeight: 600, fontSize: 13, color: 'var(--text-2)' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Lock size={13.5} color="var(--dim)" />
                  Password
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  style={{ background: 'none', border: 'none', color: 'var(--dim)', cursor: 'pointer', fontSize: 11.5, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                >
                  {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </label>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
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
              className="btn btn-primary w-full"
              style={{ padding: '11px 16px', fontSize: 14.5, fontWeight: 600, gap: 8 }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  Verifying credentials…
                </>
              ) : (
                <>
                  Sign in to TalentBridge
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Quick Fill RBAC Role Accounts */}
          <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid var(--line)' }}>
            <p style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, fontFamily: 'Sora, sans-serif' }}>
              Quick-Fill Role Access (RBAC)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Super Admin */}
              <button
                type="button"
                onClick={() => {
                  setEmail('maz@talentbridge.cv');
                  setPassword('temp_password_123');
                }}
                className="btn btn-ghost"
                style={{ justifyContent: 'space-between', padding: '8px 10px', fontSize: 11.5, border: '1px solid var(--line)', background: 'var(--panel-2)', textAlign: 'left' }}
              >
                <div>
                  <span style={{ fontWeight: 700, color: 'var(--accent)', display: 'block' }}>👑 Maz (Super Admin)</span>
                  <span style={{ color: 'var(--dim)', fontSize: 10 }}>Full Read/Write</span>
                </div>
                <span style={{ color: 'var(--accent)', fontSize: 11 }}>Fill →</span>
              </button>

              {/* System Admin */}
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@talentbridge.cv');
                  setPassword('password123');
                }}
                className="btn btn-ghost"
                style={{ justifyContent: 'space-between', padding: '8px 10px', fontSize: 11.5, border: '1px solid var(--line)', background: 'var(--panel-2)', textAlign: 'left' }}
              >
                <div>
                  <span style={{ fontWeight: 700, color: 'var(--text)', display: 'block' }}>🛠️ System Admin</span>
                  <span style={{ color: 'var(--dim)', fontSize: 10 }}>Analytics &amp; Config</span>
                </div>
                <span style={{ color: 'var(--accent)', fontSize: 11 }}>Fill →</span>
              </button>

              {/* Data Analyst */}
              <button
                type="button"
                onClick={() => {
                  setEmail('kwame.asante@talentbridge.cv');
                  setPassword('password123');
                }}
                className="btn btn-ghost"
                style={{ justifyContent: 'space-between', padding: '8px 10px', fontSize: 11.5, border: '1px solid var(--line)', background: 'var(--panel-2)', textAlign: 'left' }}
              >
                <div>
                  <span style={{ fontWeight: 700, color: '#3B82F6', display: 'block' }}>📊 Kwame (Analyst)</span>
                  <span style={{ color: 'var(--dim)', fontSize: 10 }}>Analytics &amp; CSV</span>
                </div>
                <span style={{ color: '#3B82F6', fontSize: 11 }}>Fill →</span>
              </button>

              {/* Viewer / Read-Only */}
              <button
                type="button"
                onClick={() => {
                  setEmail('sarah.jenkins@talentbridge.cv');
                  setPassword('password123');
                }}
                className="btn btn-ghost"
                style={{ justifyContent: 'space-between', padding: '8px 10px', fontSize: 11.5, border: '1px solid var(--line)', background: 'var(--panel-2)', textAlign: 'left' }}
              >
                <div>
                  <span style={{ fontWeight: 700, color: '#F59E0B', display: 'block' }}>👁️ Sarah (Viewer)</span>
                  <span style={{ color: 'var(--dim)', fontSize: 10 }}>Read-Only Mode</span>
                </div>
                <span style={{ color: '#F59E0B', fontSize: 11 }}>Fill →</span>
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 22, color: 'var(--dim)', fontSize: 12 }}>
          <ShieldCheck size={14} />
          <span>TalentBridge Executive Intelligence Portal</span>
        </div>
      </div>
    </div>
  );
};
