import { getIO } from '../config/socket.js';
import Notification from '../models/Notification.js';

export const registerAlertHandlers = (socket) => {
  socket.on('notification:mark-read', async (data) => {
    try {
      const { notificationId } = data;
      await Notification.findByIdAndUpdate(notificationId, { isRead: true });
    } catch (err) {
      console.error('Socket error marking notification read:', err);
    }
  });
};

export const emitDropoutAlert = (facultyId, data) => {
  const io = getIO();
  io.to(`faculty:${facultyId}`).emit('dropout:alert', data);
};
