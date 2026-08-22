import React, { useState } from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export type AlertSeverity = 'critical' | 'warning' | 'success' | 'info';

export interface MetricAlertBannerProps {
  severity?: AlertSeverity;
  title: string;
  message: string;
  metricLabel?: string;
  metricValue?: string;
  actionText?: string;
  onActionClick?: () => void;
  dismissible?: boolean;
}

const severityConfig: Record<
  AlertSeverity,
  { bg: string; border: string; text: string; badgeBg: string; icon: React.ComponentType<{ className?: string; size?: number; style?: React.CSSProperties }> }
> = {
  critical: {
    bg: 'rgba(239, 68, 68, 0.08)',
    border: 'rgba(239, 68, 68, 0.3)',
    text: '#EF4444',
    badgeBg: 'rgba(239, 68, 68, 0.15)',
    icon: AlertCircle,
  },
  warning: {
    bg: 'rgba(245, 158, 11, 0.08)',
    border: 'rgba(245, 158, 11, 0.3)',
    text: '#F59E0B',
    badgeBg: 'rgba(245, 158, 11, 0.15)',
    icon: AlertTriangle,
  },
  success: {
    bg: 'rgba(45, 212, 191, 0.08)',
    border: 'rgba(45, 212, 191, 0.3)',
    text: '#2DD4BF',
    badgeBg: 'rgba(45, 212, 191, 0.15)',
    icon: CheckCircle2,
  },
  info: {
    bg: 'rgba(59, 130, 246, 0.08)',
    border: 'rgba(59, 130, 246, 0.3)',
    text: '#3B82F6',
    badgeBg: 'rgba(59, 130, 246, 0.15)',
    icon: Info,
  },
};

export const MetricAlertBanner: React.FC<MetricAlertBannerProps> = ({
  severity = 'warning',
  title,
  message,
  metricLabel,
  metricValue,
  actionText,
  onActionClick,
  dismissible = true,
}) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10,
        padding: '12px 14px',
        borderRadius: 'var(--radius-sm)',
        background: config.bg,
        border: `1px solid ${config.border}`,
        backdropFilter: 'blur(8px)',
        transition: 'all 0.2s ease',
      }}
      className="sm:items-center sm:p-4"
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: config.badgeBg,
            color: config.text,
            flexShrink: 0,
            marginTop: 2,
          }}
        >
          <Icon size={16} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 2 }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>
              {title}
            </span>
            {metricLabel && metricValue && (
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 600,
                  padding: '1px 7px',
                  borderRadius: 9999,
                  background: config.badgeBg,
                  color: config.text,
                  wordBreak: 'break-word',
                }}
              >
                {metricLabel}: <strong>{metricValue}</strong>
              </span>
            )}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-2)', margin: 0, lineHeight: 1.4 }}>
            {message}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start' }} className="sm:self-center">
        {actionText && onActionClick && (
          <button
            onClick={onActionClick}
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              border: `1px solid ${config.border}`,
              background: 'var(--panel)',
              color: config.text,
              fontSize: 11.5,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
          >
            {actionText}
          </button>
        )}
        {dismissible && (
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss alert"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 24,
              height: 24,
              background: 'none',
              border: 'none',
              color: 'var(--dim)',
              cursor: 'pointer',
              borderRadius: 4,
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
};
