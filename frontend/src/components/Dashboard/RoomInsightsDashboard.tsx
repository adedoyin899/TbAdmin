import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Sparkles, ArrowUpRight,
  ArrowDownRight, Trophy,
} from 'lucide-react';
import { dashboardApi } from '../../api/dashboardApi';
import type { RoomsDashboardResponse } from '../../types';
import { formatNumber } from '../../utils/formatters';
import { DateRangeSelector, type DateRangeValue } from '../Common/DateRangeSelector';

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

export const RoomInsightsDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRangeValue>({ preset: '30d' });
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery<RoomsDashboardResponse>({
    queryKey: ['roomsDashboard', dateRange.preset, dateRange.startDate, dateRange.endDate],
    queryFn: () => dashboardApi.getRoomsDashboard(dateRange.preset) as Promise<RoomsDashboardResponse>,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>
              Showcase Room Intelligence
            </h2>
            <span className="badge badge-success" style={{ gap: 4 }}>
              <Sparkles size={11} /> Platform Overview
            </span>
          </div>
          <p style={{ color: 'var(--text-2)', fontSize: 14 }}>
            Systemic analytics, viewer activity, traffic channels, and engagement across all user showcase rooms
          </p>
        </div>

        <DateRangeSelector
          value={dateRange}
          onChange={setDateRange}
          idPrefix="rooms-date-range"
        />
      </div>

      {isLoading && <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>}
      {error && <div style={{ padding: 20, color: '#EF4444', textAlign: 'center' }}>Failed to load data.</div>}

      {data && (
        <>
          {/* Top 6 KPI Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="stat-card">
              <p style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>Total Rooms</p>
              <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', fontFamily: 'Sora' }}>{formatNumber(data.summary.totalRooms)}</p>
              <p style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, marginTop: 4 }}>{data.summary.publishedRooms} Published</p>
            </div>

            <div className="stat-card">
              <p style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>Total Views</p>
              <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', fontFamily: 'Sora' }}>{formatNumber(data.summary.totalViews.count)}</p>
              <span className="badge badge-success" style={{ gap: 2, fontSize: 10, marginTop: 4 }}>
                <ArrowUpRight size={10} /> +{data.summary.totalViews.change}%
              </span>
            </div>

            <div className="stat-card">
              <p style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>Unique Views</p>
              <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', fontFamily: 'Sora' }}>{formatNumber(data.summary.uniqueViews.count)}</p>
              <span className="badge badge-error" style={{ gap: 2, fontSize: 10, marginTop: 4 }}>
                <ArrowDownRight size={10} /> {data.summary.uniqueViews.change}%
              </span>
            </div>

            <div className="stat-card">
              <p style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>Avg Time Spent</p>
              <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', fontFamily: 'Sora' }}>{data.summary.avgTimeSpent.value}</p>
              <span className="badge badge-info" style={{ fontSize: 10, marginTop: 4 }}>
                {data.summary.avgTimeSpent.change}
              </span>
            </div>

            <div className="stat-card">
              <p style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>Avg Engagement</p>
              <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', fontFamily: 'Sora' }}>{data.summary.engagementQuality.percentage}%</p>
              <span className="badge badge-warning" style={{ gap: 2, fontSize: 10, marginTop: 4 }}>
                <ArrowUpRight size={10} /> +{data.summary.engagementQuality.change}%
              </span>
            </div>

            <div className="stat-card">
              <p style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>Publish Rate</p>
              <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent)', fontFamily: 'Sora' }}>
                {Math.round((data.summary.publishedRooms / data.summary.totalRooms) * 100)}%
              </p>
              <p style={{ fontSize: 11, color: 'var(--faint)', marginTop: 4 }}>Rooms live</p>
            </div>
          </div>

          {/* Views Trend Chart */}
          <div className="chart-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                  Macro Views Trend
                </h3>
                <p style={{ color: 'var(--text-2)', fontSize: 12 }}>Platform-wide views trajectory across all published showcase rooms</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: '#FB923C' }} />
                  <span style={{ color: 'var(--text-2)' }}>Total Views (k)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: '#2DD4BF' }} />
                  <span style={{ color: 'var(--text-2)' }}>Unique Views (k)</span>
                </div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data.viewsTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="platformTotalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FB923C" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#FB923C" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="platformUniqueGrad" x1="0" y1="0" x2="0" y2="1">
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
                <Area type="monotone" dataKey="totalViews" stroke="#FB923C" strokeWidth={2.5} fillOpacity={1} fill="url(#platformTotalGrad)" name="Total Views (k)" />
                <Area type="monotone" dataKey="uniqueViews" stroke="#2DD4BF" strokeWidth={2.5} fillOpacity={1} fill="url(#platformUniqueGrad)" name="Unique Views (k)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Traffic Sources & Devices */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Traffic source */}
            <div className="card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                Global Traffic Sources
              </h3>
              <p style={{ color: 'var(--text-2)', fontSize: 12, marginBottom: 18 }}>How viewers across all rooms find talent</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {data.trafficSources.map(s => (
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
                Global Devices Distribution
              </h3>
              <p style={{ color: 'var(--text-2)', fontSize: 12, marginBottom: 18 }}>Operating systems and devices used by viewers</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {data.devices.map(d => (
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

          {/* Top Performing Showcase Rooms Table */}
          <div className="table-wrap">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Trophy size={16} color="var(--accent)" />
                <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
                  Top Performing Showcase Rooms
                </h3>
              </div>
              <span className="badge badge-neutral" style={{ fontSize: 11 }}>Leaderboard</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table>
              <thead>
                <tr>
                  <th>Room Name</th>
                  <th>Creator</th>
                  <th>Total Views</th>
                  <th>Unique Views</th>
                  <th>Engagement</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.topPerformingRooms.map(room => (
                  <tr key={room.roomId}>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--text)' }}>{room.roomName}</span>
                    </td>
                    <td>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 13 }}>{room.ownerName}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-2)' }}>{room.ownerEmail}</p>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{formatNumber(room.views)}</td>
                    <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{formatNumber(room.uniqueViews)}</td>
                    <td>
                      <span className="badge badge-success">{room.engagement}% quality</span>
                    </td>
                    <td>
                      <button
                        onClick={() => navigate('/lookup')}
                        className="btn btn-ghost"
                        style={{ padding: '4px 10px', fontSize: 12, gap: 5 }}
                      >
                        Inspect User <ArrowUpRight size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>

          {/* Platform Peak Engagement Heatmap */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                  Platform Engagement Heatmap
                </h3>
                <p style={{ color: 'var(--text-2)', fontSize: 12 }}>Aggregate view frequency across 24-hour cycles and weekdays</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-2)' }}>
                <span>Low</span>
                {[1, 2, 3, 4].map(lvl => (
                  <div key={lvl} style={{ width: 14, height: 14, borderRadius: 3, background: HEATMAP_BG[lvl] }} />
                ))}
                <span>High</span>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <div style={{ minWidth: 640 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '90px repeat(7, 1fr)', gap: 6, marginBottom: 6 }}>
                  <div />
                  {DAYS.map(day => (
                    <div key={day} style={{ textAlign: 'center', fontWeight: 600, fontSize: 12, color: 'var(--text-2)', padding: '4px 0' }}>
                      {day}
                    </div>
                  ))}
                </div>

                {TIME_SLOTS.map(slot => (
                  <div key={slot} style={{ display: 'grid', gridTemplateColumns: '90px repeat(7, 1fr)', gap: 6, marginBottom: 6 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--faint)', display: 'flex', alignItems: 'center' }}>
                      {slot}
                    </div>
                    {DAYS.map(day => {
                      const cell = data.heatmap.find(h => h.day === day && h.timeSlot === slot);
                      const intensity = cell ? cell.intensity : 1;
                      const val = cell ? (cell.views > 1000 ? `${(cell.views / 1000).toFixed(1)}k` : `${cell.views}`) : '1.8k';

                      return (
                        <div
                          key={day + slot}
                          style={{
                            height: 38,
                            borderRadius: 6,
                            background: HEATMAP_BG[intensity],
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 11,
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
        </>
      )}
    </div>
  );
};
