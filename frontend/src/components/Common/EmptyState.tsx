// src/components/Common/EmptyState.tsx
// Reusable empty state view when search queries, filters, or platforms return zero records

import React from 'react';
import { Layers, Plus, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
}) => {
  return (
    <div
      className={`card animate-fade-in ${className}`}
      style={{
        background: 'var(--panel)',
        border: '1px dashed var(--line-2)',
        borderRadius: 'var(--radius)',
        padding: '48px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        minHeight: 280,
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: 'var(--panel-2)',
          border: '1px solid var(--line)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--dim)',
          marginBottom: 4,
        }}
      >
        {icon || <Layers size={26} strokeWidth={1.7} />}
      </div>

      <h3
        style={{
          fontFamily: 'Sora, sans-serif',
          fontSize: 16,
          fontWeight: 700,
          color: 'var(--text)',
          margin: 0,
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: 13,
          color: 'var(--text-2)',
          maxWidth: 400,
          lineHeight: 1.5,
          margin: 0,
        }}
      >
        {description}
      </p>

      {(actionLabel || secondaryActionLabel) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
          {actionLabel && (
            <button
              onClick={onAction}
              className="btn btn-primary"
              style={{ fontSize: 12.5, padding: '7px 14px', gap: 6 }}
            >
              <Plus size={14} />
              {actionLabel}
            </button>
          )}

          {secondaryActionLabel && (
            <button
              onClick={onSecondaryAction}
              className="btn btn-ghost"
              style={{ fontSize: 12.5, padding: '7px 14px', gap: 6, border: '1px solid var(--line)' }}
            >
              <RefreshCw size={13} />
              {secondaryActionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
