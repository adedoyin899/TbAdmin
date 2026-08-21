import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Download } from 'lucide-react';
import { dashboardApi } from '../../api/dashboardApi';
import type { FeaturesDashboardResponse } from '../../types';
import { formatNumber, formatPercentage } from '../../utils/formatters';
import { CHART_COLORS } from '../../config/constants';
import { DateRangeSelector, type DateRangeValue } from '../Common/DateRangeSelector';
import { exportToCsv } from '../../utils/exportCsv';
import { MetricAlertBanner } from '../Common/MetricAlertBanner';

const PIE_COLORS = ['#0D1F1E', '#2DD4BF'];

export const FeatureDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRangeValue>({ preset: '30d' });

  const { data, isLoading, error } = useQuery<FeaturesDashboardResponse>({
    queryKey: ['features', dateRange.preset, dateRange.startDate, dateRange.endDate],
    queryFn: () => dashboardApi.getFeatures(dateRange.preset) as Promise<FeaturesDashboardResponse>,
  });

  const blockList = data?.blockAdoption || [];
  const themeList = data?.themeDistribution || [];

  const handleExportCsv = () => {
    if (!blockList.length) return;
    exportToCsv({
      filename: `talentbridge_feature_adoption_${dateRange.preset}`,
      columns: [
        { header: 'Block Type', accessor: row => row.blockType },
        { header: 'User Count', accessor: row => row.count },
        { header: 'Adoption Rate (%)', accessor: row => `${row.percentage}%` },
      ],
      data: blockList,
    });
  };

  const topBlock = blockList[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: 'Geist, sans-serif', fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
            Feature Adoption
          </h2>
          <p style={{ color: 'var(--text-2)', fontSize: 14 }}>Which content blocks and themes are users choosing?</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <DateRangeSelector
            value={dateRange}
            onChange={setDateRange}
            idPrefix="features-date-range"
          />
          <button
            onClick={handleExportCsv}
            disabled={!blockList.length}
            className="btn btn-ghost"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              padding: '7px 12px',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-xs)',
              cursor: blockList.length ? 'pointer' : 'not-allowed',
            }}
            title="Export Block Adoption to CSV"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Feature Health / Highlight Banner */}
      {data && topBlock && topBlock.percentage >= 60 && (
        <MetricAlertBanner
          severity="success"
          title="Strong Core Feature Engagement"
          metricLabel="Top Block"
          metricValue={`${topBlock.blockType} (${formatPercentage(topBlock.percentage)})`}
          message={`Creator adoption is highly concentrated on ${topBlock.blockType}. Consider offering expanded templates for this block.`}
        />
      )}

      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner" />
        </div>
      )}
      {error && <div style={{ padding: 20, color: '#EF4444', textAlign: 'center' }}>Failed to load data.</div>}

      {data && (
        <div style={{ display: 'grid', gap: 20, alignItems: 'start' }} className="grid-cols-1 lg:grid-cols-[1fr_340px]">
          {/* Block adoption chart */}
          <div className="chart-container">
            <h3 style={{ fontFamily: 'Geist, sans-serif', fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 20 }}>
              Block Adoption (Top 10)
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={blockList}
                layout="vertical"
                margin={{ top: 0, right: 60, left: 80, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(229,234,239,0.4)" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`}
                  tick={{ fill: 'var(--text-2)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="blockType"
                  tick={{ fill: 'var(--text-2)', fontSize: 13, fontFamily: 'Geist, sans-serif' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v: unknown) => [`${v}%`, 'Adoption']}
                  contentStyle={{
                    background: 'var(--panel)', border: '1px solid var(--line)',
                    borderRadius: 10, fontFamily: 'Geist, sans-serif',
                  }}
                  labelStyle={{ fontWeight: 700, color: 'var(--text)', fontFamily: 'Geist, sans-serif' }}
                />
                <Bar dataKey="percentage" radius={[0, 6, 6, 0]} fill={CHART_COLORS.primary}
                  label={{ position: 'right', formatter: (v: unknown) => `${v}%`, fill: 'var(--text-2)', fontSize: 12 }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Theme distribution */}
          <div className="chart-container" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h3 style={{ fontFamily: 'Geist, sans-serif', fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
              Theme Distribution
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={themeList}
                  dataKey="percentage"
                  nameKey="theme"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                  paddingAngle={3}
                >
                  {themeList.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  formatter={(value) => <span style={{ color: 'var(--text-2)', fontSize: 13 }}>{value}</span>}
                />
                <Tooltip
                  formatter={(v: unknown) => [`${v}%`]}
                  contentStyle={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 10 }}
                />
              </PieChart>
            </ResponsiveContainer>
            {themeList.map((t, i) => (
              <div key={t.theme || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span style={{ fontSize: 14, color: 'var(--text-2)' }}>{t.theme}</span>
                </div>
                <span style={{ fontWeight: 700, color: 'var(--text)', fontFamily: 'Geist, sans-serif' }}>
                  {formatPercentage(t.percentage)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Block adoption table */}
      {data && (
        <div className="table-wrap">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)' }}>
            <h3 style={{ fontFamily: 'Geist, sans-serif', fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
              Block Adoption Detail
            </h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Block Type</th>
                <th>Users</th>
                <th>Adoption Rate</th>
              </tr>
            </thead>
            <tbody>
              {blockList.map((block, i) => (
                <tr key={block.blockType}>
                  <td style={{ color: 'var(--faint)', fontFamily: 'Geist Mono, monospace', fontSize: 12 }}>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{block.blockType}</td>
                  <td style={{ fontFamily: 'Geist Mono, monospace' }}>{formatNumber(block.count)}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1, height: 6, background: 'var(--line)', borderRadius: 99, overflow: 'hidden', maxWidth: 120 }}>
                        <div style={{ width: `${block.percentage}%`, height: '100%', background: CHART_COLORS.primary, borderRadius: 99 }} />
                      </div>
                      <span style={{ fontWeight: 600, color: CHART_COLORS.primary, minWidth: 36 }}>{formatPercentage(block.percentage)}</span>
                    </div>
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
};
