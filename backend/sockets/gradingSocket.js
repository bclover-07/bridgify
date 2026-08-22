import { getIO } from '../config/socket.js';

export const emitSegUpdated = (studentId, courseId, data) => {
  const io = getIO();
  io.to(`student:${studentId}`).emit('seg:updated', data);
  if (courseId) {
    io.to(`course:${courseId}`).emit('seg:updated', data); // for heatmap updates
  }
};

export const registerGradingHandlers = (socket) => {
  // Grading actions are mostly HTTP, we emit events back to the client from the HTTP controllers
  // e.g. after assessment:graded
};
