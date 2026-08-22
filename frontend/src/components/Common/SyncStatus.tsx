// src/components/Common/SyncStatus.tsx
// Sync Status indicator component with last sync timestamp, manual trigger button, and error feedback

import React, { useState } from 'react';
import { RefreshCw, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { socialMediaApi } from '../../api/socialMediaApi';

interface SyncStatusProps {
  platform?: 'all' | 'linkedin' | 'reddit' | 'buffer' | 'mailgun';
  lastSyncedAt?: string;
  onSyncCompleted?: () => void;
  className?: string;
}

export const SyncStatus: React.FC<SyncStatusProps> = ({
  platform = 'all',
  lastSyncedAt,
  onSyncCompleted,
  className = '',
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleManualSync = async () => {
    try {
      setIsSyncing(true);
      setSyncStatus('idle');
      setSyncMessage(null);

      const res = await socialMediaApi.triggerManualSync(platform);
      setSyncStatus('success');
      setSyncMessage((res as any)?.message || 'Sync completed successfully');
      
      if (onSyncCompleted) {
        onSyncCompleted();
      }

      setTimeout(() => {
        setSyncStatus('idle');
        setSyncMessage(null);
      }, 4000);
    } catch (err: any) {
      setSyncStatus('error');
      setSyncMessage(err?.message || 'Sync failed. Retry shortly.');
      setTimeout(() => {
        setSyncStatus('idle');
        setSyncMessage(null);
      }, 5000);
    } finally {
      setIsSyncing(false);
    }
  };

  const formatLastSync = (ts?: string) => {
    if (!ts) return 'Just now (Automated)';
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return ts;
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${className}`}
      style={{
        background: 'var(--panel-2)',
        borderColor: syncStatus === 'error' ? '#EF4444' : syncStatus === 'success' ? 'var(--success)' : 'var(--line)',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Pulse Status Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: isSyncing
              ? 'var(--sunset)'
              : syncStatus === 'error'
              ? '#EF4444'
              : 'var(--success)',
            boxShadow: isSyncing
              ? '0 0 0 2px rgba(250, 82, 15, 0.25)'
              : '0 0 0 2px rgba(16, 185, 129, 0.25)',
            display: 'inline-block',
          }}
          className={isSyncing ? 'animate-pulse' : ''}
        />
        <span style={{ color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Clock size={12} color="var(--dim)" />
          <span>Synced: <strong style={{ color: 'var(--text)' }}>{formatLastSync(lastSyncedAt)}</strong></span>
        </span>
      </div>

      <div style={{ width: 1, height: 14, background: 'var(--line)', margin: '0 2px' }} />

      {/* Manual Sync Action Button */}
      <button
        onClick={handleManualSync}
        disabled={isSyncing}
        className="btn-icon"
        style={{
          width: 24,
          height: 24,
          borderRadius: 6,
          background: isSyncing ? 'var(--panel-3)' : 'transparent',
          border: 'none',
          cursor: isSyncing ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isSyncing ? 'var(--accent)' : 'var(--text-2)',
        }}
        title={`Trigger immediate ${platform} sync`}
      >
        <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
      </button>

      {/* Toast Notification message */}
      {syncMessage && (
        <span
          style={{
            fontSize: 11,
            color: syncStatus === 'error' ? '#EF4444' : 'var(--success)',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
          className="animate-fade-in"
        >
          {syncStatus === 'error' ? <AlertCircle size={12} /> : <CheckCircle2 size={12} />}
          {syncMessage}
        </span>
      )}
    </div>
  );
};
