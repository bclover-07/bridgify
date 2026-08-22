import { getIO } from '../config/socket.js';

export const registerInterviewHandlers = (socket) => {
  socket.on('interview:join', (data) => {
    socket.join(`interview:${data.interviewId}`);
  });
  
  socket.on('interview:posture-warning', (data) => {
    // Forward MediaPipe posture warnings to the frontend state
    socket.emit('interview:alert', { message: 'Please adjust your posture.', timestamp: Date.now() });
  });

  socket.on('interview:end', (data) => {
    socket.leave(`interview:${data.interviewId}`);
  });
};
