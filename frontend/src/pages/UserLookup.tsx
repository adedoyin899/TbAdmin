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
  ArrowRight, Users, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import { userApi } from '../api/userApi';
import { formatDate, formatDateTime, formatNumber } from '../utils/formatters';
import type { User, UserProfile, UserEvent, EmailEngagement } from '../types';
import { RoomInsightsDetailView } from '../components/Rooms/RoomInsightsDetailView';
import MOCK_ROOMS from '../api/mockData/rooms.json';

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

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
const TIME_SLOTS = [
  '9 - 11 AM', '11 - 1 PM', '2 - 4 PM', '4 - 6 PM',
  '6 - 8 PM', '8 - 10 PM', '10 - 12 AM',
] as const;

const HEATMAP_BG: Record<number, string> = {
  1: '#2DD4BF',
  2: '#0D9488',
  3: '#0F766E',
  4: '#134E4A',
};

// ── General Platform Showcase Overview (Main Page) ────────────

const GeneralPlatformShowcaseOverview: React.FC = () => {
  const [locationTab, setLocationTab] = useState<'unique' | 'clicks' | 'views' | 'engagement' | 'ctr'>('unique');
  const summary = MOCK_ROOMS.platformRoomsSummary;
  const viewsTrend = MOCK_ROOMS.platformViewsTrend;
  const trafficSources = MOCK_ROOMS.platformTrafficSources;
  const devices = MOCK_ROOMS.platformDevices;
  const heatmap = MOCK_ROOMS.platformHeatmap;
  const geoTraffic = MOCK_ROOMS.platformGeoTraffic;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Overview Top 4 KPI Cards (General Platform Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600 }}>Total Showcase Views</span>
            <span className="badge badge-success" style={{ gap: 2, fontSize: 11 }}>
              <ArrowUpRight size={11} /> +{summary.totalViews.change}%
            </span>
          </div>
          <p style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)', fontFamily: 'Sora, sans-serif' }}>
            {formatNumber(summary.totalViews.count)}
          </p>
          <p style={{ fontSize: 11, color: 'var(--faint)', marginTop: 4 }}>Across all published creator rooms</p>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600 }}>Unique Visitors</span>
            <span className="badge badge-error" style={{ gap: 2, fontSize: 11 }}>
              <ArrowDownRight size={11} /> {summary.uniqueViews.change}%
            </span>
          </div>
          <p style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)', fontFamily: 'Sora, sans-serif' }}>
            {formatNumber(summary.uniqueViews.count)}
          </p>
          <p style={{ fontSize: 11, color: 'var(--faint)', marginTop: 4 }}>Distinct recruiters and viewers</p>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600 }}>Avg Time Spent</span>
            <span className="badge badge-info" style={{ fontSize: 11 }}>
              {summary.avgTimeSpent.change}
            </span>
          </div>
          <p style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)', fontFamily: 'Sora, sans-serif' }}>
            {summary.avgTimeSpent.value}
          </p>
          <p style={{ fontSize: 11, color: 'var(--faint)', marginTop: 4 }}>Average room exploration time</p>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600 }}>Engagement Quality</span>
            <span className="badge badge-warning" style={{ gap: 2, fontSize: 11 }}>
              <ArrowUpRight size={11} /> +{summary.engagementQuality.change}%
            </span>
          </div>
          <p style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)', fontFamily: 'Sora, sans-serif' }}>
            {summary.engagementQuality.percentage}%
          </p>
          <p style={{ fontSize: 11, color: 'var(--faint)', marginTop: 4 }}>High-intent recruiter sessions</p>
        </div>
      </div>

      {/* Views Trend Area Chart */}
      <div className="chart-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
              Views Trend
            </h3>
            <p style={{ color: 'var(--text-2)', fontSize: 12 }}>Overall view growth across all creator rooms</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#FB923C' }} />
              <span style={{ color: 'var(--text-2)' }}>Total Views</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#2DD4BF' }} />
              <span style={{ color: 'var(--text-2)' }}>Unique Views</span>
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={viewsTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="genTotalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FB923C" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#FB923C" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="genUniqueGrad" x1="0" y1="0" x2="0" y2="1">
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
            <Area type="monotone" dataKey="totalViews" stroke="#FB923C" strokeWidth={2.5} fillOpacity={1} fill="url(#genTotalGrad)" name="Total Views (k)" />
            <Area type="monotone" dataKey="uniqueViews" stroke="#2DD4BF" strokeWidth={2.5} fillOpacity={1} fill="url(#genUniqueGrad)" name="Unique Views (k)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Traffic Sources & Devices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Traffic source */}
        <div className="card" style={{ padding: '20px 24px' }}>
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
            Traffic Sources
          </h3>
          <p style={{ color: 'var(--text-2)', fontSize: 12, marginBottom: 18 }}>How viewers discover showcase rooms</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {trafficSources.map(s => (
              <div key={s.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                  <span style={{ color: 'var(--text-2)', fontWeight: 500 }}>{s.name}</span>
                  <span style={{ color: 'var(--text)', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{s.count}</span>
                </div>
                <div style={{ height: 16, background: 'var(--panel-2)', borderRadius: 4, overflow: 'hidden', border: '1px solid var(--line)' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${s.percentage}%`,
                      background: 'linear-gradient(90deg, #E9D5FF, #DDD6FE)',
                      borderRadius: 3,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Devices */}
        <div className="card" style={{ padding: '20px 24px' }}>
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
            Devices
          </h3>
          <p style={{ color: 'var(--text-2)', fontSize: 12, marginBottom: 18 }}>Devices used by room viewers</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {devices.map(d => (
              <div key={d.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                  <span style={{ color: 'var(--text-2)', fontWeight: 500 }}>{d.name}</span>
                  <span style={{ color: 'var(--text)', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{d.count}</span>
                </div>
                <div style={{ height: 16, background: 'var(--panel-2)', borderRadius: 4, overflow: 'hidden', border: '1px solid var(--line)' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${d.percentage}%`,
                      background: 'linear-gradient(90deg, #BAE6FD, #7DD3FC)',
                      borderRadius: 3,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Engagement Heatmap & Geo Traffic */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Heatmap */}
        <div className="card" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                Engagement Heatmap
              </h3>
              <p style={{ color: 'var(--text-2)', fontSize: 12 }}>Peak viewing traffic windows throughout the week</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-2)' }}>
              <span>Low</span>
              {[1, 2, 3, 4].map(lvl => (
                <div key={lvl} style={{ width: 12, height: 12, borderRadius: 2, background: HEATMAP_BG[lvl] }} />
              ))}
              <span>High</span>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: 460 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '70px repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
                <div />
                {DAYS.map(day => (
                  <div key={day} style={{ textAlign: 'center', fontWeight: 600, fontSize: 11, color: 'var(--text-2)' }}>
                    {day}
                  </div>
                ))}
              </div>

              {TIME_SLOTS.slice(0, 5).map(slot => (
                <div key={slot} style={{ display: 'grid', gridTemplateColumns: '70px repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--faint)', display: 'flex', alignItems: 'center' }}>
                    {slot}
                  </div>
                  {DAYS.map(day => {
                    const cell = heatmap.find(h => h.day === day && h.timeSlot === slot);
                    const intensity = cell ? cell.intensity : 1;
                    const val = cell ? (cell.views > 1000 ? `${(cell.views / 1000).toFixed(1)}k` : `${cell.views}`) : '1.8k';

                    return (
                      <div
                        key={day + slot}
                        style={{
                          height: 30,
                          borderRadius: 4,
                          background: HEATMAP_BG[intensity],
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 10,
                          fontWeight: 600,
                          fontFamily: 'JetBrains Mono, monospace',
                        }}
                      >
                        {val}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Traffic by Location */}
        <div className="card" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
            <div>
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                Traffic by Location
              </h3>
              <p style={{ color: 'var(--text-2)', fontSize: 12 }}>Top visitor regions</p>
            </div>

            <div style={{ display: 'flex', gap: 3, background: 'var(--panel-2)', padding: 2, borderRadius: 6, border: '1px solid var(--line)' }}>
              {[
                { key: 'unique', label: 'Unique' },
                { key: 'views', label: 'Views' },
                { key: 'engagement', label: 'Engagement' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setLocationTab(tab.key as typeof locationTab)}
                  style={{
                    padding: '3px 8px',
                    fontSize: 11,
                    fontWeight: 600,
                    borderRadius: 4,
                    border: 'none',
                    background: locationTab === tab.key ? 'var(--panel)' : 'transparent',
                    color: locationTab === tab.key ? 'var(--text)' : 'var(--text-2)',
                    cursor: 'pointer',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {geoTraffic.map(g => (
              <div key={g.code}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, marginBottom: 3 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14 }}>{g.flag}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>{g.country}</span>
                  </div>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-2)' }}>
                    {formatNumber(g.views)} views
                  </span>
                </div>
                <div style={{ height: 6, background: 'var(--line)', borderRadius: 99, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${g.percentage}%`,
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
          Back to User Directory & Overview
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
              <p style={{ fontSize: 13 }}>This creator has not created or published any showcase rooms yet.</p>
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

              {/* Granular Room Insights detail view for the chosen room (with Smart Recommendations) */}
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

// ── Main User Lookup Page ─────────────────────────────────────

export const UserLookupPage: React.FC = () => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['allUsers', searchQuery],
    queryFn: () => userApi.searchUsers(searchQuery),
  });

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
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>
              User Directory & Showcase Insights
            </h2>
            <span className="badge badge-success" style={{ gap: 4 }}>
              <Users size={11} /> Platform Overview
            </span>
          </div>
          <p style={{ color: 'var(--text-2)', fontSize: 14 }}>
            Systemic showcase viewer intelligence across all creator rooms. Click any user to inspect granular details.
          </p>
        </div>
      </div>

      {/* ── Section 1: General Platform Showcase Overview ─────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
            General Showcase Performance
          </h3>
          <span style={{ fontSize: 12, color: 'var(--faint)' }}>Aggregated ecosystem metrics</span>
        </div>

        <GeneralPlatformShowcaseOverview />
      </div>

      {/* ── Section 2: All Registered Users Directory Table ───────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 10 }}>
        <div>
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
            All Registered Creators
          </h3>
          <p style={{ color: 'var(--text-2)', fontSize: 13 }}>
            Click on any user row to drill down into their granular profile, individual room insights, event timeline, and email history
          </p>
        </div>

        {/* Filter controls */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 360 }}>
            <Search
              size={15}
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--dim)', pointerEvents: 'none' }}
            />
            <input
              id="user-search-input"
              type="text"
              placeholder="Search by name, email, or user ID…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input"
              style={{ paddingLeft: 36, fontSize: 13 }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={14} color="var(--dim)" />
            <select
              className="input"
              style={{ width: 160 }}
              value={sourceFilter}
              onChange={e => setSourceFilter(e.target.value)}
            >
              <option value="all">All Sources</option>
              <option value="organic">Organic</option>
              <option value="email">Email</option>
              <option value="referral">Referral</option>
              <option value="paid_ad">Paid Ad</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="table-wrap">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>
              Creator Directory
            </span>
            <span className="badge badge-neutral" style={{ fontSize: 11 }}>
              {filteredUsers.length} creators
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Creator</th>
                  <th>Country</th>
                  <th>Signup Source</th>
                  <th>Showcase Rooms</th>
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
                      No creators match your search.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => {
                    const ext = user as User & { countryCode?: string; roomsCreated?: number; roomsPublished?: number; totalEvents?: number };
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontWeight: 600, color: 'var(--text)' }}>{ext.roomsCreated ?? 0}</span>
                            <span style={{ fontSize: 12, color: 'var(--faint)' }}>
                              ({ext.roomsPublished ?? 0} published)
                            </span>
                          </div>
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
                            Granular Details <ArrowRight size={13} />
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
