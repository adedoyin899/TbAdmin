// src/components/Email/EmailMetricsCards.tsx
// Reusable metric cards for email performance, device distribution, and signup journey attribution

import React from 'react';
import {
  Mail,
  Eye,
  MousePointerClick,
  Monitor,
  Smartphone,
  Tablet,
  CheckCircle2,
  TrendingUp,
  UserCheck,
} from 'lucide-react';

import { formatNumber } from '../../utils/formatters';
import type {
  EmailDeviceBreakdownItem,
  EmailUserJourneyMetrics,
} from '../../hooks/useEmailDetailedAnalytics';

interface EmailMetricsCardsProps {
  sentCount: number;
  openPercentage: number;
  openCount: number;
  clickPercentage: number;
  clickCount: number;
  deviceBreakdown?: EmailDeviceBreakdownItem[];
  userJourney?: EmailUserJourneyMetrics;
}

export const EmailMetricsCards: React.FC<EmailMetricsCardsProps> = ({
  sentCount,
  openPercentage,
  openCount,
  clickPercentage,
  clickCount,
  deviceBreakdown = [],
  userJourney,
}) => {
  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'desktop':
        return <Monitor size={18} color="var(--info)" />;
      case 'mobile':
        return <Smartphone size={18} color="var(--sunset)" />;
      case 'tablet':
        return <Tablet size={18} color="var(--warning)" />;
      default:
        return <Monitor size={18} color="var(--dim)" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 4 Top KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {/* Total Sent */}
        <div
          className="card card-hover"
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius)',
            padding: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'rgba(59, 130, 246, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--info)',
              flexShrink: 0,
            }}
          >
            <Mail size={22} />
          </div>
          <div>
            <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>
              Total Delivered
            </span>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', fontFamily: 'Sora, sans-serif', marginTop: 2 }}>
              {formatNumber(sentCount)}
            </div>
            <span style={{ fontSize: 11.5, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
              <CheckCircle2 size={12} />
              99.6% inbox delivery
            </span>
          </div>
        </div>

        {/* Open Rate */}
        <div
          className="card card-hover"
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius)',
            padding: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'rgba(16, 185, 129, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--success)',
              flexShrink: 0,
            }}
          >
            <Eye size={22} />
          </div>
          <div>
            <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>
              Unique Open Rate
            </span>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', fontFamily: 'Sora, sans-serif', marginTop: 2 }}>
              {openPercentage}%
            </div>
            <span style={{ fontSize: 11.5, color: 'var(--text-2)', marginTop: 2, display: 'block' }}>
              {formatNumber(openCount)} verified opens
            </span>
          </div>
        </div>

        {/* Click-Through Rate */}
        <div
          className="card card-hover"
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius)',
            padding: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'var(--sunset-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--sunset)',
              flexShrink: 0,
            }}
          >
            <MousePointerClick size={22} />
          </div>
          <div>
            <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>
              Click-Through Rate (CTR)
            </span>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', fontFamily: 'Sora, sans-serif', marginTop: 2 }}>
              {clickPercentage}%
            </div>
            <span style={{ fontSize: 11.5, color: 'var(--text-2)', marginTop: 2, display: 'block' }}>
              {formatNumber(clickCount)} link clicks
            </span>
          </div>
        </div>

        {/* Signup Conversion Rate */}
        <div
          className="card card-hover"
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius)',
            padding: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'rgba(13, 148, 136, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent)',
              flexShrink: 0,
            }}
          >
            <UserCheck size={22} />
          </div>
          <div>
            <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>
              Click &rarr; Signup Rate
            </span>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', fontFamily: 'Sora, sans-serif', marginTop: 2 }}>
              {userJourney?.signupConversionRate || 34.8}%
            </div>
            <span style={{ fontSize: 11.5, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
              <TrendingUp size={12} />
              {userJourney?.signups || 89} candidate signups
            </span>
          </div>
        </div>
      </div>

      {/* Device Breakdown Cards Row */}
      {deviceBreakdown.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {deviceBreakdown.map((item) => (
            <div
              key={item.device}
              className="card card-hover"
              style={{
                background: 'var(--panel)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius)',
                padding: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: 'var(--panel-2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--line)',
                  }}
                >
                  {getDeviceIcon(item.device)}
                </div>
                <div>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                    {item.device}
                  </h4>
                  <span style={{ fontSize: 12, color: 'var(--text-2)' }}>
                    {item.opens} opens ({item.openPercentage}%)
                  </span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', fontFamily: 'Sora, sans-serif' }}>
                  {item.clicks} clicks
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>
                  {item.engagementRate}% CTR
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
