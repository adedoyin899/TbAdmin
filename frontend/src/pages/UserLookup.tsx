import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Search, ArrowLeft, ExternalLink, Clock, Mail, Globe,
  Rocket, CheckCircle2, Home, PlusCircle, Megaphone,
  Share2, RefreshCcw, Palette, Repeat, User as UserIcon,
  Zap, ChevronDown, ChevronUp, Sparkles, Filter,
  ArrowRight, Users, UserCheck, UserPlus, ArrowUpRight, Download,
} from 'lucide-react';
import { userApi } from '../api/userApi';
import { formatDate, formatDateTime, formatNumber } from '../utils/formatters';
import type { User, UserProfile, UserEvent, EmailEngagement } from '../types';
import { RoomInsightsDetailView } from '../components/Rooms/RoomInsightsDetailView';
import { DateRangeSelector, type DateRangeValue } from '../components/Common/DateRangeSelector';
import { exportToCsv } from '../utils/exportCsv';

// ── Event Icon & Color Config ─────────────────────────────────

const EVENT_ICON: Record<string, React.ReactNode> = {
  signup_started:          <Rocket       size={15} color="#2DD4BF" strokeWidth={2} />,
  email_verified:          <CheckCircle2 size={15} color="#10B981" strokeWidth={2} />,
  showcase_room_created:   <Home         size={15} color="#3B82F6" strokeWidth={2} />,
  block_added:             <PlusCircle   size={15} color="#8B5CF6" strokeWidth={2} />,
  room_theme_changed:      <Palette      size={15} color="#F59E0B" strokeWidth={2} />,
  showcase_room_published: <Megaphone    size={15} color="#10B981" strokeWidth={2} />,
  showcase_room_shared:    <Share2       size={15} color="#2DD4BF" strokeWidth={2} />,
  user_returned_7d:        <RefreshCcw   size={15} color="#F59E0B" strokeWidth={2} />,
  user_returned_30d:       <Repeat       size={15} color="#EF4444" strokeWidth={2} />,
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

const COUNTRY_FLAG: Record<string, string> = {
  GB: '🇬🇧', US: '🇺🇸', IT: '🇮🇹', GH: '🇬🇭', IN: '🇮🇳', IE: '🇮🇪', AU: '🇦🇺', ES: '🇪🇸', MX: '🇲🇽', PL: '🇵🇱', FR: '🇫🇷',
};

const SOURCE_BADGE_CLASS: Record<string, string> = {
  organic: 'badge-success',
  email:   'badge-info',
  referral:'badge-warning',
  paid_ad: 'badge-error',
};

// ── User Signups Trend Mock Data ──────────────────────────────
const USER_SIGNUP_TREND = [
  { month: 'Jan', totalUsers: 1420, verifiedUsers: 1180 },
  { month: 'Feb', totalUsers: 2150, verifiedUsers: 1890 },
  { month: 'Mar', totalUsers: 1880, verifiedUsers: 1620 },
  { month: 'Apr', totalUsers: 1350, verifiedUsers: 1140 },
  { month: 'May', totalUsers: 2640, verifiedUsers: 2310 },
  { month: 'Jun', totalUsers: 3010, verifiedUsers: 2670 },
];

const USER_SOURCES_BREAKDOWN = [
  { name: 'Organic Search & Social', count: '5,602', percentage: 45 },
  { name: 'Email Campaigns', count: '2,739', percentage: 22 },
  { name: 'Creator Referrals', count: '2,241', percentage: 18 },
  { name: 'Paid Ads', count: '1,868', percentage: 15 },
];

const USER_GEO_BREAKDOWN = [
  { country: 'United States', code: 'US', flag: '🇺🇸', users: 4820, percentage: 38.7 },
  { country: 'United Kingdom', code: 'GB', flag: '🇬🇧', users: 3110, percentage: 25.0 },
  { country: 'Italy', code: 'IT', flag: '🇮🇹', users: 1420, percentage: 11.4 },
  { country: 'Ghana', code: 'GH', flag: '🇬🇭', users: 1180, percentage: 9.5 },
  { country: 'India', code: 'IN', flag: '🇮🇳', users: 1050, percentage: 8.4 },
  { country: 'Ireland', code: 'IE', flag: '🇮🇪', users: 870, percentage: 7.0 },
];

// ── User Overview Section (Main Page) ─────────────────────────

const GeneralUserOverviewSection: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRangeValue>({ preset: '30d' });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Date filter bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
            User Base Overview
          </h3>
          <p style={{ color: 'var(--text-2)', fontSize: 12 }}>Systemic user growth, account verification, and engagement status</p>
        </div>
        <DateRangeSelector
          value={dateRange}
          onChange={setDateRange}
          idPrefix="directory-overview-date"
        />
      </div>

      {/* 4 User KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600 }}>Total Registered Users</span>
            <span className="badge badge-success" style={{ gap: 2, fontSize: 11 }}>
              <ArrowUpRight size={11} /> +8.4%
            </span>
          </div>
          <p style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)', fontFamily: 'Sora, sans-serif' }}>
            12,450
          </p>
          <p style={{ fontSize: 11, color: 'var(--faint)', marginTop: 4 }}>+960 registered accounts this month</p>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600 }}>Active Users (30d)</span>
            <span className="badge badge-info" style={{ gap: 2, fontSize: 11 }}>
              <UserCheck size={11} /> 71.6%
            </span>
          </div>
          <p style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)', fontFamily: 'Sora, sans-serif' }}>
            8,920
          </p>
          <p style={{ fontSize: 11, color: 'var(--faint)', marginTop: 4 }}>Logged in within last 30 days</p>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600 }}>Verified Accounts</span>
            <span className="badge badge-success" style={{ gap: 2, fontSize: 11 }}>
              <CheckCircle2 size={11} /> 86.8%
            </span>
          </div>
          <p style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)', fontFamily: 'Sora, sans-serif' }}>
            10,810
          </p>
          <p style={{ fontSize: 11, color: 'var(--faint)', marginTop: 4 }}>Completed email verification</p>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600 }}>New Signups</span>
            <span className="badge badge-warning" style={{ gap: 2, fontSize: 11 }}>
              <UserPlus size={11} /> +16%
            </span>
          </div>
          <p style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)', fontFamily: 'Sora, sans-serif' }}>
            1,247
          </p>
          <p style={{ fontSize: 11, color: 'var(--faint)', marginTop: 4 }}>In selected time horizon</p>
        </div>
      </div>

      {/* User Growth & Signups Trend */}
      <div className="chart-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
              User Signups Trend
            </h3>
            <p style={{ color: 'var(--text-2)', fontSize: 12 }}>Monthly growth comparing Total Signups vs Verified Accounts</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#FB923C' }} />
              <span style={{ color: 'var(--text-2)' }}>Total Signups</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#2DD4BF' }} />
              <span style={{ color: 'var(--text-2)' }}>Verified Users</span>
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={USER_SIGNUP_TREND} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="userSignupsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FB923C" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#FB923C" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="userVerifiedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2DD4BF" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#2DD4BF" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(229,234,239,0.3)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: 'var(--text-2)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text-2)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 10 }}
              labelStyle={{ fontWeight: 700, color: 'var(--text)', fontFamily: 'Sora' }}
            />
            <Area type="monotone" dataKey="totalUsers" stroke="#FB923C" strokeWidth={2.5} fillOpacity={1} fill="url(#userSignupsGrad)" name="Total Signups" />
            <Area type="monotone" dataKey="verifiedUsers" stroke="#2DD4BF" strokeWidth={2.5} fillOpacity={1} fill="url(#userVerifiedGrad)" name="Verified Users" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* User Acquisition Sources & Geographic Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Acquisition Sources */}
        <div className="card" style={{ padding: '20px 24px' }}>
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
            User Acquisition Sources
          </h3>
          <p style={{ color: 'var(--text-2)', fontSize: 12, marginBottom: 18 }}>Where registered users join TalentBridge from</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {USER_SOURCES_BREAKDOWN.map(s => (
              <div key={s.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                  <span style={{ color: 'var(--text-2)', fontWeight: 500 }}>{s.name}</span>
                  <span style={{ color: 'var(--text)', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{s.count} users ({s.percentage}%)</span>
                </div>
                <div style={{ height: 14, background: 'var(--panel-2)', borderRadius: 4, overflow: 'hidden', border: '1px solid var(--line)' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${s.percentage}%`,
                      background: 'linear-gradient(90deg, #2DD4BF, #0D9488)',
                      borderRadius: 3,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Geo Distribution */}
        <div className="card" style={{ padding: '20px 24px' }}>
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
            User Distribution by Country
          </h3>
          <p style={{ color: 'var(--text-2)', fontSize: 12, marginBottom: 18 }}>Top geographic regions for registered users</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {USER_GEO_BREAKDOWN.map(g => (
              <div key={g.code}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, marginBottom: 3 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14 }}>{g.flag}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>{g.country}</span>
                  </div>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-2)' }}>
                    {formatNumber(g.users)} ({g.percentage}%)
                  </span>
                </div>
                <div style={{ height: 6, background: 'var(--line)', borderRadius: 99, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${g.percentage * 2}%`,
                      background: 'var(--ink)',
                      borderRadius: 99,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Event Timeline Sub-component ──────────────────────────────

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
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: `color-mix(in srgb, ${color} 14%, transparent)`,
                border: `1.5px solid color-mix(in srgb, ${color} 35%, transparent)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginTop: 2,
              }}>
                {EVENT_ICON[event.eventName] ?? <Zap size={14} color={color} strokeWidth={2} />}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
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

// ── Granular User Profile View (Specific User Deep Dive) ───────

const GranularUserProfileView: React.FC<{ userId: string; onBack: () => void }> = ({ userId, onBack }) => {
  const [activeTab, setActiveTab] = useState<'rooms' | 'timeline'>('rooms');
  const [selectedRoomIdx, setSelectedRoomIdx] = useState(0);

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

  const { user, events, emailEngagement, roomInsights = [], postHogSessionReplayUrl } = data;
  const extUser = user as User & { countryCode?: string; roomsCreated?: number; roomsPublished?: number; totalEvents?: number };
  const currentRoom = roomInsights[selectedRoomIdx] || roomInsights[0];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Back button */}
      <div>
        <button
          onClick={onBack}
          className="btn btn-ghost"
          style={{ width: 'fit-content', gap: 6, padding: '8px 14px' }}
          id="user-back-btn"
        >
          <ArrowLeft size={15} strokeWidth={2} />
          Back to User Directory
        </button>
      </div>

      {/* User Hero Card */}
      <div style={{
        background: 'var(--panel)', border: '1px solid var(--line)',
        borderRadius: 'var(--radius)', padding: '20px 24px', boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
          {/* Avatar + name + email */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%', background: 'var(--ink)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2.5px solid var(--line)', flexShrink: 0,
            }}>
              <span style={{ color: '#2DD4BF', fontWeight: 800, fontSize: 18, fontFamily: 'Sora, sans-serif' }}>
                {user.firstName[0]}{user.lastName[0]}
              </span>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 19, fontWeight: 700, color: 'var(--text)' }}>
                  {user.firstName} {user.lastName}
                </h3>
                <span className={`badge ${SOURCE_BADGE_CLASS[user.signupSource] ?? 'badge-neutral'}`} style={{ fontSize: 11 }}>
                  {user.signupSource}
                </span>
                <span className="badge badge-neutral" style={{ fontSize: 11 }}>Plan: {user.planTier}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Mail size={13} color="var(--text-2)" />
                <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{user.email}</span>
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
            style={{ gap: 7, fontSize: 13 }}
          >
            <ExternalLink size={14} strokeWidth={2} />
            View Session Replay
          </a>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'User ID', value: user.userId, icon: <UserIcon size={12} color="var(--dim)" />, mono: true },
            { label: 'Country', value: `${COUNTRY_FLAG[extUser.countryCode ?? ''] ?? '🌍'} ${user.country}`, icon: <Globe size={12} color="var(--dim)" /> },
            { label: 'Signed Up', value: formatDate(user.signupDate), icon: <Clock size={12} color="var(--dim)" /> },
            { label: 'Last Active', value: formatDate(user.lastActive), icon: <Clock size={12} color="var(--dim)" /> },
            { label: 'Rooms Created', value: String(extUser.roomsCreated ?? '—'), icon: <Home size={12} color="var(--dim)" /> },
            { label: 'Rooms Published', value: String(extUser.roomsPublished ?? '—'), icon: <Megaphone size={12} color="var(--dim)" /> },
          ].map(field => (
            <div key={field.label} style={{ padding: '10px 12px', background: 'var(--panel-2)', borderRadius: 10, border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                {field.icon}
                <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--faint)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {field.label}
                </p>
              </div>
              <p style={{
                color: 'var(--text)',
                fontWeight: 600,
                fontFamily: field.mono ? 'JetBrains Mono, monospace' : undefined,
                fontSize: field.mono ? 11 : 13,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {field.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Sub-Navigation Tabs ───────────────────────────────── */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--line)', paddingBottom: 8, overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('rooms')}
          className="btn"
          style={{
            background: activeTab === 'rooms' ? 'var(--ink)' : 'transparent',
            color: activeTab === 'rooms' ? '#FFFFFF' : 'var(--text-2)',
            border: activeTab === 'rooms' ? 'none' : '1px solid var(--line)',
            fontSize: 13,
            padding: '8px 16px',
            gap: 6,
          }}
        >
          <Sparkles size={14} color={activeTab === 'rooms' ? '#2DD4BF' : undefined} />
          Showcase Rooms & Specific Insights
          <span className="badge badge-success" style={{ fontSize: 10 }}>{roomInsights.length} rooms</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className="btn"
          style={{
            background: activeTab === 'timeline' ? 'var(--ink)' : 'transparent',
            color: activeTab === 'timeline' ? '#FFFFFF' : 'var(--text-2)',
            border: activeTab === 'timeline' ? 'none' : '1px solid var(--line)',
            fontSize: 13,
            padding: '8px 16px',
            gap: 6,
          }}
        >
          <Clock size={14} />
          Activity & Timeline
          <span className="badge badge-neutral" style={{ fontSize: 10 }}>{events.length}</span>
        </button>
      </div>

      {/* ── Tab Content ──────────────────────────────────────── */}
      {activeTab === 'rooms' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {roomInsights.length === 0 ? (
            <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--dim)' }}>
              <Home size={36} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
              <h4 style={{ fontFamily: 'Sora', fontSize: 16, color: 'var(--text)', marginBottom: 4 }}>No showcase rooms created yet</h4>
              <p style={{ fontSize: 13 }}>This user has not created or published any showcase rooms yet.</p>
            </div>
          ) : (
            <>
              {/* Room selector if user has multiple rooms */}
              {roomInsights.length > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--panel)', padding: '10px 16px', borderRadius: 12, border: '1px solid var(--line)', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 600 }}>Select Showcase Room:</span>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {roomInsights.map((r, idx) => (
                      <button
                        key={r.roomId}
                        onClick={() => setSelectedRoomIdx(idx)}
                        className="btn"
                        style={{
                          background: selectedRoomIdx === idx ? 'var(--ink)' : 'var(--panel-2)',
                          color: selectedRoomIdx === idx ? '#2DD4BF' : 'var(--text-2)',
                          border: '1px solid var(--line)',
                          padding: '6px 12px',
                          fontSize: 12,
                        }}
                      >
                        {r.roomName} {r.isPublished ? '●' : '○'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Granular Room Insights detail view for the chosen room */}
              {currentRoom && <RoomInsightsDetailView room={currentRoom} />}
            </>
          )}
        </div>
      ) : (
        /* Timeline + Email side by side */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }} className="lg:grid-cols-[1fr_360px]">
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
      )}
    </div>
  );
};

// ── Main User Directory Page ──────────────────────────────────

export const UserLookupPage: React.FC = () => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchSubmitted, setSearchSubmitted] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');

  const { data: usersData, isLoading: usersLoading, isFetching } = useQuery({
    queryKey: ['allUsers', searchSubmitted],
    queryFn: () => userApi.searchUsers(searchSubmitted),
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchSubmitted(searchInput.trim());
  };

  const filteredUsers = (usersData?.results as User[] | undefined)?.filter(u => {
    return sourceFilter === 'all' || u.signupSource === sourceFilter;
  }) || [];

  if (selectedUserId) {
    return (
      <GranularUserProfileView
        userId={selectedUserId}
        onBack={() => setSelectedUserId(null)}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }} className="animate-fade-in">
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>
              User Directory
            </h2>
            <span className="badge badge-success" style={{ gap: 4 }}>
              <Users size={11} /> Overview
            </span>
          </div>
          <p style={{ color: 'var(--text-2)', fontSize: 14 }}>
            Search, manage, and inspect granular activity and profiles for all registered users
          </p>
        </div>

        {/* Prominent Search Bar with Search Button in Header */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 8, width: '100%', maxWidth: 440 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={15}
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--dim)', pointerEvents: 'none' }}
            />
            <input
              id="user-search-input"
              type="text"
              placeholder="Search by name, email, or user ID…"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="input"
              style={{ paddingLeft: 36, fontSize: 13, height: 38 }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0 16px', gap: 6, height: 38, fontSize: 13 }} id="user-search-btn">
            <Search size={14} /> Search
          </button>
        </form>
      </div>

      {/* ── Section 1: User Overview Metrics & Growth ─────────────── */}
      <GeneralUserOverviewSection />

      {/* ── Section 2: All Registered Users Directory Table ───────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
              Registered Users List
            </h3>
            <p style={{ color: 'var(--text-2)', fontSize: 13 }}>
              Click on any user row to drill down into their complete granular details, timeline, and rooms
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Filter size={14} color="var(--dim)" />
            <select
              className="input"
              style={{ width: 160, height: 36, fontSize: 13 }}
              value={sourceFilter}
              onChange={e => setSourceFilter(e.target.value)}
            >
              <option value="all">All Signup Sources</option>
              <option value="organic">Organic</option>
              <option value="email">Email</option>
              <option value="referral">Referral</option>
              <option value="paid_ad">Paid Ad</option>
            </select>

            <button
              onClick={() => {
                if (!filteredUsers.length) return;
                exportToCsv({
                  filename: `talentbridge_users_${sourceFilter}`,
                  columns: [
                    { header: 'User ID', accessor: u => u.userId },
                    { header: 'Full Name', accessor: u => `${u.firstName} ${u.lastName}` },
                    { header: 'Email', accessor: u => u.email },
                    { header: 'Country', accessor: u => u.country },
                    { header: 'Signup Source', accessor: u => u.signupSource },
                    { header: 'Plan Tier', accessor: u => u.planTier },
                    { header: 'Signup Date', accessor: u => u.signupDate },
                    { header: 'Last Active', accessor: u => u.lastActive },
                  ],
                  data: filteredUsers,
                });
              }}
              disabled={!filteredUsers.length}
              className="btn btn-ghost"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                padding: '7px 12px',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-xs)',
                cursor: filteredUsers.length ? 'pointer' : 'not-allowed',
                height: 36,
              }}
              title="Export Users to CSV"
            >
              <Download size={14} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="table-wrap">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>
                User Records
              </span>
              {isFetching && <div className="spinner" style={{ width: 12, height: 12 }} />}
            </div>
            <span className="badge badge-neutral" style={{ fontSize: 11 }}>
              {filteredUsers.length} users found
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Country</th>
                  <th>Signup Source</th>
                  <th>Plan Tier</th>
                  <th>Activity</th>
                  <th>Joined Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {usersLoading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: 40 }}>
                      <div className="spinner" style={{ margin: '0 auto' }} />
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: 30, color: 'var(--dim)' }}>
                      No users match your query. Try searching another term or resetting filters.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => {
                    const ext = user as User & { countryCode?: string; totalEvents?: number };
                    return (
                      <tr
                        key={user.userId}
                        onClick={() => setSelectedUserId(user.userId)}
                        style={{ cursor: 'pointer' }}
                        title="Click to view granular details"
                      >
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 34, height: 34, borderRadius: '50%', background: 'var(--ink)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                              <span style={{ color: '#2DD4BF', fontWeight: 700, fontSize: 12, fontFamily: 'Sora, sans-serif' }}>
                                {user.firstName[0]}{user.lastName[0]}
                              </span>
                            </div>
                            <div>
                              <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: 14, marginBottom: 2 }}>
                                {user.firstName} {user.lastName}
                              </p>
                              <p style={{ fontSize: 12, color: 'var(--text-2)' }}>{user.email}</p>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 16 }}>{COUNTRY_FLAG[ext.countryCode ?? ''] ?? '🌍'}</span>
                            <span style={{ fontSize: 13, color: 'var(--text)' }}>{user.country}</span>
                          </div>
                        </td>

                        <td>
                          <span className={`badge ${SOURCE_BADGE_CLASS[user.signupSource] ?? 'badge-neutral'}`}>
                            {user.signupSource}
                          </span>
                        </td>

                        <td>
                          <span className="badge badge-neutral" style={{ fontSize: 11, textTransform: 'capitalize' }}>
                            {user.planTier}
                          </span>
                        </td>

                        <td>
                          <span className="badge badge-neutral" style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>
                            {ext.totalEvents ?? 0} events
                          </span>
                        </td>

                        <td style={{ fontSize: 13, color: 'var(--text-2)' }}>
                          {formatDate(user.signupDate)}
                        </td>

                        <td>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              setSelectedUserId(user.userId);
                            }}
                            className="btn btn-ghost"
                            style={{ padding: '5px 10px', fontSize: 12, gap: 5, color: 'var(--accent2)' }}
                          >
                            Granular Profile <ArrowRight size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
