import cron from 'node-cron';
import { runSEGConsistency } from '../agents/14-segConsistency.js';

export function initCronJobs() {
  cron.schedule('0 2 * * *', async () => {
    console.log('[CRON] Running nightly SEG consistency check...');
    try {
      const result = await runSEGConsistency({});
      console.log(`[CRON] SEG consistency complete: ${result.report.anomaliesFound} anomalies, ${result.report.entriesDecayed} entries decayed`);
    } catch (error) {
      console.error('[CRON] SEG consistency failed:', error.message);
    }
  }, { timezone: 'Asia/Kolkata' });

  cron.schedule('0 6 * * 1', async () => {
    console.log('[CRON] Weekly notification digest...');
  }, { timezone: 'Asia/Kolkata' });

  console.log('[CRON] Scheduled jobs initialized');
}

export default { initCronJobs };
