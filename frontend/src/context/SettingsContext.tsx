import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

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
  clearNotifications: () => void;
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

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'High Funnel Drop-off Alert',
    message: 'Room Created → Room Published dropped by 40% this week. Creator onboarding assistance recommended.',
    severity: 'warning',
    category: 'funnel',
    triggerRule: 'Trigger: Funnel Step Drop-off ≥ 40% threshold',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(), // 12 mins ago
    isRead: false,
    link: '/dashboard/funnel',
  },
  {
    id: 'notif-2',
    title: 'High-Value Lead in Showcase Room',
    message: 'Senior Director from Spotify spent 8m 45s viewing "Design Engineering Reel 2026".',
    severity: 'info',
    category: 'rooms',
    triggerRule: 'Trigger: High-Value Recruiter / Exec Room Lead detected',
    timestamp: new Date(Date.now() - 1000 * 60 * 48).toISOString(), // 48 mins ago
    isRead: false,
    link: '/dashboard/rooms',
  },
  {
    id: 'notif-3',
    title: 'Weekly Retention Benchmark Achieved',
    message: '7-Day returning creator retention reached 42% (+3.5% week-over-week growth).',
    severity: 'success',
    category: 'retention',
    triggerRule: 'Trigger: Retention milestone exceeded (+3% WoW gain)',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    isRead: false,
    link: '/dashboard/retention',
  },
  {
    id: 'notif-4',
    title: 'Elevated Email Bounces on Welcome Campaign',
    message: '18 bounce events recorded via Mailgun webhook. Domain sender reputation check advised.',
    severity: 'critical',
    category: 'email',
    triggerRule: 'Trigger: Campaign Bounces > 15 bounce threshold',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
    isRead: true,
    link: '/dashboard/email',
  },
  {
    id: 'notif-5',
    title: 'PostHog Cache Fallback Active',
    message: 'In-memory cache fallback operational while local Redis was offline. No telemetry lost.',
    severity: 'info',
    category: 'system',
    triggerRule: 'Trigger: Database / in-memory cache resilience trigger',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    isRead: true,
  },
];

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

  // Keep recipientEmail synced with logged-in user if not customized
  useEffect(() => {
    if (user?.email && settings.recipientEmail === DEFAULT_SETTINGS.recipientEmail) {
      setSettings(prev => ({ ...prev, recipientEmail: user.email }));
    }
  }, [user]);

  // Load notifications from localStorage
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('talentbridge_notifications');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse notifications from localStorage', e);
    }
    return INITIAL_NOTIFICATIONS;
  });

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
    const updated = notifications.map(n => (n.id === id ? { ...n, isRead: true } : n));
    saveNotifications(updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    saveNotifications(updated);
  };

  const clearNotifications = () => {
    saveNotifications([]);
  };

  const addNotification = (item: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotif: AppNotification = {
      ...item,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    saveNotifications([newNotif, ...notifications]);
  };

  const sendTestEmailAlert = async (): Promise<{ success: boolean; message: string }> => {
    // Simulate / Trigger backend API email
    await new Promise(resolve => setTimeout(resolve, 600));

    // Create a new notification entry confirming the dispatch
    addNotification({
      title: 'Test Email Update Dispatched',
      message: `A test analytics update was delivered to ${settings.recipientEmail} (${settings.emailFrequency} digest schedule).`,
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
        clearNotifications,
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
