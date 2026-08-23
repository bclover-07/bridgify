export function registerChatHandlers(socket) {
  socket.on('chat:join', (userId) => {
    if (userId) {
      socket.join(`user:${userId}`);
      console.log(`Socket ${socket.id} joined personal room user:${userId}`);
    }
  });

  socket.on('chat:typing', (data) => {
    if (data.targetUserId) {
      socket.to(`user:${data.targetUserId}`).emit('chat:typing', {
        userId: data.userId,
        conversationId: data.conversationId,
      });
    }
  });
}
