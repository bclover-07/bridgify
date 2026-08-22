import dotenv from 'dotenv';
dotenv.config();

import connectDB from './config/db.js';
import { httpServer } from './app.js';
import { initializeCronJobs } from './config/cron.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();
    initializeCronJobs();

    httpServer.listen(PORT, () => {
      console.log(`Bridgify server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
}

startServer();
