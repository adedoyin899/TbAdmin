import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, X, Check, CheckCheck, Trash2, ArrowRight,
  AlertTriangle, AlertCircle, CheckCircle2, Info,
  SlidersHorizontal,
} from 'lucide-react';
import { useSettings, type AppNotification } from '../../context/SettingsContext';
import { formatRelativeTime } from '../../utils/formatters';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const SEVERITY_CONFIG = {
  critical: {
    bg: 'rgba(239, 68, 68, 0.1)',
    border: 'rgba(239, 68, 68, 0.25)',
    color: '#EF4444',
    icon: AlertCircle,
  },
  warning: {
    bg: 'rgba(245, 158, 11, 0.1)',
    border: 'rgba(245, 158, 11, 0.25)',
    color: '#F59E0B',
    icon: AlertTriangle,
  },
  success: {
    bg: 'rgba(45, 212, 191, 0.1)',
    border: 'rgba(45, 212, 191, 0.25)',
    color: '#2DD4BF',
    icon: CheckCircle2,
  },
  info: {
    bg: 'rgba(59, 130, 246, 0.1)',
    border: 'rgba(59, 130, 246, 0.25)',
    color: '#3B82F6',
    icon: Info,
  },
};

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useSettings();
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'alerts' | 'system'>('all');
  const navigate = useNavigate();

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return !n.isRead;
    if (activeTab === 'alerts') return n.severity === 'critical' || n.severity === 'warning';
    if (activeTab === 'system') return n.category === 'system';
    return true;
  });

  const handleNotificationClick = (n: AppNotification) => {
    markAsRead(n.id);
    if (n.link) {
      navigate(n.link);
      onClose();
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, overflow: 'hidden' }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(3px)',
          transition: 'opacity 0.2s ease',
        }}
        className="animate-fade-in"
      />

      {/* Slide-over Drawer Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: 440,
          background: 'var(--panel)',
          borderLeft: '1px solid var(--line)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 101,
        }}
        className="animate-slide-left"
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '18px 20px',
            borderBottom: '1px solid var(--line)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: 'rgba(45, 212, 191, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent)',
              }}
            >
              <Bell size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontFamily: 'Geist, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
                  Notifications & Alerts
                </h3>
                {unreadCount > 0 && (
                  <span
                    style={{
                      background: 'var(--accent)',
                      color: 'var(--ink)',
                      fontSize: 11,
                      fontWeight: 800,
                      padding: '1px 7px',
                      borderRadius: 99,
                    }}
                  >
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-2)' }}>System events & anomaly trigger logs</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close notification drawer"
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: 'var(--panel-2)',
              border: '1px solid var(--line)',
              color: 'var(--text-2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Filter Tabs & Bulk Actions */}
        <div
          style={{
            padding: '10px 16px',
            borderBottom: '1px solid var(--line)',
            background: 'var(--panel-2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          {/* Mistral Style Pill Tabs */}
          <div className="pill-group">
            {(['all', 'unread', 'alerts', 'system'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pill-tab ${activeTab === tab ? 'active' : ''}`}
                style={{
                  fontSize: 11.5,
                  padding: '4px 10px',
                  textTransform: 'capitalize',
                }}
              >
                {tab === 'alerts' ? 'Alerts' : tab}
              </button>
            ))}
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '4px 8px',
                  borderRadius: 6,
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--accent2)',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                title="Mark all as read"
              >
                <CheckCheck size={13} />
                Read All
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px 6px',
                  borderRadius: 6,
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--dim)',
                  cursor: 'pointer',
                }}
                title="Clear notifications"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredNotifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--dim)' }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'var(--panel-2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px auto',
                  color: 'var(--faint)',
                }}
              >
                <Check size={20} />
              </div>
              <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: 14 }}>All caught up!</p>
              <p style={{ fontSize: 12, marginTop: 4 }}>No notifications found for this filter tab.</p>
            </div>
          ) : (
            filteredNotifications.map(n => {
              const severityCfg = SEVERITY_CONFIG[n.severity] || SEVERITY_CONFIG.info;
              const IconComponent = severityCfg.icon;

              return (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-sm)',
                    background: n.isRead ? 'var(--panel)' : 'var(--panel-2)',
                    border: `1px solid ${n.isRead ? 'var(--line)' : 'var(--line-2)'}`,
                    boxShadow: n.isRead ? 'none' : 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    cursor: n.link ? 'pointer' : 'default',
                    position: 'relative',
                    transition: 'all 0.15s ease',
                  }}
                  className="hover:border-teal-500"
                >
                  {/* Unread indicator dot */}
                  {!n.isRead && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 14,
                        right: 14,
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: 'var(--accent)',
                      }}
                    />
                  )}

                  {/* Notification Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, paddingRight: 16 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: severityCfg.bg,
                        border: `1px solid ${severityCfg.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: severityCfg.color,
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    >
                      <IconComponent size={14} />
                    </div>

                    <div>
                      <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                        {n.title}
                      </h4>
                      <span style={{ fontSize: 11, color: 'var(--faint)' }}>
                        {formatRelativeTime(n.timestamp)}
                      </span>
                    </div>
                  </div>

                  {/* Message body */}
                  <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.45, margin: '2px 0 0 0' }}>
                    {n.message}
                  </p>

                  {/* Trigger rule pill */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: 4,
                        background: 'var(--panel-2)',
                        border: '1px solid var(--line)',
                        color: 'var(--dim)',
                        fontFamily: 'Geist Mono, monospace',
                      }}
                    >
                      {n.triggerRule}
                    </span>

                    {n.link && (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: 'var(--accent2)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        Inspect <ArrowRight size={11} />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer / Link to Settings */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid var(--line)',
            background: 'var(--panel)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: 12, color: 'var(--dim)' }}>
            Configure alert triggers & email rules
          </span>
          <button
            onClick={() => {
              navigate('/settings');
              onClose();
            }}
            className="btn btn-ghost"
            style={{
              padding: '6px 12px',
              fontSize: 12,
              gap: 6,
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-xs)',
              color: 'var(--text)',
            }}
          >
            <SlidersHorizontal size={13} />
            Settings
          </button>
        </div>
      </div>
    </div>
  );
};
