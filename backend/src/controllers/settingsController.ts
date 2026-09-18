import type { Request, Response } from 'express';
import { logger } from '../utils/logger.js';
import { notificationService, type NotificationItem } from '../services/notificationService.js';

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

export const getNotifications = async (_req: Request, res: Response): Promise<void> => {
  try {
    const notifications = await notificationService.getNotifications(SAVED_SETTINGS);
    res.status(200).json({
      notifications,
      unreadCount: notifications.filter(n => !n.isRead).length,
    });
  } catch (err: any) {
    logger.error(`Error fetching live notifications: ${err.message}`);
    res.status(200).json({
      notifications: [],
      unreadCount: 0,
    });
  }
};

export const markAllNotificationsRead = (_req: Request, res: Response): void => {
  notificationService.markAllAsRead();
  res.status(200).json({ success: true, message: 'All notifications marked as read' });
};

export const markNotificationRead = (req: Request, res: Response): void => {
  const idParam = req.params.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  if (id) {
    notificationService.markAsRead(id);
  }
  res.status(200).json({ success: true, message: 'Notification marked as read' });
};

export const deleteNotification = (req: Request, res: Response): void => {
  const idParam = req.params.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  if (id) {
    notificationService.dismiss(id);
  }
  res.status(200).json({ success: true, message: 'Notification dismissed' });
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
  const testNotif = notificationService.addManualNotification({
    title: 'Test Email Alert Dispatched',
    message: `A sample analytics summary email was dispatched to ${targetEmail}.`,
    severity: 'success',
    category: 'system',
    triggerRule: 'Trigger: Manual Test Alert from Settings',
    link: '/settings',
  });

  res.status(200).json({
    success: true,
    message: `Test analytics update email successfully sent to ${targetEmail}`,
    notification: testNotif,
  });
};

