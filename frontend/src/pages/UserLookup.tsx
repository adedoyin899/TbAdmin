import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Search, ArrowLeft, ExternalLink, Clock, Mail, Globe,
  Rocket, CheckCircle2, Home, PlusCircle, Megaphone,
  Share2, RefreshCcw, Repeat, User as UserIcon,
  Zap, ChevronDown, ChevronUp, Sparkles, Filter,
  ArrowRight, Users, UserCheck, UserPlus, ArrowUpRight, Download,
} from 'lucide-react';
import { userApi } from '../api/userApi';
import { formatDate, formatDateTime, formatNumber } from '../utils/formatters';
import type { User, UserProfile, UserEvent, EmailEngagement } from '../types';
import { RoomInsightsDetailView } from '../components/Rooms/RoomInsightsDetailView';
import { DateRangeSelector, type DateRangeValue } from '../components/Common/DateRangeSelector';
import { exportToCsv } from '../utils/exportCsv';
import { useRbac } from '../utils/rbac';

// ── Event Icon & Color Config ─────────────────────────────────

const EVENT_ICON: Record<string, React.ReactNode> = {
  signup_started:          <Rocket       size={15} color="var(--accent)" strokeWidth={2} />,
  email_verified:          <CheckCircle2 size={15} color="var(--success)" strokeWidth={2} />,
  showcase_room_created:   <Home         size={15} color="#3B82F6" strokeWidth={2} />,
  block_added:             <PlusCircle   size={15} color="#8B5CF6" strokeWidth={2} />,
  room_theme_changed:      <RefreshCcw   size={15} color="var(--sunset)" strokeWidth={2} />,
  showcase_room_published: <Megaphone    size={15} color="var(--success)" strokeWidth={2} />,
  showcase_room_shared:    <Share2       size={15} color="var(--accent)" strokeWidth={2} />,
  user_returned_7d:        <RefreshCcw   size={15} color="var(--sunset)" strokeWidth={2} />,
  user_returned_30d:       <Repeat       size={15} color="#EF4444" strokeWidth={2} />,
};

const EVENT_COLOR: Record<string, string> = {
  signup_started:          'var(--accent)',
  email_verified:          '#10B981',
  showcase_room_created:   '#3B82F6',
  block_added:             '#8B5CF6',
  room_theme_changed:      '#FA520F',
  showcase_room_published: '#10B981',
  showcase_room_shared:    'var(--accent)',
  user_returned_7d:        '#FA520F',
  user_returned_30d:       '#EF4444',
};

function formatEventLabel(name: string): string {
  return name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

const COUNTRY_FLAG: Record<string, string> = {
  GB: '🇬🇧', US: '🇺🇸', IT: '🇮🇹', GH: '🇬🇭', IN: '🇮🇳', IE: '🇮🇪', AU: '🇦🇺', ES: '🇪🇸', MX: '🇲🇽', PL: '🇵🇱', FR: '🇫🇷',
};

const SOURCE_BADGE_CLASS: Record<string, string> = {
  organic: 'badge-teal',
  email:   'badge-info',
  referral:'badge-sunset',
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
          <p style={{ color: 'var(--text-2)', fontSize: 12.5 }}>Systemic user growth, account verification, and engagement status</p>
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
            <span style={{ fontSize: 11.5, color: 'var(--dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Sora, sans-serif' }}>Total Registered Users</span>
            <span className="badge badge-success" style={{ gap: 2, fontSize: 11 }}>
              <ArrowUpRight size={11} /> +8.4%
            </span>
          </div>
          <p className="mono-metric" style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)' }}>
            12,450
          </p>
          <p style={{ fontSize: 11.5, color: 'var(--text-2)', marginTop: 4 }}>+960 registered accounts this month</p>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11.5, color: 'var(--dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Sora, sans-serif' }}>Active Users (30d)</span>
            <span className="badge badge-teal" style={{ gap: 2, fontSize: 11 }}>
              <UserCheck size={11} /> 71.6%
            </span>
          </div>
          <p className="mono-metric" style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)' }}>
            8,920
          </p>
          <p style={{ fontSize: 11.5, color: 'var(--text-2)', marginTop: 4 }}>Logged in within last 30 days</p>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11.5, color: 'var(--dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Sora, sans-serif' }}>Verified Accounts</span>
            <span className="badge badge-success" style={{ gap: 2, fontSize: 11 }}>
              <CheckCircle2 size={11} /> 86.8%
            </span>
          </div>
          <p className="mono-metric" style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)' }}>
            10,810
          </p>
          <p style={{ fontSize: 11.5, color: 'var(--text-2)', marginTop: 4 }}>Completed email verification</p>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11.5, color: 'var(--dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Sora, sans-serif' }}>New Signups</span>
            <span className="badge badge-sunset" style={{ gap: 2, fontSize: 11 }}>
              <UserPlus size={11} /> +16%
            </span>
          </div>
          <p className="mono-metric" style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)' }}>
            1,247
          </p>
          <p style={{ fontSize: 11.5, color: 'var(--text-2)', marginTop: 4 }}>In selected time horizon</p>
        </div>
      </div>

      {/* User Growth & Signups Trend */}
      <div className="card-mistral">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
              User Registration Trajectory
            </h3>
            <p style={{ color: 'var(--text-2)', fontSize: 12.5 }}>Monthly growth comparing Total Signups vs Verified Accounts</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#FA520F' }} />
              <span style={{ color: 'var(--text-2)' }}>Total Signups</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#0D9488' }} />
              <span style={{ color: 'var(--text-2)' }}>Verified Users</span>
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={USER_SIGNUP_TREND} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="userSignupsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FA520F" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#FA520F" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="userVerifiedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0D9488" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} opacity={0.6} />
            <XAxis dataKey="month" tick={{ fill: 'var(--text-2)', fontSize: 11.5 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--dim)', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 12, boxShadow: 'var(--shadow-lg)' }}
              labelStyle={{ fontWeight: 700, color: 'var(--text)', fontFamily: 'Sora' }}
            />
            <Area type="monotone" dataKey="totalUsers" stroke="#FA520F" strokeWidth={2.5} fillOpacity={1} fill="url(#userSignupsGrad)" name="Total Signups" />
            <Area type="monotone" dataKey="verifiedUsers" stroke="#0D9488" strokeWidth={2.5} fillOpacity={1} fill="url(#userVerifiedGrad)" name="Verified Users" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* User Acquisition Sources & Geographic Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Acquisition Sources */}
        <div className="card-mistral" style={{ padding: '20px 22px' }}>
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
            Acquisition Channels
          </h3>
          <p style={{ color: 'var(--text-2)', fontSize: 12.5, marginBottom: 18 }}>Where registered creators originate from</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {USER_SOURCES_BREAKDOWN.map(s => (
              <div key={s.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 5 }}>
                  <span style={{ color: 'var(--text)', fontWeight: 500 }}>{s.name}</span>
                  <span className="mono-metric" style={{ color: 'var(--text)', fontWeight: 600 }}>{s.count} ({s.percentage}%)</span>
                </div>
                <div style={{ height: 12, background: 'var(--panel-2)', borderRadius: 9999, overflow: 'hidden', border: '1px solid var(--line)' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${s.percentage}%`,
                      background: 'linear-gradient(90deg, #14B8A6, #FA520F)',
                      borderRadius: 9999,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Geo Distribution */}
        <div className="card-mistral" style={{ padding: '20px 22px' }}>
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
            Geographic Demographics
          </h3>
          <p style={{ color: 'var(--text-2)', fontSize: 12.5, marginBottom: 18 }}>Top creator countries</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {USER_GEO_BREAKDOWN.map(g => (
              <div key={g.code}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5, marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontSize: 15 }}>{g.flag}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>{g.country}</span>
                  </div>
                  <span className="mono-metric" style={{ fontSize: 11.5, color: 'var(--text-2)' }}>
                    {formatNumber(g.users)} ({g.percentage}%)
                  </span>
                </div>
                <div style={{ height: 6, background: 'var(--line)', borderRadius: 9999, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${g.percentage * 2}%`,
                      background: 'linear-gradient(90deg, #3B82F6, #14B8A6)',
                      borderRadius: 9999,
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
          const color = EVENT_COLOR[event.eventName] ?? 'var(--dim)';
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
                width: 32, height: 32, borderRadius: 8,
                background: 'var(--panel-2)',
                border: '1px solid var(--line)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginTop: 2,
              }}>
                {EVENT_ICON[event.eventName] ?? <Zap size={14} color={color} strokeWidth={2} />}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 3, fontSize: 13.5 }}>
                  {formatEventLabel(event.eventName)}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: Object.keys(event.properties).length > 0 ? 6 : 0 }}>
                  <Clock size={11} color="var(--dim)" />
                  <span className="mono-metric" style={{ fontSize: 11.5, color: 'var(--dim)' }}>{formatDateTime(event.timestamp)}</span>
                </div>
                {Object.keys(event.properties).length > 0 && (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {Object.entries(event.properties).map(([k, v]) => (
                      <span key={k} className="badge badge-neutral mono-metric"
                        style={{ fontSize: 11 }}>
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
          style={{ width: 'fit-content', gap: 6, padding: '7px 14px', fontSize: 13 }}
          id="user-back-btn"
        >
          <ArrowLeft size={15} strokeWidth={2} />
          Back to User Directory
        </button>
      </div>

      {/* User Hero Card */}
      <div className="card-mistral" style={{ padding: '24px 28px' }}>
        <div className="sunset-stripe absolute top-0 left-0 right-0" style={{ height: 2 }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
          {/* Avatar + name + email */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 54, height: 54, borderRadius: 14, background: 'var(--panel-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1.5px solid var(--line)', flexShrink: 0,
            }}>
              <span style={{ color: 'var(--accent)', fontWeight: 800, fontSize: 18, fontFamily: 'Sora, sans-serif' }}>
                {user.firstName[0]}{user.lastName[0]}
              </span>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>
                  {user.firstName} {user.lastName}
                </h3>
                <span className={`badge ${SOURCE_BADGE_CLASS[user.signupSource] ?? 'badge-neutral'}`} style={{ fontSize: 11 }}>
                  {user.signupSource}
                </span>
                <span className="badge badge-neutral" style={{ fontSize: 11 }}>Plan: {user.planTier}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Mail size={13} color="var(--dim)" />
                <span className="mono-metric" style={{ fontSize: 12.5, color: 'var(--text-2)' }}>{user.email}</span>
              </div>
            </div>
          </div>

          {/* Session replay link */}
          <a
            href={postHogSessionReplayUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sunset"
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
            <div key={field.label} style={{ padding: '12px 14px', background: 'var(--panel-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                {field.icon}
                <p style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {field.label}
                </p>
              </div>
              <p style={{
                color: 'var(--text)',
                fontWeight: 600,
                fontFamily: field.mono ? 'JetBrains Mono, monospace' : undefined,
                fontSize: field.mono ? 11.5 : 13,
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
      <div className="pill-group no-scrollbar touch-scroll" style={{ alignSelf: 'flex-start', overflowX: 'auto', maxWidth: '100%', whiteSpace: 'nowrap' }}>
        <button
          onClick={() => setActiveTab('rooms')}
          className={`pill-tab ${activeTab === 'rooms' ? 'active' : ''}`}
        >
          <Sparkles size={14} />
          <span>Showcase Rooms &amp; Telemetry</span>
          <span style={{ fontSize: 10.5, padding: '1px 6px', borderRadius: 9999, background: 'var(--panel-2)', fontWeight: 700 }}>
            {roomInsights.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`pill-tab ${activeTab === 'timeline' ? 'active' : ''}`}
        >
          <Clock size={14} />
          <span>Activity &amp; Event Stream</span>
          <span style={{ fontSize: 10.5, padding: '1px 6px', borderRadius: 9999, background: 'var(--panel-2)', fontWeight: 700 }}>
            {events.length}
          </span>
        </button>
      </div>

      {/* ── Tab Content ──────────────────────────────────────── */}
      {activeTab === 'rooms' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {roomInsights.length === 0 ? (
            <div className="card-mistral" style={{ padding: 48, textAlign: 'center', color: 'var(--dim)' }}>
              <Home size={36} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
              <h4 style={{ fontFamily: 'Sora', fontSize: 16, color: 'var(--text)', marginBottom: 4 }}>No showcase rooms created yet</h4>
              <p style={{ fontSize: 13 }}>This user has not created or published any showcase rooms yet.</p>
            </div>
          ) : (
            <>
              {/* Room selector if user has multiple rooms */}
              {(roomInsights || []).length > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--panel)', padding: '10px 16px', borderRadius: 12, border: '1px solid var(--line)', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 600 }}>Select Showcase Room:</span>
                  <div className="pill-group">
                    {(roomInsights || []).map((r, idx) => (
                      <button
                        key={r.roomId}
                        onClick={() => setSelectedRoomIdx(idx)}
                        className={`pill-tab ${selectedRoomIdx === idx ? 'active' : ''}`}
                        style={{ fontSize: 12 }}
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
          <div className="card-mistral" style={{ overflow: 'hidden', padding: 0 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
                Event Timeline
              </h3>
              <span className="badge badge-teal" style={{ fontSize: 11 }}>
                {(events || []).length} events
              </span>
            </div>
            <EventTimeline events={(events || []) as UserEvent[]} />
          </div>

          {/* Email engagement */}
          <div className="card-mistral" style={{ overflow: 'hidden', padding: 0 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Mail size={15} color="var(--dim)" />
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
                Email Engagement
              </h3>
            </div>
            <div style={{ padding: '8px 0' }}>
              {((emailEngagement as EmailEngagement[]) || []).map((e, i) => (
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Clock size={11} color="var(--dim)" />
                        <span style={{ fontSize: 12, color: 'var(--dim)' }}>Sent</span>
                      </div>
                      <span className="mono-metric" style={{ fontSize: 12, color: 'var(--text-2)' }}>{formatDate(e.sent)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Mail size={11} color="var(--dim)" />
                        <span style={{ fontSize: 12, color: 'var(--dim)' }}>Opened</span>
                      </div>
                      {e.opened
                        ? <span className="badge badge-teal mono-metric" style={{ fontSize: 11 }}>✓ {formatDate(e.opened)}</span>
                        : <span className="badge badge-neutral" style={{ fontSize: 11 }}>Not opened</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <ExternalLink size={11} color="var(--dim)" />
                        <span style={{ fontSize: 12, color: 'var(--dim)' }}>Clicked</span>
                      </div>
                      {e.clicked
                        ? <span className="badge badge-sunset mono-metric" style={{ fontSize: 11 }}>✓ Clicked</span>
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
  const rbac = useRbac();
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
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 24, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>
              User Directory
            </h2>
            <span className="badge badge-teal" style={{ gap: 4 }}>
              <Users size={11} /> Directory
            </span>
          </div>
          <p style={{ color: 'var(--text-2)', fontSize: 13.5 }}>
            Search, manage, and inspect granular activity and profiles for all registered creators
          </p>
        </div>

        {/* Prominent Search Bar with Search Button in Header */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:max-w-md">
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
              style={{ paddingLeft: 36, fontSize: 13, height: 38, width: '100%' }}
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
              Registered Users Directory
            </h3>
            <p style={{ color: 'var(--text-2)', fontSize: 13 }}>
              Click on any user row to drill down into their complete granular details, timeline, and rooms
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap w-full sm:w-auto">
            <Filter size={14} color="var(--dim)" />
            <select
              className="input"
              style={{ width: 150, height: 36, fontSize: 13 }}
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
              disabled={!filteredUsers.length || !rbac.canExportData}
              className="btn btn-ghost"
              style={{
                fontSize: 13,
                gap: 6,
                opacity: !rbac.canExportData ? 0.6 : 1,
                height: 36,
              }}
              title={!rbac.canExportData ? 'Export restricted for Viewer role' : 'Export Users to CSV'}
            >
              <Download size={14} />
              {!rbac.canExportData ? 'Export (Locked)' : 'Export CSV'}
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
                  (filteredUsers || []).map(user => {
                    const ext = user as User & { countryCode?: string; totalEvents?: number };
                    return (
                      <tr
                        key={user.userId}
                        onClick={() => setSelectedUserId(user.userId)}
                        style={{ cursor: 'pointer' }}
                        className="hover:bg-[var(--panel-2)] transition-colors"
                        title="Click to view granular details"
                      >
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 34, height: 34, borderRadius: 8, background: 'var(--panel-2)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                              border: '1px solid var(--line)',
                            }}>
                              <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 12, fontFamily: 'Sora, sans-serif' }}>
                                {user.firstName[0]}{user.lastName[0]}
                              </span>
                            </div>
                            <div>
                              <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: 13.5, marginBottom: 2 }}>
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="mono-metric" style={{ fontSize: 11.5, color: 'var(--text-2)' }}>{user.email}</p>
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
                          <span className="badge badge-teal mono-metric" style={{ fontSize: 11 }}>
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
                            style={{ padding: '4px 10px', fontSize: 11.5, gap: 5 }}
                          >
                            Profile <ArrowRight size={12} />
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
