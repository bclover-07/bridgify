import Notification from '../models/Notification.js';
import { getIO } from '../config/socket.js';

/**
 * Create a notification and emit it via socket.
 */
export async function createNotification({
  userId,
  type,
  title,
  body,
  metadata = {},
  actionUrl = '',
}) {
  const notification = await Notification.create({
    userId,
    type,
    title,
    body,
    metadata,
    actionUrl,
    isRead: false,
  });

  try {
    const io = getIO();
    io.to(`student:${userId}`).emit('notification:new', {
      _id: notification._id,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      metadata: notification.metadata,
      createdAt: notification.createdAt,
    });
  } catch (err) {
    console.error('Notification socket emission failed:', err.message);
  }

  return notification;
}

/**
 * Create notifications for multiple users.
 */
export async function createBulkNotifications(users, notificationData) {
  const notifications = [];
  for (const userId of users) {
    const notification = await createNotification({
      userId,
      ...notificationData,
    });
    notifications.push(notification);
  }
  return notifications;
}

export default { createNotification, createBulkNotifications };
