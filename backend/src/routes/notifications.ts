import { Router } from 'express';
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  deleteNotification,
  getNotificationSettings,
  updateNotificationSettings,
  sendTestEmailAlert,
} from '../controllers/settingsController.js';

export const notificationRouter = Router();

// In-app notifications
notificationRouter.get('/', getNotifications);
notificationRouter.post('/read-all', markAllNotificationsRead);
notificationRouter.post('/:id/read', markNotificationRead);
notificationRouter.delete('/:id', deleteNotification);

// Notification thresholds and email settings
notificationRouter.get('/settings', getNotificationSettings);
notificationRouter.put('/settings', updateNotificationSettings);
notificationRouter.post('/test-email', sendTestEmailAlert);

