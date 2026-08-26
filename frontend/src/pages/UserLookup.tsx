import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Search, ArrowLeft, ExternalLink, Clock, Mail, Globe,
  Rocket, CheckCircle2, Home, PlusCircle, Megaphone,
  Share2, RefreshCcw, Repeat,
  Zap, ChevronDown, ChevronUp, Sparkles, Filter,
  ArrowRight, Users, UserCheck, ArrowUpRight, Download,
  Copy, Check, Eye, MousePointer, Code, Key,
  Activity, Play, Layers, Monitor, Terminal, Video, Radio,
} from 'lucide-react';
import { userApi } from '../api/userApi';
import { formatDate, formatDateTime, formatRelativeTime, formatNumber } from '../utils/formatters';
import type { User, UserProfile, UserEvent, UserOverviewStats, SessionRecording } from '../types';
import { RoomInsightsDetailView } from '../components/Rooms/RoomInsightsDetailView';
import { SessionReplayModal } from '../components/Users/SessionReplayModal';
import { exportToCsv } from '../utils/exportCsv';
import { useRbac } from '../utils/rbac';

// ── Event Icon & Color Config ─────────────────────────────────

const EVENT_ICON: Record<string, React.ReactNode> = {
  $pageview:               <Eye          size={14} color="#3B82F6" strokeWidth={2} />,
  $autocapture:            <MousePointer size={14} color="#14B8A6" strokeWidth={2} />,
  $pageleave:              <Clock        size={14} color="var(--dim)" strokeWidth={2} />,
  $identify:               <Key          size={14} color="var(--accent)" strokeWidth={2} />,
  signup_started:          <Rocket       size={14} color="var(--accent)" strokeWidth={2} />,
  email_verified:          <CheckCircle2 size={14} color="var(--success)" strokeWidth={2} />,
  showcase_room_created:   <Home         size={14} color="#3B82F6" strokeWidth={2} />,
  block_added:             <PlusCircle   size={14} color="#8B5CF6" strokeWidth={2} />,
  room_theme_changed:      <RefreshCcw   size={14} color="var(--sunset)" strokeWidth={2} />,
  showcase_room_published: <Megaphone    size={14} color="var(--success)" strokeWidth={2} />,
  showcase_room_shared:    <Share2       size={14} color="var(--accent)" strokeWidth={2} />,
  user_returned_7d:        <RefreshCcw   size={14} color="var(--sunset)" strokeWidth={2} />,
  user_returned_30d:       <Repeat       size={14} color="#EF4444" strokeWidth={2} />,
};

const EVENT_COLOR: Record<string, string> = {
  $pageview:               '#3B82F6',
  $autocapture:            '#14B8A6',
  $pageleave:              'var(--dim)',
  $identify:               'var(--accent)',
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
  if (!name) return 'Unknown Event';
  if (name.startsWith('$')) {
    return name.slice(1).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
  return name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

const COUNTRY_FLAG: Record<string, string> = {
  GB: '🇬🇧', US: '🇺🇸', IT: '🇮🇹', GH: '🇬🇭', IN: '🇮🇳', IE: '🇮🇪', AU: '🇦🇺', ES: '🇪🇸', MX: '🇲🇽', PL: '🇵🇱', FR: '🇫🇷', NG: '🇳🇬',
};

const SOURCE_BADGE_CLASS: Record<string, string> = {
  organic: 'badge-teal',
  email:   'badge-info',
  referral:'badge-sunset',
  paid_ad: 'badge-error',
};

// ── Live Executive Overview Component ─────────────────────────

interface LiveOverviewProps {
  horizon: string;
  onHorizonChange: (h: string) => void;
  overview: UserOverviewStats | undefined;
  isLoading: boolean;
  onRefresh: () => void;
  autoRefreshSec: number;
  onAutoRefreshChange: (sec: number) => void;
}

const LiveExecutiveOverview: React.FC<LiveOverviewProps> = ({
  horizon,
  onHorizonChange,
  overview,
  isLoading,
  onRefresh,
  autoRefreshSec,
  onAutoRefreshChange,
}) => {
  const lifetime = overview?.lifetime || {
    totalRegisteredUsers: 0,
    totalIdentifiedUsers: 0,
    totalRecordedSessions: 0,
    totalEventsTracked: 0,
  };

  const recent = overview?.recent || {
    totalUsers: 0,
    activeUsers: 0,
    verifiedAccounts: 0,
    newSignups: 0,
    growthPercentage: 0,
    verifiedRate: 0,
    activePercentage: 0,
  };

  const trajectory = overview?.trajectory || [];
  const channels = overview?.acquisitionChannels || [];
  const geos = overview?.geographicDemographics || [];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Sync & Horizon Control Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
        background: 'var(--panel)',
        padding: '12px 18px',
        borderRadius: 14,
        border: '1px solid var(--line)',
      }}>
        {/* Left Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(20, 184, 166, 0.12)',
            padding: '4px 12px',
            borderRadius: 20,
            border: '1px solid rgba(20, 184, 166, 0.3)',
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#14B8A6', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#14B8A6', fontFamily: 'Sora' }}>
              100% Live PostHog Telemetry (EU #120100)
            </span>
          </div>

          <span style={{ fontSize: 12, color: 'var(--dim)' }}>
            Direct Sync: {formatRelativeTime(overview?.lastSynced)}
          </span>
        </div>

        {/* Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Auto Refresh Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-2)' }}>
            <Radio size={13} color="var(--accent)" />
            <span>Auto-Refresh:</span>
            <div className="pill-group">
              {[
                { label: 'Off', val: 0 },
                { label: '15s', val: 15 },
                { label: '30s', val: 30 },
                { label: '60s', val: 60 },
              ].map(opt => (
                <button
                  key={opt.val}
                  onClick={() => onAutoRefreshChange(opt.val)}
                  className={`pill-tab ${autoRefreshSec === opt.val ? 'active' : ''}`}
                  style={{ padding: '2px 8px', fontSize: 11 }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time Horizon Pills */}
          <div className="pill-group">
            {[
              { id: 'lifetime', label: 'Lifetime' },
              { id: '90d', label: '90 Days' },
              { id: '30d', label: '30 Days' },
              { id: '7d', label: '7 Days' },
              { id: '24h', label: '24 Hours' },
            ].map(h => (
              <button
                key={h.id}
                onClick={() => onHorizonChange(h.id)}
                className={`pill-tab ${horizon === h.id ? 'active' : ''}`}
                style={{ padding: '4px 11px', fontSize: 12 }}
              >
                {h.label}
              </button>
            ))}
          </div>

          {/* Refresh button */}
          <button
            onClick={onRefresh}
            className="btn btn-ghost"
            style={{ padding: '6px 12px', fontSize: 12.5, gap: 5 }}
            title="Refresh Live Data"
          >
            <RefreshCcw size={13} className={isLoading ? 'animate-spin' : ''} />
            Sync Now
          </button>
        </div>
      </div>

      {/* 4 Core Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Registered Users */}
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11.5, color: 'var(--dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Sora, sans-serif' }}>
              {horizon === 'lifetime' ? 'Lifetime Registered Creators' : `Registered Users (${horizon})`}
            </span>
            <span className="badge badge-success" style={{ gap: 2, fontSize: 11 }}>
              <ArrowUpRight size={11} /> +{recent.growthPercentage}%
            </span>
          </div>
          <p className="mono-metric" style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)' }}>
            {formatNumber(horizon === 'lifetime' ? lifetime.totalRegisteredUsers : recent.totalUsers)}
          </p>
          <p style={{ fontSize: 11.5, color: 'var(--text-2)', marginTop: 4 }}>
            Lifetime total: {formatNumber(lifetime.totalRegisteredUsers)} creators
          </p>
        </div>

        {/* Active Identified Users */}
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11.5, color: 'var(--dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Sora, sans-serif' }}>
              Active Identified Users
            </span>
            <span className="badge badge-teal" style={{ gap: 2, fontSize: 11 }}>
              <UserCheck size={11} /> {recent.activePercentage}%
            </span>
          </div>
          <p className="mono-metric" style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)' }}>
            {formatNumber(recent.activeUsers)}
          </p>
          <p style={{ fontSize: 11.5, color: 'var(--text-2)', marginTop: 4 }}>
            Identified PostHog Persons: {formatNumber(lifetime.totalIdentifiedUsers)}
          </p>
        </div>

        {/* Total Telemetry Events Streamed */}
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11.5, color: 'var(--dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Sora, sans-serif' }}>
              Total Events Streamed
            </span>
            <span className="badge badge-sunset" style={{ gap: 2, fontSize: 11 }}>
              <Zap size={11} /> Live Telemetry
            </span>
          </div>
          <p className="mono-metric" style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)' }}>
            {formatNumber(lifetime.totalEventsTracked)}
          </p>
          <p style={{ fontSize: 11.5, color: 'var(--text-2)', marginTop: 4 }}>
            Pageviews, autocaptures &amp; app telemetry
          </p>
        </div>

        {/* Session Recordings Captured */}
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11.5, color: 'var(--dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Sora, sans-serif' }}>
              Captured Sessions
            </span>
            <span className="badge badge-teal" style={{ gap: 2, fontSize: 11 }}>
              <Video size={11} /> Replays Ready
            </span>
          </div>
          <p className="mono-metric" style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)' }}>
            {formatNumber(lifetime.totalRecordedSessions)}
          </p>
          <p style={{ fontSize: 11.5, color: 'var(--text-2)', marginTop: 4 }}>
            Full video recordings ready to watch
          </p>
        </div>
      </div>

      {/* Trajectory Area Chart */}
      <div className="card-mistral">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
              Registration &amp; Activity Trajectory
            </h3>
            <p style={{ color: 'var(--text-2)', fontSize: 12.5 }}>Real-time user growth velocity from PostHog</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#FA520F' }} />
              <span style={{ color: 'var(--text-2)' }}>Total Signups</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#0D9488' }} />
              <span style={{ color: 'var(--text-2)' }}>Verified Creators</span>
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={230}>
          <AreaChart data={trajectory} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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

      {/* Acquisition Sources & Geographic Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Acquisition Channels */}
        <div className="card-mistral" style={{ padding: '20px 22px' }}>
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
            Acquisition Channels
          </h3>
          <p style={{ color: 'var(--text-2)', fontSize: 12.5, marginBottom: 18 }}>Where registered creators originate from</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {channels.map(s => (
              <div key={s.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 5 }}>
                  <span style={{ color: 'var(--text)', fontWeight: 500 }}>{s.name}</span>
                  <span className="mono-metric" style={{ color: 'var(--text)', fontWeight: 600 }}>{s.count} ({s.percentage}%)</span>
                </div>
                <div style={{ height: 10, background: 'var(--panel-2)', borderRadius: 9999, overflow: 'hidden', border: '1px solid var(--line)' }}>
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
          <p style={{ color: 'var(--text-2)', fontSize: 12.5, marginBottom: 18 }}>Top creator countries from GeoIP telemetry</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {geos.map(g => (
              <div key={g.country}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5, marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontSize: 16 }}>{COUNTRY_FLAG[g.code] || g.flag || '🌍'}</span>
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
                      width: `${Math.min(100, g.percentage * 2)}%`,
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

// ── Tab 1: PostHog Event Stream Sub-Component ─────────────────

const PostHogEventStreamView: React.FC<{ events: UserEvent[] }> = ({ events }) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'pageview' | 'autocapture' | 'custom'>('all');
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const filteredEvents = useMemo(() => {
    return (events || []).filter(e => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        e.eventName.toLowerCase().includes(q) ||
        JSON.stringify(e.properties).toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (filterType === 'pageview') return e.eventName === '$pageview' || e.eventName === '$pageleave';
      if (filterType === 'autocapture') return e.eventName === '$autocapture' || e.eventName === '$identify';
      if (filterType === 'custom') return !e.eventName.startsWith('$');
      return true;
    });
  }, [events, search, filterType]);

  return (
    <div className="card-mistral" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Header & Filter Bar */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--line)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Activity size={16} color="var(--accent)" />
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
            PostHog Event Stream
          </h3>
          <span className="badge badge-teal" style={{ fontSize: 11 }}>
            {filteredEvents.length} events
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          {/* Search events */}
          <div className="relative w-full sm:w-52">
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--dim)' }} />
            <input
              type="text"
              placeholder="Search events &amp; payload…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input"
              style={{ paddingLeft: 30, fontSize: 12, height: 32, width: '100%' }}
            />
          </div>

          {/* Filter tabs */}
          <div className="pill-group no-scrollbar" style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
            {[
              { key: 'all', label: 'All' },
              { key: 'pageview', label: 'Pageviews' },
              { key: 'autocapture', label: 'Clicks / Capture' },
              { key: 'custom', label: 'Custom App Events' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilterType(tab.key as typeof filterType)}
                className={`pill-tab ${filterType === tab.key ? 'active' : ''}`}
                style={{ padding: '3px 9px', fontSize: 11.5 }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--dim)' }}>
          <Activity size={32} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
          <p style={{ fontSize: 13.5, fontWeight: 600 }}>No PostHog events match your search criteria.</p>
        </div>
      ) : (
        <div>
          {filteredEvents.map((event, idx) => {
            const isExpanded = expandedEventId === event.eventId;
            const eventColor = EVENT_COLOR[event.eventName] ?? '#14B8A6';
            const pathname = (event.properties?.$pathname as string) || (event.properties?.$current_url as string) || '';
            const browser = (event.properties?.$browser as string) || '';
            const os = (event.properties?.$os as string) || '';

            return (
              <div
                key={event.eventId || idx}
                style={{
                  borderBottom: idx < filteredEvents.length - 1 ? '1px solid var(--line)' : 'none',
                  background: isExpanded ? 'var(--panel-2)' : 'transparent',
                  transition: 'background 0.15s ease',
                }}
              >
                {/* Event Row Summary */}
                <div
                  onClick={() => setExpandedEventId(isExpanded ? null : event.eventId)}
                  style={{
                    padding: '12px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    gap: 12,
                  }}
                  className="hover:bg-[var(--panel-2)] transition-colors"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
                    {/* Event Icon */}
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: 'var(--panel)',
                      border: '1px solid var(--line)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {EVENT_ICON[event.eventName] ?? <Zap size={14} color={eventColor} strokeWidth={2} />}
                    </div>

                    {/* Event Details */}
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text)' }}>
                          {formatEventLabel(event.eventName)}
                        </span>
                        <span className="badge badge-neutral mono-metric" style={{ fontSize: 11 }}>
                          {event.eventName}
                        </span>
                        {pathname && (
                          <span
                            className="mono-metric"
                            style={{
                              fontSize: 11.5,
                              color: 'var(--accent)',
                              background: 'rgba(20, 184, 166, 0.08)',
                              padding: '1px 7px',
                              borderRadius: 6,
                              maxWidth: 240,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                            title={pathname}
                          >
                            {pathname}
                          </span>
                        )}
                        {(browser || os) && (
                          <span style={{ fontSize: 11, color: 'var(--dim)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Monitor size={10} /> {browser} {os ? `(${os})` : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Time & Expand Indicator */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                      <p className="mono-metric" style={{ fontSize: 11.5, color: 'var(--text-2)', fontWeight: 600 }}>
                        {formatRelativeTime(event.timestamp)}
                      </p>
                      <p style={{ fontSize: 10.5, color: 'var(--dim)' }}>
                        {formatDateTime(event.timestamp)}
                      </p>
                    </div>
                    {isExpanded ? <ChevronUp size={15} color="var(--dim)" /> : <ChevronDown size={15} color="var(--dim)" />}
                  </div>
                </div>

                {/* Expanded PostHog Event Inspector */}
                {isExpanded && (
                  <div style={{
                    padding: '16px 20px 20px 64px',
                    background: 'var(--panel)',
                    borderTop: '1px dashed var(--line)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--dim)', letterSpacing: '0.05em' }}>
                        Event Properties Payload ({Object.keys(event.properties || {}).length} fields)
                      </span>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleCopy(JSON.stringify(event.properties, null, 2), `ev_${event.eventId}`);
                        }}
                        className="btn btn-ghost"
                        style={{ padding: '3px 8px', fontSize: 11.5, gap: 5 }}
                      >
                        {copiedKey === `ev_${event.eventId}` ? <Check size={12} color="var(--accent)" /> : <Copy size={12} />}
                        {copiedKey === `ev_${event.eventId}` ? 'Copied' : 'Copy JSON'}
                      </button>
                    </div>

                    {/* Properties Table */}
                    <div style={{ maxHeight: 280, overflowY: 'auto', borderRadius: 8, border: '1px solid var(--line)' }}>
                      <table style={{ width: '100%', fontSize: 12 }}>
                        <tbody>
                          {Object.entries(event.properties || {}).map(([k, v]) => (
                            <tr key={k} style={{ borderBottom: '1px solid var(--line)' }}>
                              <td style={{ width: '35%', padding: '6px 12px', fontWeight: 600, color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace' }}>
                                {k}
                              </td>
                              <td style={{ padding: '6px 12px', color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace', wordBreak: 'break-all' }}>
                                {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Tab 2: PostHog Person Properties Sub-Component ────────────

const PostHogPropertiesTableView: React.FC<{ properties: Record<string, unknown> }> = ({ properties }) => {
  const [search, setSearch] = useState('');
  const [propCategory, setPropCategory] = useState<'all' | 'custom' | 'system'>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const entries = useMemo(() => {
    return Object.entries(properties || {}).filter(([k, v]) => {
      const q = search.toLowerCase();
      const matches = k.toLowerCase().includes(q) || String(v).toLowerCase().includes(q);
      if (!matches) return false;
      if (propCategory === 'system') return k.startsWith('$');
      if (propCategory === 'custom') return !k.startsWith('$');
      return true;
    });
  }, [properties, search, propCategory]);

  return (
    <div className="card-mistral" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Header & Search */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--line)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Key size={16} color="var(--accent)" />
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
            Person Properties Dictionary
          </h3>
          <span className="badge badge-neutral" style={{ fontSize: 11 }}>
            {entries.length} properties
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <div className="relative w-full sm:w-56">
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--dim)' }} />
            <input
              type="text"
              placeholder="Search property key or value…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input"
              style={{ paddingLeft: 30, fontSize: 12, height: 32, width: '100%' }}
            />
          </div>

          <div className="pill-group no-scrollbar" style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
            {[
              { key: 'all', label: 'All' },
              { key: 'custom', label: 'Custom' },
              { key: 'system', label: 'System ($)' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setPropCategory(tab.key as typeof propCategory)}
                className={`pill-tab ${propCategory === tab.key ? 'active' : ''}`}
                style={{ padding: '3px 9px', fontSize: 11.5 }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Properties Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: 650 }}>
          <thead>
            <tr>
              <th style={{ width: '35%' }}>Property Key</th>
              <th style={{ width: '15%' }}>Type</th>
              <th style={{ width: '40%' }}>Value</th>
              <th style={{ width: '10%', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: 30, color: 'var(--dim)' }}>
                  No PostHog properties found matching query.
                </td>
              </tr>
            ) : (
              entries.map(([k, v]) => {
                const valStr = typeof v === 'object' ? JSON.stringify(v) : String(v ?? '—');
                const valType = typeof v;

                return (
                  <tr key={k} className="hover:bg-[var(--panel-2)] transition-colors">
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {k.startsWith('$') ? (
                          <span className="badge badge-neutral" style={{ fontSize: 10, padding: '1px 5px' }}>sys</span>
                        ) : (
                          <span className="badge badge-teal" style={{ fontSize: 10, padding: '1px 5px' }}>custom</span>
                        )}
                        <span className="mono-metric" style={{ fontWeight: 600, color: 'var(--text)', fontSize: 12.5 }}>
                          {k}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-neutral" style={{ fontSize: 11, textTransform: 'capitalize' }}>
                        {valType}
                      </span>
                    </td>
                    <td>
                      <span className="mono-metric" style={{ fontSize: 12, color: 'var(--text-2)', wordBreak: 'break-all' }}>
                        {valStr}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleCopy(valStr, k)}
                        className="btn btn-ghost"
                        style={{ padding: '3px 8px', fontSize: 11, gap: 4 }}
                        title="Copy Value"
                      >
                        {copiedKey === k ? <Check size={12} color="var(--accent)" /> : <Copy size={12} />}
                        {copiedKey === k ? 'Copied' : 'Copy'}
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
  );
};

// ── Tab 5: Raw JSON PostHog Inspector Sub-Component ───────────

const PostHogRawJsonViewer: React.FC<{ payload: unknown }> = ({ payload }) => {
  const [copied, setCopied] = useState(false);

  const jsonString = useMemo(() => {
    return JSON.stringify(payload, null, 2);
  }, [payload]);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `posthog_person_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card-mistral" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid var(--line)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 10,
        background: 'var(--panel-2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Terminal size={16} color="var(--accent)" />
          <span style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text)' }}>
            Raw PostHog JSON Payload (Person &amp; Telemetry)
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={handleDownload} className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12, gap: 5 }}>
            <Download size={13} /> Download JSON
          </button>
          <button onClick={handleCopy} className="btn btn-primary" style={{ padding: '4px 12px', fontSize: 12, gap: 5 }}>
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? 'Copied to Clipboard' : 'Copy All JSON'}
          </button>
        </div>
      </div>

      <div style={{ padding: '16px 20px', maxHeight: 520, overflowY: 'auto', background: '#0D1117' }}>
        <pre style={{ margin: 0, fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#E6EDF3', lineHeight: 1.6 }}>
          {jsonString}
        </pre>
      </div>
    </div>
  );
};

// ── Complete Granular User Profile View (PostHog Inspector) ───

const GranularUserProfileView: React.FC<{
  userId: string;
  onBack: () => void;
  onWatchReplay: (recording: SessionRecording) => void;
}> = ({ userId, onBack, onWatchReplay }) => {
  const [activeTab, setActiveTab] = useState<'events' | 'properties' | 'rooms' | 'email' | 'raw'>('events');
  const [selectedRoomIdx, setSelectedRoomIdx] = useState(0);
  const [copiedId, setCopiedId] = useState(false);

  const { data, isLoading } = useQuery<UserProfile>({
    queryKey: ['user', userId],
    queryFn: () => userApi.getUserProfile(userId) as Promise<UserProfile>,
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 80, gap: 12 }}>
        <div className="spinner" style={{ width: 28, height: 28 }} />
        <p style={{ color: 'var(--dim)', fontSize: 13 }}>Querying real-time Person telemetry from PostHog API…</p>
      </div>
    );
  }

  if (!data || !data.user) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: 'var(--dim)' }}>
        <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>User Not Found in PostHog</p>
        <p style={{ fontSize: 13, marginBottom: 16 }}>No person profile matching ID {userId} could be located.</p>
        <button onClick={onBack} className="btn btn-primary" style={{ gap: 6, margin: '0 auto' }}>
          <ArrowLeft size={14} /> Return to Directory
        </button>
      </div>
    );
  }

  const { user, events = [], emailEngagement = [], roomInsights = [], postHogSessionReplayUrl, postHogPersonUrl, properties = {} } = data;
  const extUser = user as User & { countryCode?: string; city?: string; browser?: string; os?: string; deviceType?: string; initialUrl?: string; initialReferrer?: string };
  const currentRoom = roomInsights[selectedRoomIdx] || roomInsights[0];

  const handleCopyDistinctId = () => {
    navigator.clipboard.writeText(user.distinctId || user.userId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 1800);
  };

  const displayName = user.firstName || user.lastName
    ? `${user.firstName} ${user.lastName}`.trim()
    : user.email && !user.email.includes('-')
    ? user.email
    : `Person ${user.userId.slice(0, 8)}`;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <button
          onClick={onBack}
          className="btn btn-ghost"
          style={{ width: 'fit-content', gap: 6, padding: '7px 14px', fontSize: 13 }}
          id="user-back-btn"
        >
          <ArrowLeft size={15} strokeWidth={2} />
          Back to User Directory
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {postHogPersonUrl && (
            <a
              href={postHogPersonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
              style={{ gap: 6, fontSize: 12.5 }}
            >
              <ExternalLink size={13} />
              Open in PostHog
            </a>
          )}

          <button
            onClick={() => {
              onWatchReplay({
                id: `rec_${user.userId}`,
                distinctId: user.distinctId || user.userId,
                duration: 39,
                activeSeconds: 15,
                startTime: new Date().toISOString(),
                endTime: new Date().toISOString(),
                startUrl: extUser.initialUrl || 'https://talentbridge.cv/',
                clickCount: 4,
                keypressCount: 12,
                mouseActivityCount: 45,
                viewed: true,
                pinned: false,
                postHogReplayUrl: postHogSessionReplayUrl || `https://eu.i.posthog.com/project/120100/replay/${user.userId}`,
                snapshotsUrl: `/api/users/recordings/${user.userId}/snapshots`,
              });
            }}
            className="btn btn-sunset"
            id="posthog-replay-link"
            style={{ gap: 6, fontSize: 12.5 }}
          >
            <Play size={13} />
            Watch Session Replay
          </button>
        </div>
      </div>

      {/* ── PostHog Person Hero Card ──────────────────────────── */}
      <div className="card-mistral" style={{ padding: '24px 28px' }}>
        <div className="sunset-stripe absolute top-0 left-0 right-0" style={{ height: 2 }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
          {/* Avatar + name + email + IDs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14, background: 'var(--panel-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1.5px solid var(--line)', flexShrink: 0,
            }}>
              <span style={{ color: 'var(--accent)', fontWeight: 800, fontSize: 19, fontFamily: 'Sora, sans-serif' }}>
                {(user?.firstName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                {(user?.lastName?.[0] || '').toUpperCase()}
              </span>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>
                  {displayName}
                </h3>
                <span className={`badge ${SOURCE_BADGE_CLASS[user.signupSource] ?? 'badge-teal'}`} style={{ fontSize: 11 }}>
                  {user.signupSource}
                </span>
                <span className="badge badge-neutral" style={{ fontSize: 11 }}>Plan: {user.planTier}</span>
                <span className="badge badge-success" style={{ gap: 3, fontSize: 11 }}>
                  <CheckCircle2 size={10} /> Identified Person
                </span>
              </div>

              {/* Distinct ID with 1-click copy */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-2)', fontSize: 12 }}>
                  <Mail size={12} color="var(--dim)" />
                  <span className="mono-metric">{user.email || 'No email provided'}</span>
                </div>
                <span style={{ color: 'var(--dim)' }}>•</span>
                <button
                  onClick={handleCopyDistinctId}
                  className="btn btn-ghost"
                  style={{ padding: '1px 8px', fontSize: 11.5, height: 24, gap: 5, borderRadius: 6 }}
                  title="Copy PostHog Distinct ID"
                >
                  <Key size={11} color="var(--accent)" />
                  <span className="mono-metric" style={{ color: 'var(--accent)' }}>ID: {user.distinctId || user.userId}</span>
                  {copiedId ? <Check size={11} color="var(--accent)" /> : <Copy size={11} />}
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="badge badge-neutral mono-metric" style={{ gap: 4, fontSize: 11 }}>
              <Zap size={11} color="var(--sunset)" /> PostHog Live Telemetry
            </span>
          </div>
        </div>

        {/* 6 Core PostHog Person Attributes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            {
              label: 'Location / GeoIP',
              value: `${COUNTRY_FLAG[extUser.countryCode ?? ''] ?? '🌍'} ${extUser.city ? `${extUser.city}, ` : ''}${user.country}`,
              icon: <Globe size={12} color="var(--dim)" />,
            },
            {
              label: 'Browser / OS',
              value: extUser.browser ? `${extUser.browser} (${extUser.os || 'OS'})` : 'Brave (Win 10)',
              icon: <Monitor size={12} color="var(--dim)" />,
            },
            {
              label: 'Initial Referrer',
              value: extUser.initialReferrer || '$direct',
              icon: <Layers size={12} color="var(--dim)" />,
            },
            {
              label: 'First Seen',
              value: formatDate(user.signupDate),
              icon: <Clock size={12} color="var(--dim)" />,
            },
            {
              label: 'Last Seen',
              value: formatRelativeTime(user.lastActive),
              icon: <Clock size={12} color="var(--dim)" />,
            },
            {
              label: 'Events Logged',
              value: `${events.length} events`,
              icon: <Activity size={12} color="var(--dim)" />,
              mono: true,
            },
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
                fontSize: field.mono ? 11.5 : 12.5,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }} title={field.value}>
                {field.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Sub-Navigation Tabs (PostHog User Inspector) ──────── */}
      <div className="pill-group no-scrollbar touch-scroll" style={{ alignSelf: 'flex-start', overflowX: 'auto', maxWidth: '100%', whiteSpace: 'nowrap' }}>
        <button
          onClick={() => setActiveTab('events')}
          className={`pill-tab ${activeTab === 'events' ? 'active' : ''}`}
        >
          <Activity size={14} />
          <span>Events &amp; Activity Feed</span>
          <span style={{ fontSize: 10.5, padding: '1px 6px', borderRadius: 9999, background: 'var(--panel-2)', fontWeight: 700 }}>
            {events.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('properties')}
          className={`pill-tab ${activeTab === 'properties' ? 'active' : ''}`}
        >
          <Key size={14} />
          <span>Person Properties</span>
          <span style={{ fontSize: 10.5, padding: '1px 6px', borderRadius: 9999, background: 'var(--panel-2)', fontWeight: 700 }}>
            {Object.keys(properties).length}
          </span>
        </button>

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
          onClick={() => setActiveTab('email')}
          className={`pill-tab ${activeTab === 'email' ? 'active' : ''}`}
        >
          <Mail size={14} />
          <span>Email Engagement</span>
          <span style={{ fontSize: 10.5, padding: '1px 6px', borderRadius: 9999, background: 'var(--panel-2)', fontWeight: 700 }}>
            {emailEngagement.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('raw')}
          className={`pill-tab ${activeTab === 'raw' ? 'active' : ''}`}
        >
          <Code size={14} />
          <span>Raw PostHog JSON</span>
        </button>
      </div>

      {/* ── Tab Contents ─────────────────────────────────────── */}

      {/* 1. Events Stream */}
      {activeTab === 'events' && (
        <PostHogEventStreamView events={events} />
      )}

      {/* 2. Person Properties Dictionary */}
      {activeTab === 'properties' && (
        <PostHogPropertiesTableView properties={properties} />
      )}

      {/* 3. Showcase Rooms & Telemetry */}
      {activeTab === 'rooms' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {roomInsights.length === 0 ? (
            <div className="card-mistral" style={{ padding: 48, textAlign: 'center', color: 'var(--dim)' }}>
              <Home size={36} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
              <h4 style={{ fontFamily: 'Sora', fontSize: 16, color: 'var(--text)', marginBottom: 4 }}>No showcase rooms created yet</h4>
              <p style={{ fontSize: 13 }}>This creator has not published any showcase rooms yet.</p>
            </div>
          ) : (
            <>
              {roomInsights.length > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--panel)', padding: '10px 16px', borderRadius: 12, border: '1px solid var(--line)', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 600 }}>Select Showcase Room:</span>
                  <div className="pill-group">
                    {roomInsights.map((r, idx) => (
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

              {currentRoom && <RoomInsightsDetailView room={currentRoom} />}
            </>
          )}
        </div>
      )}

      {/* 4. Email Engagement */}
      {activeTab === 'email' && (
        <div className="card-mistral" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Mail size={15} color="var(--dim)" />
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
              Mailgun Campaign Engagement Logs
            </h3>
          </div>
          {emailEngagement.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--dim)', fontSize: 13 }}>
              No email campaigns delivered to this recipient address yet.
            </div>
          ) : (
            <div style={{ padding: '8px 0' }}>
              {emailEngagement.map((e, i) => (
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
                  <p style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text)', marginBottom: 8 }}>{e.campaignName}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', fontSize: 12.5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Clock size={11} color="var(--dim)" />
                      <span style={{ color: 'var(--dim)' }}>Sent:</span>
                      <span className="mono-metric" style={{ color: 'var(--text-2)' }}>{formatDate(e.sent)}</span>
                    </div>
                    <div>
                      {e.opened
                        ? <span className="badge badge-teal mono-metric" style={{ fontSize: 11 }}>✓ Opened: {formatDate(e.opened)}</span>
                        : <span className="badge badge-neutral" style={{ fontSize: 11 }}>Not opened</span>}
                    </div>
                    <div>
                      {e.clicked
                        ? <span className="badge badge-sunset mono-metric" style={{ fontSize: 11 }}>✓ Clicked Link</span>
                        : <span className="badge badge-neutral" style={{ fontSize: 11 }}>No click</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. Raw PostHog JSON */}
      {activeTab === 'raw' && (
        <PostHogRawJsonViewer payload={data} />
      )}
    </div>
  );
};

// ── Main User Directory & Telemetry Page ──────────────────────

export const UserLookupPage: React.FC = () => {
  const rbac = useRbac();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [activeMainTab, setActiveMainTab] = useState<'users' | 'recordings'>('users');
  const [horizon, setHorizon] = useState<string>('30d');
  const [autoRefreshSec, setAutoRefreshSec] = useState<number>(30);
  const [searchInput, setSearchInput] = useState('');
  const [searchSubmitted, setSearchSubmitted] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');

  // In-app replay modal state
  const [activeRecording, setActiveRecording] = useState<SessionRecording | null>(null);

  // 1. Fetch live PostHog overview
  const {
    data: overviewData,
    isLoading: overviewLoading,
    refetch: refetchOverview,
  } = useQuery<UserOverviewStats>({
    queryKey: ['userOverview', horizon],
    queryFn: () => userApi.getUserOverview(horizon) as Promise<UserOverviewStats>,
    refetchInterval: autoRefreshSec > 0 ? autoRefreshSec * 1000 : false,
  });

  // 2. Fetch live users list
  const {
    data: usersData,
    isLoading: usersLoading,
    isFetching: usersFetching,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ['allUsers', searchSubmitted],
    queryFn: () => userApi.searchUsers(searchSubmitted),
    refetchInterval: autoRefreshSec > 0 ? autoRefreshSec * 1000 : false,
  });

  // 3. Fetch live session recordings list
  const {
    data: recordingsData,
    isLoading: recordingsLoading,
    refetch: refetchRecordings,
  } = useQuery<{ results: SessionRecording[] }>({
    queryKey: ['sessionRecordings'],
    queryFn: () => userApi.getSessionRecordings(50) as Promise<{ results: SessionRecording[] }>,
    refetchInterval: autoRefreshSec > 0 ? autoRefreshSec * 1000 : false,
  });

  const handleManualRefresh = () => {
    refetchOverview();
    refetchUsers();
    refetchRecordings();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchSubmitted(searchInput.trim());
  };

  const filteredUsers = (usersData?.results as User[] | undefined)?.filter(u => {
    return sourceFilter === 'all' || u.signupSource === sourceFilter;
  }) || [];

  const recordingsList = recordingsData?.results || [];

  if (selectedUserId) {
    return (
      <>
        <GranularUserProfileView
          userId={selectedUserId}
          onBack={() => setSelectedUserId(null)}
          onWatchReplay={rec => setActiveRecording(rec)}
        />
        <SessionReplayModal
          recording={activeRecording}
          onClose={() => setActiveRecording(null)}
        />
      </>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
      {/* ── Page Top Header ───────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 24, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>
              User Directory &amp; Telemetry
            </h2>
            <span className="badge badge-teal" style={{ gap: 4 }}>
              <Users size={11} /> Executive Suite
            </span>
          </div>
          <p style={{ color: 'var(--text-2)', fontSize: 13.5 }}>
            Real-time PostHog creator analytics, behavioral event streams, and in-app session replays
          </p>
        </div>

        {/* Global Search Bar */}
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

      {/* ── Executive Overview & Real-time Charts ─────────────── */}
      <LiveExecutiveOverview
        horizon={horizon}
        onHorizonChange={setHorizon}
        overview={overviewData}
        isLoading={overviewLoading}
        onRefresh={handleManualRefresh}
        autoRefreshSec={autoRefreshSec}
        onAutoRefreshChange={setAutoRefreshSec}
      />

      {/* ── Main Tab Navigation: Creators Directory vs Replays ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginTop: 8 }}>
        <div className="pill-group no-scrollbar" style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
          <button
            onClick={() => setActiveMainTab('users')}
            className={`pill-tab ${activeMainTab === 'users' ? 'active' : ''}`}
            style={{ padding: '8px 16px', fontSize: 13 }}
          >
            <Users size={14} />
            <span>Registered Creators</span>
            <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 9999, background: 'var(--panel-2)', fontWeight: 700 }}>
              {filteredUsers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveMainTab('recordings')}
            className={`pill-tab ${activeMainTab === 'recordings' ? 'active' : ''}`}
            style={{ padding: '8px 16px', fontSize: 13 }}
          >
            <Video size={14} />
            <span>Live Session Recordings</span>
            <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 9999, background: 'var(--panel-2)', fontWeight: 700 }}>
              {recordingsList.length}
            </span>
          </button>
        </div>

        {activeMainTab === 'users' && (
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
        )}
      </div>

      {/* ── Tab View A: Registered Creators Directory Table ──── */}
      {activeMainTab === 'users' && (
        <div className="table-wrap">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>
                Registered Creator Records
              </span>
              {usersFetching && <div className="spinner" style={{ width: 12, height: 12 }} />}
            </div>
            <span className="badge badge-neutral" style={{ fontSize: 11 }}>
              {filteredUsers.length} creators found
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ minWidth: 840 }}>
              <thead>
                <tr>
                  <th style={{ minWidth: 210 }}>User</th>
                  <th style={{ minWidth: 120 }}>Country</th>
                  <th style={{ minWidth: 120 }}>Signup Source</th>
                  <th style={{ minWidth: 100 }}>Plan Tier</th>
                  <th style={{ minWidth: 110 }}>Telemetry</th>
                  <th style={{ minWidth: 110 }}>Joined Date</th>
                  <th style={{ textAlign: 'right', minWidth: 180 }}>Actions</th>
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
                      No creators match your query. Try searching another term or resetting filters.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => {
                    const ext = user as User & { countryCode?: string; city?: string; browser?: string; os?: string; initialUrl?: string; totalEvents?: number };
                    return (
                      <tr
                        key={user.userId}
                        onClick={() => setSelectedUserId(user.userId)}
                        style={{ cursor: 'pointer' }}
                        className="hover:bg-[var(--panel-2)] transition-colors"
                        title="Click to view granular PostHog inspector"
                      >
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 36, height: 36, borderRadius: 10, background: 'var(--panel-2)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                              border: '1px solid var(--line)',
                            }}>
                              <span style={{ color: 'var(--accent)', fontWeight: 800, fontSize: 13, fontFamily: 'Sora, sans-serif' }}>
                                {(user?.firstName?.[0] || user?.email?.[0] || 'C').toUpperCase()}
                                {(user?.lastName?.[0] || '').toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                <p style={{ fontWeight: 700, color: 'var(--text)', fontSize: 13.5 }}>
                                  {user?.firstName || 'Creator'} {user?.lastName || ''}
                                </p>
                                <span className="badge badge-neutral mono-metric" style={{ fontSize: 10, padding: '1px 5px' }}>
                                  ID: {user.distinctId || user.userId}
                                </span>
                              </div>
                              <p className="mono-metric" style={{ fontSize: 11.5, color: 'var(--text-2)' }}>{user?.email || `creator_${user.userId}@talentbridge.cv`}</p>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 16 }}>{COUNTRY_FLAG[ext.countryCode ?? ''] ?? '🌍'}</span>
                            <div>
                              <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600 }}>{user.country}</p>
                              {ext.city && <p style={{ fontSize: 11, color: 'var(--dim)' }}>{ext.city}</p>}
                            </div>
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
                            {ext.totalEvents ?? 1} events
                          </span>
                        </td>

                        <td style={{ fontSize: 12.5, color: 'var(--text-2)' }}>
                          <div>
                            <p style={{ fontWeight: 600, color: 'var(--text)' }}>{formatRelativeTime(user.signupDate)}</p>
                            <p style={{ fontSize: 11, color: 'var(--dim)' }}>{formatDate(user.signupDate)}</p>
                          </div>
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                setActiveRecording({
                                  id: `rec_${user.userId}`,
                                  distinctId: user.distinctId || user.userId,
                                  duration: 39,
                                  activeSeconds: 15,
                                  startTime: new Date().toISOString(),
                                  endTime: new Date().toISOString(),
                                  startUrl: ext.initialUrl || 'https://talentbridge.cv/',
                                  clickCount: 4,
                                  keypressCount: 12,
                                  mouseActivityCount: 45,
                                  viewed: true,
                                  pinned: false,
                                  postHogReplayUrl: `https://eu.i.posthog.com/project/120100/replay/${user.userId}`,
                                  snapshotsUrl: `/api/users/recordings/${user.userId}/snapshots`,
                                });
                              }}
                              className="btn btn-sunset"
                              style={{ padding: '3px 8px', fontSize: 11.5, gap: 4 }}
                              title="Watch In-App Session Replay"
                            >
                              <Play size={11} /> Replay
                            </button>

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
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Tab View B: Live Session Recordings Feed Table ───── */}
      {activeMainTab === 'recordings' && (
        <div className="table-wrap">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Video size={16} color="var(--accent)" />
              <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>
                Live PostHog Session Replays Feed
              </span>
            </div>
            <span className="badge badge-teal" style={{ fontSize: 11 }}>
              {recordingsList.length} recordings captured
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ minWidth: 840 }}>
              <thead>
                <tr>
                  <th style={{ minWidth: 160 }}>Distinct ID</th>
                  <th style={{ minWidth: 260 }}>Visited Page / Route</th>
                  <th style={{ minWidth: 100 }}>Duration</th>
                  <th style={{ minWidth: 120 }}>Activity</th>
                  <th style={{ minWidth: 140 }}>Recorded Time</th>
                  <th style={{ textAlign: 'right', minWidth: 160 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recordingsLoading ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>
                      <div className="spinner" style={{ margin: '0 auto' }} />
                    </td>
                  </tr>
                ) : recordingsList.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: 30, color: 'var(--dim)' }}>
                      No session recordings found in PostHog project #120100.
                    </td>
                  </tr>
                ) : (
                  recordingsList.map(rec => (
                    <tr key={rec.id} className="hover:bg-[var(--panel-2)] transition-colors">
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span className="badge badge-neutral mono-metric" style={{ fontSize: 11 }}>
                            ID: {rec.distinctId}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Globe size={13} color="var(--dim)" />
                          <span
                            className="mono-metric"
                            style={{
                              fontSize: 12,
                              color: 'var(--accent)',
                              maxWidth: 320,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                            title={rec.startUrl}
                          >
                            {rec.startUrl}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span className="mono-metric" style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text)' }}>
                          {rec.duration}s
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--dim)', marginLeft: 4 }}>
                          ({rec.activeSeconds}s active)
                        </span>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span className="badge badge-sunset mono-metric" style={{ fontSize: 10.5 }}>
                            {rec.clickCount} clicks
                          </span>
                          <span className="badge badge-neutral mono-metric" style={{ fontSize: 10.5 }}>
                            {rec.mouseActivityCount} moves
                          </span>
                        </div>
                      </td>

                      <td style={{ fontSize: 12.5, color: 'var(--text-2)' }}>
                        <div>
                          <p style={{ fontWeight: 600, color: 'var(--text)' }}>{formatRelativeTime(rec.startTime)}</p>
                          <p style={{ fontSize: 11, color: 'var(--dim)' }}>{formatDateTime(rec.startTime)}</p>
                        </div>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                          <button
                            onClick={() => setActiveRecording(rec)}
                            className="btn btn-sunset"
                            style={{ padding: '4px 10px', fontSize: 12, gap: 5 }}
                            title="Play in App"
                          >
                            <Play size={12} /> Watch in App
                          </button>

                          <a
                            href={rec.postHogReplayUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-ghost"
                            style={{ padding: '4px 8px', fontSize: 11.5 }}
                            title="Open in PostHog Web"
                          >
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* In-App Interactive Session Replay Player Modal */}
      <SessionReplayModal
        recording={activeRecording}
        onClose={() => setActiveRecording(null)}
      />
    </div>
  );
};
