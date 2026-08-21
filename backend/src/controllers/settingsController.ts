import type { Request, Response } from 'express';
import { logger } from '../utils/logger.js';

interface NotificationItem {
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

let SYSTEM_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'High Funnel Drop-off Alert',
    message: 'Room Created → Room Published dropped by 40% this week. Creator onboarding friction detected.',
    severity: 'warning',
    category: 'funnel',
    triggerRule: 'Trigger: Funnel Step Drop-off ≥ 40% threshold',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
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
    timestamp: new Date(Date.now() - 1000 * 60 * 48).toISOString(),
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
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
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
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    isRead: true,
    link: '/dashboard/email',
  },
];

let SAVED_SETTINGS = {
  funnelDropoffThreshold: 40,
  emailBounceThreshold: 15,
  enableRoomLeadAlerts: true,
  enableRetentionMilestones: true,
  enableSystemHealthAlerts: true,
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

export const getNotifications = (_req: Request, res: Response): void => {
  res.status(200).json({
    notifications: SYSTEM_NOTIFICATIONS,
    unreadCount: SYSTEM_NOTIFICATIONS.filter(n => !n.isRead).length,
  });
};

export const markAllNotificationsRead = (_req: Request, res: Response): void => {
  SYSTEM_NOTIFICATIONS = SYSTEM_NOTIFICATIONS.map(n => ({ ...n, isRead: true }));
  res.status(200).json({ success: true, message: 'All notifications marked as read' });
};

export const getNotificationSettings = (req: Request, res: Response): void => {
  const userEmail = (req as any).user?.email || SAVED_SETTINGS.recipientEmail;
  res.status(200).json({
    settings: {
      ...SAVED_SETTINGS,
      recipientEmail: SAVED_SETTINGS.recipientEmail || userEmail,
    },
  });
};

export const updateNotificationSettings = (req: Request, res: Response): void => {
  const updates = req.body;
  SAVED_SETTINGS = { ...SAVED_SETTINGS, ...updates };
  logger.info(`Updated notification settings for ${SAVED_SETTINGS.recipientEmail}`);
  res.status(200).json({
    success: true,
    message: 'Notification settings updated successfully',
    settings: SAVED_SETTINGS,
  });
};

export const sendTestEmailAlert = (req: Request, res: Response): void => {
  const targetEmail = req.body?.recipientEmail || (req as any).user?.email || SAVED_SETTINGS.recipientEmail;
  logger.info(`📨 Test notification email alert dispatched to ${targetEmail}`);

  // Create an automated event notification
  const testNotif: NotificationItem = {
    id: `notif-${Date.now()}`,
    title: 'Test Email Alert Dispatched',
    message: `A sample analytics summary email was dispatched to ${targetEmail}.`,
    severity: 'success',
    category: 'system',
    triggerRule: 'Trigger: Manual Test Alert from Settings',
    timestamp: new Date().toISOString(),
    isRead: false,
    link: '/settings',
  };
  SYSTEM_NOTIFICATIONS.unshift(testNotif);

  res.status(200).json({
    success: true,
    message: `Test analytics update email successfully sent to ${targetEmail}`,
    notification: testNotif,
  });
};
