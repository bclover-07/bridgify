import { getIO } from '../config/socket.js';
import User from '../models/User.js';
import DriveEvent from '../models/DriveEvent.js';

export const registerPlacementHandlers = (socket) => {
  socket.on('placement:move-stage', async (data) => {
    // Expected data: { studentId, driveId, newStage, recruiterId }
    try {
      const io = getIO();
      // Logic for moving stage is typically done via HTTP, but if triggered via socket:
      // In this system, we mostly emit from server, but we can handle client pushes here
      // Broadcast to the drive room
      io.to(`drive:${data.driveId}`).emit('placement:stage-moved', {
        studentId: data.studentId,
        newStage: data.newStage,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Socket error in placement:move-stage', err);
    }
  });
};
