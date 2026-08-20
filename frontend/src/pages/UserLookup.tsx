import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search, ArrowLeft, ExternalLink, Clock, Mail, Globe,
  Rocket, CheckCircle2, Home, PlusCircle, Megaphone,
  Share2, RefreshCcw, Palette, Repeat, User as UserIcon,
  Zap, ChevronDown, ChevronUp,
} from 'lucide-react';
import { userApi } from '../api/userApi';
import { formatDate, formatDateTime } from '../utils/formatters';
import type { User, UserProfile, UserEvent, EmailEngagement } from '../types';

// ── Event icon map ────────────────────────────────────────────

const EVENT_ICON: Record<string, React.ReactNode> = {
  signup_started:         <Rocket         size={15} color="#2DD4BF" strokeWidth={2} />,
  email_verified:         <CheckCircle2   size={15} color="#10B981" strokeWidth={2} />,
  showcase_room_created:  <Home           size={15} color="#3B82F6" strokeWidth={2} />,
  block_added:            <PlusCircle     size={15} color="#8B5CF6" strokeWidth={2} />,
  room_theme_changed:     <Palette        size={15} color="#F59E0B" strokeWidth={2} />,
  showcase_room_published:<Megaphone      size={15} color="#10B981" strokeWidth={2} />,
  showcase_room_shared:   <Share2         size={15} color="#2DD4BF" strokeWidth={2} />,
  user_returned_7d:       <RefreshCcw     size={15} color="#F59E0B" strokeWidth={2} />,
  user_returned_30d:      <Repeat         size={15} color="#EF4444" strokeWidth={2} />,
};

const EVENT_COLOR: Record<string, string> = {
  signup_started:          '#2DD4BF',
  email_verified:          '#10B981',
  showcase_room_created:   '#3B82F6',
  block_added:             '#8B5CF6',
  room_theme_changed:      '#F59E0B',
  showcase_room_published: '#10B981',
  showcase_room_shared:    '#2DD4BF',
  user_returned_7d:        '#F59E0B',
  user_returned_30d:       '#EF4444',
};

function formatEventLabel(name: string): string {
  return name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// ── User Search ───────────────────────────────────────────────

const COUNTRY_FLAG: Record<string, string> = {
  GB: '🇬🇧', US: '🇺🇸', IT: '🇮🇹', GH: '🇬🇭', IN: '🇮🇳', IE: '🇮🇪',
};

const SOURCE_BADGE_CLASS: Record<string, string> = {
  organic: 'badge-success',
  email:   'badge-info',
  referral:'badge-warning',
  paid_ad: 'badge-error',
};

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
    if (query.trim()) setSubmitted(query.trim());
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      {/* Search bar */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--dim)', pointerEvents: 'none' }}
          />
          <input
            id="user-search-input"
            type="text"
            placeholder="Search by email, name, or user ID…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="input"
            style={{ paddingLeft: 40, fontSize: 15, padding: '11px 14px 11px 40px' }}
            autoFocus
          />
        </div>
        <button type="submit" className="btn btn-primary" id="user-search-btn" style={{ gap: 6 }}>
          <Search size={15} strokeWidth={2} />
          Search
        </button>
      </form>

      {/* Hint */}
      {!submitted && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--dim)' }}>
          <Search size={36} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
          <p style={{ fontSize: 14 }}>Try searching for a name, email or user ID</p>
          <p style={{ fontSize: 12, marginTop: 6, color: 'var(--faint)' }}>e.g. "alice", "bob@example.com", "user_321"</p>
        </div>
      )}

      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <div className="spinner" />
        </div>
      )}

      {data && data.results.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--dim)' }}>
          <UserIcon size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
          <p>No users found for "<strong>{submitted}</strong>"</p>
        </div>
      )}

      {data && data.results.length > 0 && (
        <div className="animate-fade-in">
          <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 12 }}>
            <strong style={{ color: 'var(--accent)' }}>{data.results.length}</strong> result{data.results.length !== 1 ? 's' : ''} found
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(data.results as User[]).map(user => (
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
                  gap: 16,
                  width: '100%',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--line)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Avatar + name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'var(--ink)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, border: '2px solid var(--line)',
                  }}>
                    <span style={{ color: '#2DD4BF', fontWeight: 700, fontSize: 14, fontFamily: 'Sora, sans-serif' }}>
                      {user.firstName[0]}{user.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 3, fontSize: 14 }}>
                      {user.firstName} {user.lastName}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Mail size={12} color="var(--dim)" />
                      <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{user.email}</span>
                    </div>
                  </div>
                </div>

                {/* Meta */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <span style={{ fontSize: 18 }} title={user.country}>
                    {COUNTRY_FLAG[(user as User & { countryCode?: string }).countryCode ?? ''] ?? '🌍'}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} color="var(--dim)" />
                    <span style={{ fontSize: 12, color: 'var(--faint)' }}>{formatDate(user.signupDate)}</span>
                  </div>
                  <span className={`badge ${SOURCE_BADGE_CLASS[user.signupSource] ?? 'badge-neutral'}`} style={{ fontSize: 11 }}>
                    {user.signupSource}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── User Profile ──────────────────────────────────────────────

const EventTimeline: React.FC<{ events: UserEvent[] }> = ({ events }) => {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? events : events.slice(0, 6);

  return (
    <div>
      <div style={{ padding: '8px 0' }}>
        {visible.map((event, i) => {
          const color = EVENT_COLOR[event.eventName] ?? '#7C8A96';
          return (
            <div
              key={event.eventId}
              style={{
                display: 'flex',
                gap: 14,
                padding: '12px 20px',
                borderBottom: i < visible.length - 1 ? '1px solid var(--line)' : 'none',
                transition: 'background 0.12s',
                position: 'relative',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--panel-2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {/* Timeline dot */}
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: `color-mix(in srgb, ${color} 14%, transparent)`,
                border: `1.5px solid color-mix(in srgb, ${color} 35%, transparent)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginTop: 2,
              }}>
                {EVENT_ICON[event.eventName] ?? <Zap size={14} color={color} strokeWidth={2} />}
              </div>

              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 3, fontSize: 14 }}>
                  {formatEventLabel(event.eventName)}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: Object.keys(event.properties).length > 0 ? 6 : 0 }}>
                  <Clock size={11} color="var(--faint)" />
                  <span style={{ fontSize: 12, color: 'var(--faint)' }}>{formatDateTime(event.timestamp)}</span>
                </div>
                {Object.keys(event.properties).length > 0 && (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {Object.entries(event.properties).map(([k, v]) => (
                      <span key={k} className="badge badge-neutral"
                        style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>
                        {k}: {String(v)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {events.length > 6 && (
        <button
          onClick={() => setExpanded(e => !e)}
          style={{
            width: '100%', padding: '10px', border: 'none',
            background: 'var(--panel-2)', color: 'var(--text-2)',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 6, fontSize: 13, fontWeight: 600,
            transition: 'background 0.12s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--line)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--panel-2)')}
        >
          {expanded ? <><ChevronUp size={14} /> Show less</> : <><ChevronDown size={14} /> Show {events.length - 6} more events</>}
        </button>
      )}
    </div>
  );
};

const UserProfileView: React.FC<{ userId: string; onBack: () => void }> = ({ userId, onBack }) => {
  const { data, isLoading } = useQuery<UserProfile>({
    queryKey: ['user', userId],
    queryFn: () => userApi.getUserProfile(userId) as Promise<UserProfile>,
    enabled: !!userId,
  });

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>;
  }
  if (!data) {
    return <div style={{ textAlign: 'center', padding: 40, color: 'var(--dim)' }}>User not found.</div>;
  }

  const { user, events, emailEngagement, postHogSessionReplayUrl } = data;
  const extUser = user as User & { countryCode?: string; roomsCreated?: number; roomsPublished?: number; totalEvents?: number };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Back */}
      <button onClick={onBack} className="btn btn-ghost" style={{ width: 'fit-content', gap: 6 }} id="user-back-btn">
        <ArrowLeft size={15} strokeWidth={1.8} />
        Back to search
      </button>

      {/* User hero card */}
      <div style={{
        background: 'var(--panel)', border: '1px solid var(--line)',
        borderRadius: 'var(--radius)', padding: '24px 28px', boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
          {/* Avatar + name + email */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', background: 'var(--ink)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '3px solid var(--line)', flexShrink: 0,
            }}>
              <span style={{ color: '#2DD4BF', fontWeight: 800, fontSize: 20, fontFamily: 'Sora, sans-serif' }}>
                {user.firstName[0]}{user.lastName[0]}
              </span>
            </div>
            <div>
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 5 }}>
                {user.firstName} {user.lastName}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Mail size={13} color="var(--text-2)" />
                <span style={{ fontSize: 14, color: 'var(--text-2)' }}>{user.email}</span>
                <span className={`badge ${SOURCE_BADGE_CLASS[user.signupSource] ?? 'badge-neutral'}`} style={{ fontSize: 11 }}>
                  {user.signupSource}
                </span>
              </div>
            </div>
          </div>

          {/* Session replay link */}
          <a
            href={postHogSessionReplayUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-dark"
            id="posthog-replay-link"
            style={{ gap: 7 }}
          >
            <ExternalLink size={14} strokeWidth={2} />
            View Session Replay
          </a>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
          {[
            { label: 'User ID', value: user.userId, icon: <UserIcon size={13} color="var(--dim)" />, mono: true },
            { label: 'Country', value: `${COUNTRY_FLAG[extUser.countryCode ?? ''] ?? '🌍'} ${user.country}`, icon: <Globe size={13} color="var(--dim)" /> },
            { label: 'Signed Up', value: formatDate(user.signupDate), icon: <Clock size={13} color="var(--dim)" /> },
            { label: 'Last Active', value: formatDate(user.lastActive), icon: <Clock size={13} color="var(--dim)" /> },
            { label: 'Rooms Created', value: String(extUser.roomsCreated ?? '—'), icon: <Home size={13} color="var(--dim)" /> },
            { label: 'Rooms Published', value: String(extUser.roomsPublished ?? '—'), icon: <Megaphone size={13} color="var(--dim)" /> },
          ].map(field => (
            <div key={field.label} style={{ padding: '12px 14px', background: 'var(--panel-2)', borderRadius: 10, border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                {field.icon}
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--faint)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {field.label}
                </p>
              </div>
              <p style={{
                color: 'var(--text)',
                fontWeight: 600,
                fontFamily: field.mono ? 'JetBrains Mono, monospace' : undefined,
                fontSize: field.mono ? 11 : 13,
              }}>
                {field.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline + Email side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, alignItems: 'start' }}>

        {/* Event timeline */}
        <div style={{
          background: 'var(--panel)', border: '1px solid var(--line)',
          borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
              Event Timeline
            </h3>
            <span className="badge badge-neutral" style={{ fontSize: 11 }}>
              {events.length} events
            </span>
          </div>
          <EventTimeline events={events as UserEvent[]} />
        </div>

        {/* Email engagement */}
        <div style={{
          background: 'var(--panel)', border: '1px solid var(--line)',
          borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Mail size={15} color="var(--text-2)" />
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
              Email Engagement
            </h3>
          </div>
          <div style={{ padding: '8px 0' }}>
            {(emailEngagement as EmailEngagement[]).map((e, i) => (
              <div
                key={e.campaignName}
                style={{
                  padding: '14px 20px',
                  borderBottom: i < emailEngagement.length - 1 ? '1px solid var(--line)' : 'none',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={ev => (ev.currentTarget.style.background = 'var(--panel-2)')}
                onMouseLeave={ev => (ev.currentTarget.style.background = 'transparent')}
              >
                <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', marginBottom: 8 }}>{e.campaignName}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Clock size={11} color="var(--faint)" />
                      <span style={{ fontSize: 12, color: 'var(--faint)' }}>Sent</span>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{formatDate(e.sent)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Mail size={11} color="var(--faint)" />
                      <span style={{ fontSize: 12, color: 'var(--faint)' }}>Opened</span>
                    </div>
                    {e.opened
                      ? <span className="badge badge-success" style={{ fontSize: 11 }}>✓ {formatDate(e.opened)}</span>
                      : <span className="badge badge-neutral" style={{ fontSize: 11 }}>Not opened</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <ExternalLink size={11} color="var(--faint)" />
                      <span style={{ fontSize: 12, color: 'var(--faint)' }}>Clicked</span>
                    </div>
                    {e.clicked
                      ? <span className="badge badge-success" style={{ fontSize: 11 }}>✓ Clicked</span>
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
          Search any user by email, name, or user ID to see their full journey
        </p>
      </div>

      {selectedUserId
        ? <UserProfileView userId={selectedUserId} onBack={() => setSelectedUserId(null)} />
        : <UserSearch onSelect={setSelectedUserId} />}
    </div>
  );
};
