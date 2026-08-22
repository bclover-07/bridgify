export const registerDebateHandlers = (socket) => {
  socket.on('debate:join', (data) => {
    socket.join(`debate:${data.debateId}`);
  });
  
  socket.on('debate:turn-change', (data) => {
    socket.to(`debate:${data.debateId}`).emit('debate:current-turn', { speaker: data.speaker });
  });

  socket.on('debate:end', (data) => {
    socket.leave(`debate:${data.debateId}`);
  });
};
