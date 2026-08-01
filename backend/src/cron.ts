import cron from 'node-cron';
import { prisma } from './prisma.js';
import { logger } from './logger.js';

export function startCleanupJob() {
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      const now = new Date();
      const deleted = await prisma.paste.deleteMany({
        where: {
          expiresAt: {
            lte: now,
          },
        },
      });
      if (deleted.count > 0) {
        logger.info({ count: deleted.count }, 'Cleaned up expired pastes');
      }
    } catch (error) {
      logger.error({ error }, 'Error running paste cleanup cron job');
    }
  });
  logger.info('Auto-expiration cleanup cron job scheduled (every 5m)');
}
