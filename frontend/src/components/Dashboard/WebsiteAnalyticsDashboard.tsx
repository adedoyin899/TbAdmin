import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Globe, Download, FileText } from 'lucide-react';
import { dashboardApi } from '../../api/dashboardApi';
import type { WebsiteDashboardResponse } from '../../types';
import { formatNumber, formatDate } from '../../utils/formatters';
import { DateRangeSelector, type DateRangeValue } from '../Common/DateRangeSelector';
import { exportToCsv } from '../../utils/exportCsv';
import { useRbac } from '../../utils/rbac';

export const WebsiteAnalyticsDashboard: React.FC = () => {
  const rbac = useRbac();
  const [dateRange, setDateRange] = useState<DateRangeValue>({ preset: '30d' });

  const { data, isLoading, error } = useQuery<WebsiteDashboardResponse>({
    queryKey: ['websiteDashboard', dateRange.preset, dateRange.startDate, dateRange.endDate],
    queryFn: () => dashboardApi.getWebsiteDashboard(dateRange.preset) as Promise<WebsiteDashboardResponse>,
  });

  const handleExportCsv = () => {
    if (!data?.topPages?.length) return;
    exportToCsv({
      filename: `talentbridge_website_top_pages_${dateRange.preset}`,
      columns: [
        { header: 'Page Path', accessor: row => row.path },
        { header: 'Views', accessor: row => row.views },
        { header: 'Unique Visitors', accessor: row => row.uniqueVisitors },
        { header: 'Share of Traffic (%)', accessor: row => `${row.percentage}%` },
      ],
      data: data.topPages,
    });
  };

  const hasData = Boolean(data && data.summary && data.summary.totalPageviews > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Toolbar */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 24, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>
              Website Analytics
            </h2>
            <span className="badge badge-teal" style={{ gap: 4 }}>
              <Globe size={11} /> Sitewide
            </span>
          </div>
          <p style={{ color: 'var(--text-2)', fontSize: 13.5 }}>
            How visitors find and move through the whole site — pageviews, top pages, traffic sources, and devices.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap w-full sm:w-auto">
          <DateRangeSelector
            value={dateRange}
            onChange={setDateRange}
            idPrefix="website-date-range"
          />
          <button
            onClick={handleExportCsv}
            disabled={!data?.topPages?.length || !rbac.canExportData}
            className="btn btn-ghost"
            style={{
              fontSize: 13,
              gap: 6,
              opacity: !rbac.canExportData ? 0.6 : 1,
            }}
            title={!rbac.canExportData ? 'Export restricted for Viewer role' : 'Export Top Pages to CSV'}
          >
            <Download size={14} />
            {!rbac.canExportData ? 'Export (Locked)' : 'Export CSV'}
          </button>
        </div>
      </div>

      {isLoading && <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>}
      {error && <div style={{ padding: 20, color: '#EF4444', textAlign: 'center' }}>Failed to load website analytics.</div>}

      {data && !data.postHogConnected ? (
        <div className="card-mistral" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(20, 184, 166, 0.12)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, color: 'var(--accent)' }}>
            <Globe size={24} />
          </div>
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
            PostHog Not Connected
          </h3>
          <p style={{ color: 'var(--text-2)', fontSize: 13.5, maxWidth: 480, margin: '0 auto' }}>
            Add a valid PostHog API key in Settings to pull live sitewide pageview, traffic, and device telemetry.
          </p>
        </div>
      ) : data && !hasData ? (
        <div className="card-mistral" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(20, 184, 166, 0.12)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, color: 'var(--accent)' }}>
            <FileText size={24} />
          </div>
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
            No Pageview Data Yet
          </h3>
          <p style={{ color: 'var(--text-2)', fontSize: 13.5, maxWidth: 480, margin: '0 auto' }}>
            Connected to PostHog, but no $pageview / $autocapture events have arrived for this date range yet. Confirm the client-side snippet (autocapture + capture_pageview) is installed on talentbridge.cv.
          </p>
        </div>
      ) : data && hasData && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            <div className="stat-card">
              <p style={{ fontSize: 11, color: 'var(--dim)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.04em' }}>Total Pageviews</p>
              <p className="mono-metric" style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>{formatNumber(data.summary.totalPageviews)}</p>
            </div>

            <div className="stat-card">
              <p style={{ fontSize: 11, color: 'var(--dim)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.04em' }}>Unique Visitors</p>
              <p className="mono-metric" style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>{formatNumber(data.summary.uniqueVisitors)}</p>
            </div>

            <div className="stat-card">
              <p style={{ fontSize: 11, color: 'var(--dim)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.04em' }}>Sessions</p>
              <p className="mono-metric" style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>{formatNumber(data.summary.totalSessions)}</p>
            </div>

            <div className="stat-card">
              <p style={{ fontSize: 11, color: 'var(--dim)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.04em' }}>Avg Session Duration</p>
              <p className="mono-metric" style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>{data.summary.avgSessionDuration || '—'}</p>
            </div>

            <div className="stat-card">
              <p style={{ fontSize: 11, color: 'var(--dim)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.04em' }}>Bounce Rate</p>
              <p className="mono-metric" style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>{data.summary.bounceRate}%</p>
              <p style={{ fontSize: 11, color: 'var(--dim)', marginTop: 4 }}>Single-pageview visits</p>
            </div>
          </div>

          {/* Pageviews Trend */}
          {data.pageviewsTrend.length > 0 && (
            <div className="card-mistral">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                    Pageviews Over Time
                  </h3>
                  <p style={{ color: 'var(--text-2)', fontSize: 12.5 }}>Sitewide daily pageviews and unique visitors</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: '#14B8A6' }} />
                    <span style={{ color: 'var(--text-2)' }}>Pageviews</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: '#FA520F' }} />
                    <span style={{ color: 'var(--text-2)' }}>Unique Visitors</span>
                  </div>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={data.pageviewsTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="pageviewsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#14B8A6" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="uniqueVisitorsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FA520F" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#FA520F" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} opacity={0.6} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: 'var(--text-2)', fontSize: 11.5 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: string) => formatDate(v)}
                  />
                  <YAxis tick={{ fill: 'var(--dim)', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 12, boxShadow: 'var(--shadow-lg)' }}
                    labelStyle={{ fontWeight: 700, color: 'var(--text)', fontFamily: 'Sora' }}
                    labelFormatter={(v) => formatDate(typeof v === 'string' ? v : undefined)}
                  />
                  <Area type="monotone" dataKey="pageviews" stroke="#14B8A6" strokeWidth={2.6} fillOpacity={1} fill="url(#pageviewsGrad)" name="Pageviews" />
                  <Area type="monotone" dataKey="uniqueVisitors" stroke="#FA520F" strokeWidth={2.6} fillOpacity={1} fill="url(#uniqueVisitorsGrad)" name="Unique Visitors" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Traffic Sources & Devices */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card-mistral" style={{ padding: '20px 22px' }}>
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                Traffic Sources
              </h3>
              <p style={{ color: 'var(--text-2)', fontSize: 12.5, marginBottom: 18 }}>How visitors arrive on the site, sitewide</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {data.trafficSources.length === 0 && <p style={{ fontSize: 12.5, color: 'var(--dim)' }}>No referrer data yet.</p>}
                {data.trafficSources.map(s => (
                  <div key={s.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 5 }}>
                      <span style={{ color: 'var(--text)', fontWeight: 500 }}>{s.name}</span>
                      <span className="mono-metric" style={{ color: 'var(--text)', fontWeight: 600 }}>{s.count}</span>
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

            <div className="card-mistral" style={{ padding: '20px 22px' }}>
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                Device Breakdown
              </h3>
              <p style={{ color: 'var(--text-2)', fontSize: 12.5, marginBottom: 18 }}>Form-factors used by visitors, sitewide</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {data.devices.length === 0 && <p style={{ fontSize: 12.5, color: 'var(--dim)' }}>No device data yet.</p>}
                {data.devices.map(d => (
                  <div key={d.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 5 }}>
                      <span style={{ color: 'var(--text)', fontWeight: 500 }}>{d.name}</span>
                      <span className="mono-metric" style={{ color: 'var(--text)', fontWeight: 600 }}>{d.count}</span>
                    </div>
                    <div style={{ height: 12, background: 'var(--panel-2)', borderRadius: 9999, overflow: 'hidden', border: '1px solid var(--line)' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${d.percentage}%`,
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

          {/* Browsers & OS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card-mistral" style={{ padding: '20px 22px' }}>
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                Browsers
              </h3>
              <p style={{ color: 'var(--text-2)', fontSize: 12.5, marginBottom: 18 }}>Top browsers used, sitewide</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {data.browsers.length === 0 && <p style={{ fontSize: 12.5, color: 'var(--dim)' }}>No browser data yet.</p>}
                {data.browsers.map(b => (
                  <div key={b.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
                    <span style={{ color: 'var(--text)', fontWeight: 500 }}>{b.name}</span>
                    <span className="mono-metric" style={{ color: 'var(--text-2)' }}>{b.count} ({b.percentage}%)</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-mistral" style={{ padding: '20px 22px' }}>
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                Operating Systems
              </h3>
              <p style={{ color: 'var(--text-2)', fontSize: 12.5, marginBottom: 18 }}>Top operating systems, sitewide</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {data.operatingSystems.length === 0 && <p style={{ fontSize: 12.5, color: 'var(--dim)' }}>No OS data yet.</p>}
                {data.operatingSystems.map(o => (
                  <div key={o.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
                    <span style={{ color: 'var(--text)', fontWeight: 500 }}>{o.name}</span>
                    <span className="mono-metric" style={{ color: 'var(--text-2)' }}>{o.count} ({o.percentage}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Pages Table */}
          <div className="table-wrap">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={16} color="var(--accent)" />
                <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
                  Top Pages
                </h3>
              </div>
              <span className="badge badge-teal" style={{ fontSize: 11 }}>Sitewide</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ minWidth: 560 }}>
                <thead>
                  <tr>
                    <th style={{ minWidth: 260 }}>Page Path</th>
                    <th style={{ minWidth: 100 }}>Views</th>
                    <th style={{ minWidth: 120 }}>Unique Visitors</th>
                    <th style={{ minWidth: 120 }}>Share of Traffic</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topPages.map(page => (
                    <tr key={page.path}>
                      <td>
                        <span className="mono-metric" style={{ fontWeight: 600, color: 'var(--text)' }}>{page.path}</span>
                      </td>
                      <td className="mono-metric" style={{ fontWeight: 600 }}>{formatNumber(page.views)}</td>
                      <td className="mono-metric" style={{ fontWeight: 600 }}>{formatNumber(page.uniqueVisitors)}</td>
                      <td>
                        <span className="badge badge-teal mono-metric">{page.percentage}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Geo Traffic */}
          <div className="card-mistral" style={{ padding: '20px 22px' }}>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
              Geographic Traffic
            </h3>
            <p style={{ color: 'var(--text-2)', fontSize: 12.5, marginBottom: 18 }}>Where sitewide visitors are located</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {data.geoTraffic.length === 0 && <p style={{ fontSize: 12.5, color: 'var(--dim)' }}>No geo data yet.</p>}
              {data.geoTraffic.map(g => (
                <div key={g.country}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 5 }}>
                    <span style={{ color: 'var(--text)', fontWeight: 500 }}>{g.flag} {g.country}</span>
                    <span className="mono-metric" style={{ color: 'var(--text)', fontWeight: 600 }}>{g.views}</span>
                  </div>
                  <div style={{ height: 12, background: 'var(--panel-2)', borderRadius: 9999, overflow: 'hidden', border: '1px solid var(--line)' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${g.percentage}%`,
                        background: 'linear-gradient(90deg, #14B8A6, #3B82F6)',
                        borderRadius: 9999,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
