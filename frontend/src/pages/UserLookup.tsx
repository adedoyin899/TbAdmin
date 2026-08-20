import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '../api/userApi';
import { formatDate, formatDateTime, formatEventName } from '../utils/formatters';
import type { User, UserProfile, UserEvent, EmailEngagement } from '../types';

// ── Search Component ──────────────────────────────────────────

const UserSearch: React.FC<{ onSelect: (userId: string) => void }> = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['users', submitted],
    queryFn: () => userApi.searchUsers(submitted),
    enabled: submitted.length > 0,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(query);
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <input
          id="user-search-input"
          type="text"
          placeholder="Search by email, name, or user ID…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="input"
          style={{ flex: 1, fontSize: 15, padding: '11px 14px' }}
          autoFocus
        />
        <button type="submit" className="btn btn-primary" id="user-search-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          Search
        </button>
      </form>

      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <div className="spinner" />
        </div>
      )}

      {data && data.results.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--dim)' }}>
          No users found for "{submitted}"
        </div>
      )}

      {data && data.results.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 4 }}>
            {data.results.length} result{data.results.length !== 1 ? 's' : ''} found
          </p>
          {data.results.map((user: User) => (
            <button
              key={user.userId}
              id={`user-result-${user.userId}`}
              onClick={() => onSelect(user.userId)}
              style={{
                background: 'var(--panel)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-sm)',
                padding: '14px 18px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s cubic-bezier(0.16,1,0.3,1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)';
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = 'var(--shadow)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--line)';
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', background: 'var(--ink)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <span style={{ color: '#2DD4BF', fontWeight: 700, fontSize: 14 }}>
                    {user.firstName[0]}{user.lastName[0]}
                  </span>
                </div>
                <div>
                  <p style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
                    {user.firstName} {user.lastName}
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--text-2)' }}>{user.email}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ fontSize: 12, color: 'var(--faint)', marginBottom: 4 }}>Signed up {formatDate(user.signupDate)}</p>
                <span className="badge badge-neutral" style={{ fontSize: 11 }}>{user.signupSource}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Profile Component ────────────────────────────────────────

const EVENT_ICONS: Record<string, string> = {
  signup_started: '🚀',
  email_verified: '✅',
  showcase_room_created: '🏗️',
  block_added: '➕',
  room_theme_changed: '🎨',
  showcase_room_published: '📢',
  showcase_room_shared: '🔗',
  user_returned_7d: '🔄',
  user_returned_30d: '🔄',
};

const UserProfileView: React.FC<{ userId: string; onBack: () => void }> = ({ userId, onBack }) => {
  const { data, isLoading } = useQuery<UserProfile>({
    queryKey: ['user', userId],
    queryFn: () => userApi.getUserProfile(userId) as Promise<UserProfile>,
    enabled: !!userId,
  });

  if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>;
  if (!data) return <div style={{ textAlign: 'center', padding: 40, color: 'var(--dim)' }}>User not found.</div>;

  const { user, events, emailEngagement, postHogSessionReplayUrl } = data;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Back */}
      <button
        onClick={onBack}
        className="btn btn-ghost"
        style={{ width: 'fit-content' }}
        id="user-back-btn"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to search
      </button>

      {/* User card */}
      <div
        style={{
          background: 'var(--panel)', border: '1px solid var(--line)',
          borderRadius: 'var(--radius)', padding: '24px 28px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%', background: 'var(--ink)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span style={{ color: '#2DD4BF', fontWeight: 800, fontSize: 18 }}>
                {user.firstName[0]}{user.lastName[0]}
              </span>
            </div>
            <div>
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
                {user.firstName} {user.lastName}
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text-2)' }}>{user.email}</p>
            </div>
          </div>
          <a
            href={postHogSessionReplayUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-dark"
            id="posthog-replay-link"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            View Session Replay
          </a>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { label: 'User ID', value: user.userId, mono: true },
            { label: 'Signed Up', value: formatDate(user.signupDate) },
            { label: 'Country', value: user.country },
            { label: 'Source', value: user.signupSource },
          ].map(field => (
            <div key={field.label}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--faint)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                {field.label}
              </p>
              <p style={{
                fontSize: 13, color: 'var(--text)', fontWeight: 500,
                fontFamily: field.mono ? 'JetBrains Mono, monospace' : undefined,
              }}>
                {field.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, alignItems: 'start' }}>
        {/* Event timeline */}
        <div
          style={{
            background: 'var(--panel)', border: '1px solid var(--line)',
            borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)' }}>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
              Event Timeline
            </h3>
          </div>
          <div style={{ padding: '8px 0' }}>
            {events.map((event: UserEvent, i: number) => (
              <div
                key={event.eventId}
                style={{
                  display: 'flex', gap: 14, padding: '12px 20px',
                  borderLeft: '3px solid transparent',
                  borderBottom: i < events.length - 1 ? '1px solid var(--line)' : 'none',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--panel-2)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ fontSize: 18, flexShrink: 0, marginTop: 2 }}>
                  {EVENT_ICONS[event.eventName] ?? '⚡'}
                </span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 2, fontSize: 14 }}>
                    {formatEventName(event.eventName)}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--faint)' }}>
                    {formatDateTime(event.timestamp)}
                  </p>
                  {Object.keys(event.properties).length > 0 && (
                    <div style={{ marginTop: 6, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {Object.entries(event.properties).map(([k, v]) => (
                        <span key={k} className="badge badge-neutral" style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>
                          {k}: {String(v)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Email engagement */}
        <div
          style={{
            background: 'var(--panel)', border: '1px solid var(--line)',
            borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)' }}>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
              Email Engagement
            </h3>
          </div>
          <div style={{ padding: '8px 0' }}>
            {emailEngagement.map((e: EmailEngagement, i: number) => (
              <div
                key={e.campaignName}
                style={{
                  padding: '14px 20px',
                  borderBottom: i < emailEngagement.length - 1 ? '1px solid var(--line)' : 'none',
                }}
              >
                <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', marginBottom: 6 }}>{e.campaignName}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--faint)' }}>Sent</span>
                    <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{formatDate(e.sent)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--faint)' }}>Opened</span>
                    {e.opened
                      ? <span className="badge badge-success" style={{ fontSize: 11 }}>✓ {formatDate(e.opened)}</span>
                      : <span className="badge badge-neutral" style={{ fontSize: 11 }}>Not opened</span>}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--faint)' }}>Clicked</span>
                    {e.clicked
                      ? <span className="badge badge-success" style={{ fontSize: 11 }}>✓ Clicked link</span>
                      : <span className="badge badge-neutral" style={{ fontSize: 11 }}>No click</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Page ─────────────────────────────────────────────────────

export const UserLookupPage: React.FC = () => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
          User Lookup
        </h2>
        <p style={{ color: 'var(--text-2)', fontSize: 14 }}>
          Search any user by email, name, or ID to see their full journey
        </p>
      </div>

      {selectedUserId
        ? <UserProfileView userId={selectedUserId} onBack={() => setSelectedUserId(null)} />
        : <UserSearch onSelect={setSelectedUserId} />}
    </div>
  );
};
