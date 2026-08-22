import { Server } from 'socket.io';

let io;

export function initializeSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.SOCKET_CORS_ORIGIN || process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('join:room', (rooms) => {
      if (Array.isArray(rooms)) {
        rooms.forEach((room) => {
          socket.join(room);
          console.log(`Socket ${socket.id} joined room: ${room}`);
        });
      } else if (typeof rooms === 'string') {
        socket.join(rooms);
        console.log(`Socket ${socket.id} joined room: ${rooms}`);
      }
    });

    socket.on('notification:mark-read', async (data) => {
      try {
        const { default: Notification } = await import('../models/Notification.js');
        if (data.notificationId) {
          await Notification.findByIdAndUpdate(data.notificationId, { isRead: true });
        } else if (data.userId) {
          await Notification.updateMany({ userId: data.userId, isRead: false }, { isRead: true });
        }
      } catch (error) {
        console.error('Error marking notification read:', error);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${socket.id} (${reason})`);
    });

    // Register modular handlers
    import('../sockets/placementSocket.js').then((m) => m.registerPlacementHandlers(socket)).catch(console.error);
    import('../sockets/gradingSocket.js').then((m) => m.registerGradingHandlers(socket)).catch(console.error);
    import('../sockets/alertSocket.js').then((m) => m.registerAlertHandlers(socket)).catch(console.error);
    import('../sockets/interviewSocket.js').then((m) => m.registerInterviewHandlers(socket)).catch(console.error);
    import('../sockets/debateSocket.js').then((m) => m.registerDebateHandlers(socket)).catch(console.error);
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}
