// src/components/SocialMedia/SocialMediaTrend.tsx
// Line chart visualization of 4-week social media engagement trends across platforms

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { SocialMediaTrendPoint } from '../../types/socialMedia';
import { formatNumber } from '../../utils/formatters';

interface SocialMediaTrendProps {
  data: SocialMediaTrendPoint[];
}

export const SocialMediaTrend: React.FC<SocialMediaTrendProps> = ({ data }) => {
  const [activeLines, setActiveLines] = useState<{
    linkedin: boolean;
    reddit: boolean;
    buffer: boolean;
    total: boolean;
  }>({
    linkedin: true,
    reddit: true,
    buffer: true,
    total: true,
  });

  const toggleLine = (key: keyof typeof activeLines) => {
    setActiveLines((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const chartData = data && data.length > 0 ? data : [
    { week: 'Week 1', linkedin: 240, buffer: 180, reddit: 320, total: 740 },
    { week: 'Week 2', linkedin: 310, buffer: 210, reddit: 450, total: 970 },
    { week: 'Week 3', linkedin: 420, buffer: 290, reddit: 380, total: 1090 },
    { week: 'Week 4', linkedin: 521, buffer: 345, reddit: 580, total: 1446 },
  ];

  return (
    <div
      className="card"
      style={{
        background: 'var(--panel)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius)',
        padding: 24,
      }}
    >
      {/* Chart Header & Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div>
          <h3
            style={{
              fontFamily: 'Sora, sans-serif',
              fontSize: 17,
              fontWeight: 700,
              color: 'var(--text)',
              margin: '0 0 4px 0',
            }}
          >
            Engagement Velocity by Channel
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0 }}>
            Weekly aggregated reactions, comments, and shares over the last 4 weeks
          </p>
        </div>

        {/* Interactive Channel Pill Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => toggleLine('total')}
            className="btn btn-ghost"
            style={{
              fontSize: 12,
              padding: '4px 10px',
              borderRadius: 20,
              background: activeLines.total ? 'var(--sunset-glow)' : 'transparent',
              color: activeLines.total ? 'var(--sunset)' : 'var(--text-2)',
              borderColor: activeLines.total ? 'var(--sunset)' : 'var(--line)',
              borderWidth: 1,
              borderStyle: 'solid',
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--sunset)',
                display: 'inline-block',
                marginRight: 6,
              }}
            />
            Total Velocity
          </button>

          <button
            onClick={() => toggleLine('linkedin')}
            className="btn btn-ghost"
            style={{
              fontSize: 12,
              padding: '4px 10px',
              borderRadius: 20,
              background: activeLines.linkedin ? 'rgba(10, 102, 194, 0.1)' : 'transparent',
              color: activeLines.linkedin ? '#0A66C2' : 'var(--text-2)',
              borderColor: activeLines.linkedin ? '#0A66C2' : 'var(--line)',
              borderWidth: 1,
              borderStyle: 'solid',
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#0A66C2',
                display: 'inline-block',
                marginRight: 6,
              }}
            />
            LinkedIn
          </button>

          <button
            onClick={() => toggleLine('reddit')}
            className="btn btn-ghost"
            style={{
              fontSize: 12,
              padding: '4px 10px',
              borderRadius: 20,
              background: activeLines.reddit ? 'rgba(255, 69, 0, 0.1)' : 'transparent',
              color: activeLines.reddit ? '#FF4500' : 'var(--text-2)',
              borderColor: activeLines.reddit ? '#FF4500' : 'var(--line)',
              borderWidth: 1,
              borderStyle: 'solid',
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#FF4500',
                display: 'inline-block',
                marginRight: 6,
              }}
            />
            Reddit
          </button>

          <button
            onClick={() => toggleLine('buffer')}
            className="btn btn-ghost"
            style={{
              fontSize: 12,
              padding: '4px 10px',
              borderRadius: 20,
              background: activeLines.buffer ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
              color: activeLines.buffer ? 'var(--success)' : 'var(--text-2)',
              borderColor: activeLines.buffer ? 'var(--success)' : 'var(--line)',
              borderWidth: 1,
              borderStyle: 'solid',
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--success)',
                display: 'inline-block',
                marginRight: 6,
              }}
            />
            Buffer
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" opacity={0.6} />
            <XAxis
              dataKey="week"
              stroke="var(--dim)"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: 'var(--line)' }}
            />
            <YAxis
              stroke="var(--dim)"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: 'var(--line)' }}
              tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v)}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div
                      style={{
                        background: 'var(--panel)',
                        border: '1px solid var(--line-2)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '12px 14px',
                        boxShadow: 'var(--shadow-lg)',
                        minWidth: 160,
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 13,
                          color: 'var(--text)',
                          marginBottom: 8,
                          borderBottom: '1px solid var(--line)',
                          paddingBottom: 4,
                        }}
                      >
                        {label}
                      </div>
                      {payload.map((item: any) => (
                        <div
                          key={item.name}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 12,
                            fontSize: 12,
                            marginBottom: 4,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: item.color,
                              }}
                            />
                            <span style={{ color: 'var(--text-2)' }}>{item.name}</span>
                          </div>
                          <span style={{ fontWeight: 700, color: 'var(--text)' }}>
                            {formatNumber(Number(item.value))}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />

            {activeLines.total && (
              <Line
                type="monotone"
                dataKey="total"
                name="Total Engagement"
                stroke="var(--sunset)"
                strokeWidth={3}
                dot={{ r: 4, fill: 'var(--sunset)' }}
                activeDot={{ r: 6, stroke: 'var(--panel)', strokeWidth: 2 }}
              />
            )}

            {activeLines.linkedin && (
              <Line
                type="monotone"
                dataKey="linkedin"
                name="LinkedIn"
                stroke="#0A66C2"
                strokeWidth={2.2}
                dot={{ r: 3.5, fill: '#0A66C2' }}
              />
            )}

            {activeLines.reddit && (
              <Line
                type="monotone"
                dataKey="reddit"
                name="Reddit"
                stroke="#FF4500"
                strokeWidth={2.2}
                dot={{ r: 3.5, fill: '#FF4500' }}
              />
            )}

            {activeLines.buffer && (
              <Line
                type="monotone"
                dataKey="buffer"
                name="Buffer"
                stroke="#10B981"
                strokeWidth={2.2}
                strokeDasharray="4 4"
                dot={{ r: 3.5, fill: '#10B981' }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
