import { Router } from 'express';
import {
  getNotifications,
  markAllNotificationsRead,
  getNotificationSettings,
  updateNotificationSettings,
  sendTestEmailAlert,
} from '../controllers/settingsController.js';

export const notificationRouter = Router();

// In-app notifications
notificationRouter.get('/', getNotifications);
notificationRouter.post('/read-all', markAllNotificationsRead);

// Notification thresholds and email settings
notificationRouter.get('/settings', getNotificationSettings);
notificationRouter.put('/settings', updateNotificationSettings);
notificationRouter.post('/test-email', sendTestEmailAlert);
