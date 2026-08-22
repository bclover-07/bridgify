import cron from 'node-cron';
import { runSegConsistency } from '../agents/14-segConsistency.js';
import Institution from '../models/Institution.js';
import User from '../models/User.js';

export function initializeCronJobs() {
  // Run SEG Consistency Audit every night at 2:00 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('Starting nightly SEG Consistency Audit...');
    try {
      const institutions = await Institution.find({}).select('_id');
      const systemAdmin = await User.findOne({ role: 'admin' }).select('_id');
      const userId = systemAdmin ? systemAdmin._id : null;

      for (const inst of institutions) {
        await runSegConsistency({ institutionId: inst._id, userId });
      }
      console.log('Nightly SEG Consistency Audit completed.');
    } catch (error) {
      console.error('Nightly SEG Consistency Audit failed:', error);
    }
  });

  console.log('Cron jobs initialized.');
}
