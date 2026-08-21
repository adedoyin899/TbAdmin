import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  Download, X, ExternalLink, Sparkles, Layers,
  ChevronRight, CheckCircle2, TrendingUp,
} from 'lucide-react';
import { dashboardApi } from '../../api/dashboardApi';
import type { FeaturesDashboardResponse, BlockAdoption } from '../../types';
import { formatNumber, formatPercentage } from '../../utils/formatters';
import { CHART_COLORS } from '../../config/constants';
import { DateRangeSelector, type DateRangeValue } from '../Common/DateRangeSelector';
import { exportToCsv } from '../../utils/exportCsv';
import { MetricAlertBanner } from '../Common/MetricAlertBanner';
import { useRbac } from '../../utils/rbac';

const PIE_COLORS = ['#0F766E', '#2DD4BF', '#3B82F6', '#8B5CF6'];

const BLOCK_METADATA: Record<string, {
  desc: string;
  engagementBoost: string;
  recruiterClickRate: string;
  bestPractice: string;
  sampleCreators: { name: string; email: string; roomTitle: string; clicks: number }[];
}> = {
  'Skills & Bio': {
    desc: 'Core profile presentation block highlighting creator credentials, summary bio, and tech stack pills.',
    engagementBoost: '+48% higher recruiter dwell time',
    recruiterClickRate: '72% of visitors inspect bio pills',
    bestPractice: 'Keep bio concise (under 200 chars) and list top 6 verified skill tags.',
    sampleCreators: [
      { name: 'Alice Chen', email: 'alice.chen@example.com', roomTitle: 'Lead Product Designer 3D Suite', clicks: 142 },
      { name: 'Kwame Asante', email: 'kwame.asante@example.com', roomTitle: 'Full-Stack Spatial Web Studio', clicks: 98 },
      { name: 'Sarah Jenkins', email: 'sarah.jenkins@example.com', roomTitle: '3D Animator & Motion Portfolio', clicks: 65 },
    ],
  },
  'Featured Works': {
    desc: 'Interactive 3D carousel showcase featuring live project cards, case study PDFs, and video reels.',
    engagementBoost: '+64% higher recruiter inquiry rate',
    recruiterClickRate: '85% of recruiters open at least 1 work modal',
    bestPractice: 'Pin top 3 highest-impact projects with crisp high-res 3D preview cards.',
    sampleCreators: [
      { name: 'Alice Chen', email: 'alice.chen@example.com', roomTitle: 'Lead Product Designer 3D Suite', clicks: 210 },
      { name: 'Chiara Romano', email: 'chiara.romano@example.com', roomTitle: 'Creative Technologist Showcase', clicks: 88 },
    ],
  },
  'Video Intro': {
    desc: 'Embedded 60-second video elevator pitch introducing creator directly to hiring managers.',
    engagementBoost: '+35% response rate on recruiter outreach',
    recruiterClickRate: '54% play video to completion',
    bestPractice: 'Keep video under 90 seconds with clear verbal summary of recent wins.',
    sampleCreators: [
      { name: 'Kwame Asante', email: 'kwame.asante@example.com', roomTitle: 'Full-Stack Spatial Web Studio', clicks: 76 },
    ],
  },
  'Social Links': {
    desc: 'Verified badge links to LinkedIn, GitHub, X (Twitter), Figma Community, and Dribbble.',
    engagementBoost: '+40% outbound network connections',
    recruiterClickRate: '68% click LinkedIn or GitHub',
    bestPractice: 'Verify all profile handles and maintain active work repositories.',
    sampleCreators: [
      { name: 'Alice Chen', email: 'alice.chen@example.com', roomTitle: 'Lead Product Designer 3D Suite', clicks: 112 },
      { name: 'Bob Smith', email: 'bob.smith@example.com', roomTitle: 'AR Experience Showcase', clicks: 42 },
    ],
  },
  'Testimonials': {
    desc: 'Verified peer endorsements and recommendation quotes from previous engineering leads.',
    engagementBoost: '+52% credibility score from recruiters',
    recruiterClickRate: '41% read full testimonial excerpts',
    bestPractice: 'Feature endorsements from senior managers with company names included.',
    sampleCreators: [
      { name: 'Alice Chen', email: 'alice.chen@example.com', roomTitle: 'Lead Product Designer 3D Suite', clicks: 59 },
    ],
  },
  'Certifications': {
    desc: 'Verified cloud architecture, security, and design credentials with verification badges.',
    engagementBoost: '+28% recruiter shortlist rate',
    recruiterClickRate: '36% verify credential links',
    bestPractice: 'Showcase accredited credentials from AWS, Google Cloud, or design institutes.',
    sampleCreators: [
      { name: 'Kwame Asante', email: 'kwame.asante@example.com', roomTitle: 'Full-Stack Spatial Web Studio', clicks: 33 },
    ],
  },
};

export const FeatureDashboard: React.FC = () => {
  const rbac = useRbac();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRangeValue>({ preset: '30d' });
  const [selectedBlock, setSelectedBlock] = useState<BlockAdoption | null>(null);

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
  const blockMeta = selectedBlock ? (BLOCK_METADATA[selectedBlock.blockType] || BLOCK_METADATA['Skills & Bio']) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: 'Geist, sans-serif', fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
            Feature Adoption
          </h2>
          <p style={{ color: 'var(--text-2)', fontSize: 14 }}>
            Analyze creator adoption of profile blocks and 3D environment themes. Click any block row or bar to inspect engagement drill-downs.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <DateRangeSelector
            value={dateRange}
            onChange={setDateRange}
            idPrefix="features-date-range"
          />
          <button
            onClick={handleExportCsv}
            disabled={!blockList.length || !rbac.canExportData}
            className="btn btn-ghost"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              padding: '7px 12px',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-xs)',
              cursor: blockList.length && rbac.canExportData ? 'pointer' : 'not-allowed',
              opacity: !rbac.canExportData ? 0.6 : 1,
            }}
            title={!rbac.canExportData ? 'Export restricted for Viewer role' : 'Export Block Adoption to CSV'}
          >
            <Download size={14} />
            {!rbac.canExportData ? 'Export (Locked)' : 'Export CSV'}
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

      {data && blockList.length === 0 && (
        <div className="card" style={{ padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(45, 212, 191, 0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <Layers size={24} color="#2DD4BF" />
          </div>
          <h3 style={{ fontFamily: 'Geist, sans-serif', fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
            No Block Adoption Telemetry Yet
          </h3>
          <p style={{ color: 'var(--text-2)', fontSize: 13, maxWidth: 460, margin: '0 auto' }}>
            When users customize their 3D showcase rooms by adding Bio, Skills, Project Media, or Spotify embed blocks, adoption breakdown will appear here.
          </p>
        </div>
      )}

      {data && blockList.length > 0 && (
        <div style={{ display: 'grid', gap: 20, alignItems: 'start' }} className="grid-cols-1 lg:grid-cols-[1fr_340px]">
          {/* Block adoption chart */}
          <div className="chart-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'Geist, sans-serif', fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
                Block Adoption (Top 10)
              </h3>
              <span style={{ fontSize: 12, color: 'var(--dim)' }}>Click bar to inspect block details</span>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={blockList}
                layout="vertical"
                margin={{ top: 0, right: 60, left: 80, bottom: 0 }}
                onClick={(state: any) => {
                  if (state && state.activePayload && state.activePayload.length) {
                    setSelectedBlock(state.activePayload[0].payload as BlockAdoption);
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(229,234,239,0.3)" horizontal={false} />
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
              <div
                key={t.theme || i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-xs)',
                  background: 'var(--panel-2)',
                  border: '1px solid var(--line)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600 }}>{t.theme} Mode</span>
                </div>
                <span style={{ fontWeight: 700, color: 'var(--accent)', fontFamily: 'Geist, sans-serif' }}>
                  {formatPercentage(t.percentage)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Block adoption table — Clickable Rows */}
      {data && blockList.length > 0 && (
        <div className="table-wrap">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontFamily: 'Geist, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                Block Adoption Detail
              </h3>
              <p style={{ color: 'var(--text-2)', fontSize: 12 }}>
                Click any block row to inspect recruiter engagement metrics and showcase creator samples
              </p>
            </div>
            <span className="badge badge-neutral" style={{ fontSize: 11 }}>
              Interactive Drill-down
            </span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Block Type</th>
                  <th>Users</th>
                  <th>Adoption Rate</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {blockList.map((block, i) => (
                  <tr
                    key={block.blockType}
                    onClick={() => setSelectedBlock(block)}
                    className="hover:bg-[var(--panel-2)] cursor-pointer transition-colors"
                    title={`Click to inspect ${block.blockType}`}
                  >
                    <td style={{ color: 'var(--faint)', fontFamily: 'Geist Mono, monospace', fontSize: 12 }}>{i + 1}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text)' }}>{block.blockType}</td>
                    <td style={{ fontFamily: 'Geist Mono, monospace', fontWeight: 700 }}>{formatNumber(block.count)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1, height: 6, background: 'var(--line)', borderRadius: 99, overflow: 'hidden', maxWidth: 120 }}>
                          <div style={{ width: `${block.percentage}%`, height: '100%', background: CHART_COLORS.primary, borderRadius: 99 }} />
                        </div>
                        <span style={{ fontWeight: 600, color: CHART_COLORS.primary, minWidth: 36 }}>{formatPercentage(block.percentage)}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 11, gap: 4, display: 'inline-flex' }}>
                        Explore Block <ChevronRight size={12} />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Granular Feature Block Drill-Down Modal ─────────────── */}
      {selectedBlock && blockMeta && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--over)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          className="animate-fade-in"
          onClick={() => setSelectedBlock(null)}
        >
          <div
            style={{
              background: 'var(--panel)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius)',
              width: '100%',
              maxWidth: 720,
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              padding: '24px',
            }}
            className="animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--line)', paddingBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: 'rgba(45, 212, 191, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#2DD4BF',
                  }}
                >
                  <Layers size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ fontFamily: 'Geist, sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                      {selectedBlock.blockType} Block
                    </h3>
                    <span className="badge badge-success" style={{ fontSize: 11 }}>
                      {formatPercentage(selectedBlock.percentage)} Adoption ({formatNumber(selectedBlock.count)} creators)
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-2)', margin: '3px 0 0 0' }}>
                    {blockMeta.desc}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedBlock(null)}
                className="btn-icon"
                style={{ width: 32, height: 32 }}
                title="Close"
              >
                <X size={15} />
              </button>
            </div>

            {/* Block Engagement KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div style={{ padding: '14px', background: 'var(--panel-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--dim)', fontSize: 12, marginBottom: 4 }}>
                  <TrendingUp size={14} color="#2DD4BF" /> Dwell Time Impact
                </div>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', fontFamily: 'Geist, sans-serif', margin: 0 }}>
                  {blockMeta.engagementBoost}
                </p>
              </div>

              <div style={{ padding: '14px', background: 'var(--panel-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--dim)', fontSize: 12, marginBottom: 4 }}>
                  <Sparkles size={14} color="#2DD4BF" /> Recruiter Interaction Rate
                </div>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', fontFamily: 'Geist, sans-serif', margin: 0 }}>
                  {blockMeta.recruiterClickRate}
                </p>
              </div>
            </div>

            {/* Best Practice Tip */}
            <div style={{ padding: '14px 16px', background: 'rgba(45, 212, 191, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(45, 212, 191, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0F766E', fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                <CheckCircle2 size={15} color="#2DD4BF" /> Recommended Best Practice for Creators
              </div>
              <p style={{ fontSize: 13, color: 'var(--text)', margin: 0 }}>
                {blockMeta.bestPractice}
              </p>
            </div>

            {/* Top Creator Showcases Using this Block */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
                  Top Creator Showcases Featuring {selectedBlock.blockType}
                </h4>
                <span style={{ fontSize: 11, color: 'var(--dim)' }}>
                  Live 3D Room Registry
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {blockMeta.sampleCreators.map(c => (
                  <div
                    key={c.email}
                    style={{
                      padding: '10px 14px',
                      background: 'var(--panel-2)',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--line)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 8,
                    }}
                  >
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', margin: 0 }}>
                        {c.name} — <span style={{ color: 'var(--text-2)', fontWeight: 400 }}>"{c.roomTitle}"</span>
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--dim)', margin: '2px 0 0 0', fontFamily: 'Geist Mono, monospace' }}>
                        {c.email} • {c.clicks} block interactions logged
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBlock(null);
                        navigate('/lookup');
                      }}
                      className="btn btn-ghost"
                      style={{ padding: '4px 10px', fontSize: 11, gap: 4 }}
                    >
                      Inspect Creator Profile <ExternalLink size={11} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--line)', paddingTop: 14 }}>
              <button
                type="button"
                onClick={() => setSelectedBlock(null)}
                className="btn btn-primary"
                style={{ padding: '7px 18px', fontSize: 13 }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
