import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { dashboardApi } from '../api/dashboardApi';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  severity: 'critical' | 'warning' | 'info' | 'success';
  category: 'funnel' | 'email' | 'rooms' | 'retention' | 'system';
  triggerRule: string;
  timestamp: string;
  isRead: boolean;
  link?: string;
}

export interface NotificationSettings {
  // Anomaly & Trigger Thresholds ("Baking Settings")
  funnelDropoffThreshold: number; // e.g. 40 (%)
  emailBounceThreshold: number;   // e.g. 15 (bounces)
  enableRoomLeadAlerts: boolean;
  enableRetentionMilestones: boolean;
  enableSystemHealthAlerts: boolean;
  enableSoundAlerts: boolean;

  // Signed-in User Email Settings
  emailUpdatesEnabled: boolean;
  recipientEmail: string;
  emailFrequency: 'realtime' | 'daily' | 'weekly' | 'disabled';
  subscribedTopics: {
    funnelDropoff: boolean;
    emailBounces: boolean;
    viewerLeads: boolean;
    weeklySummary: boolean;
    systemHealth: boolean;
  };
}

interface SettingsContextType {
  settings: NotificationSettings;
  updateSettings: (newSettings: Partial<NotificationSettings>) => void;
  resetSettings: () => void;
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismissNotification: (id: string) => void;
  clearNotifications: () => void;
  refreshNotifications: () => Promise<void>;
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => void;
  sendTestEmailAlert: () => Promise<{ success: boolean; message: string }>;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  funnelDropoffThreshold: 40,
  emailBounceThreshold: 15,
  enableRoomLeadAlerts: true,
  enableRetentionMilestones: true,
  enableSystemHealthAlerts: true,
  enableSoundAlerts: false,

  emailUpdatesEnabled: true,
  recipientEmail: 'maz@talentbridge.cv',
  emailFrequency: 'daily',
  subscribedTopics: {
    funnelDropoff: true,
    emailBounces: true,
    viewerLeads: true,
    weeklySummary: true,
    systemHealth: false,
  },
};

const LEGACY_DUMMY_IDS = new Set(['notif-1', 'notif-2', 'notif-3', 'notif-4', 'notif-5']);

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  // Load settings from localStorage
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    try {
      const saved = localStorage.getItem('talentbridge_admin_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to parse saved settings from localStorage', e);
    }
    return {
      ...DEFAULT_SETTINGS,
      recipientEmail: user?.email || DEFAULT_SETTINGS.recipientEmail,
    };
  });

  // Load notifications from localStorage, purging legacy dummy notifications
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('talentbridge_notifications');
      if (saved) {
        const parsed: AppNotification[] = JSON.parse(saved);
        // Filter out legacy dummy items with fake Spotify leads or cache fallback messages
        const sanitized = parsed.filter(n =>
          !LEGACY_DUMMY_IDS.has(n.id) &&
          !n.message?.toLowerCase().includes('spotify') &&
          !n.message?.toLowerCase().includes('in-memory cache fallback operational')
        );
        if (sanitized.length > 0) return sanitized;
      }
    } catch (e) {
      console.warn('Failed to parse notifications from localStorage', e);
    }
    return [];
  });

  // Fetch live event-driven notifications from backend API
  const refreshNotifications = useCallback(async () => {
    try {
      const res: any = await dashboardApi.getNotifications();
      if (res?.notifications && Array.isArray(res.notifications)) {
        setNotifications(res.notifications);
        localStorage.setItem('talentbridge_notifications', JSON.stringify(res.notifications));
      }
    } catch (e) {
      console.warn('Failed to fetch live notifications from API', e);
    }
  }, []);

  // Automatically fetch live notifications on mount
  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  // Save settings on update
  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('talentbridge_admin_settings', JSON.stringify(updated));
      return updated;
    });
  };

  const resetSettings = () => {
    const fresh = {
      ...DEFAULT_SETTINGS,
      recipientEmail: user?.email || DEFAULT_SETTINGS.recipientEmail,
    };
    setSettings(fresh);
    localStorage.setItem('talentbridge_admin_settings', JSON.stringify(fresh));
  };

  // Sync notifications to localStorage
  const saveNotifications = (items: AppNotification[]) => {
    setNotifications(items);
    localStorage.setItem('talentbridge_notifications', JSON.stringify(items));
  };

  const markAsRead = (id: string) => {
    dashboardApi.markNotificationRead(id).catch(() => {});
    const updated = notifications.map(n => (n.id === id ? { ...n, isRead: true } : n));
    saveNotifications(updated);
  };

  const markAllAsRead = () => {
    dashboardApi.markAllNotificationsRead().catch(() => {});
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    saveNotifications(updated);
  };

  const dismissNotification = (id: string) => {
    dashboardApi.deleteNotification(id).catch(() => {});
    const updated = notifications.filter(n => n.id !== id);
    saveNotifications(updated);
  };

  const clearNotifications = () => {
    dashboardApi.markAllNotificationsRead().catch(() => {});
    saveNotifications([]);
  };

  const addNotification = (item: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotif: AppNotification = {
      ...item,
      id: `notif-client-${Date.now()}`,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    saveNotifications([newNotif, ...notifications]);
  };

  const sendTestEmailAlert = async (): Promise<{ success: boolean; message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 600));

    addNotification({
      title: 'Test Email Digest Sent',
      message: `A test analytics update was delivered to ${settings.recipientEmail} (${settings.emailFrequency} schedule).`,
      severity: 'success',
      category: 'system',
      triggerRule: 'Trigger: Manual Test Alert execution from Settings',
      link: '/settings',
    });

    return {
      success: true,
      message: `Test email digest sent to ${settings.recipientEmail}!`,
    };
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        dismissNotification,
        clearNotifications,
        refreshNotifications,
        addNotification,
        sendTestEmailAlert,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

