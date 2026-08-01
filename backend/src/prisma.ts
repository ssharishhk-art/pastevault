import { PrismaClient } from '@prisma/client';
import path from 'path';

const dbPath = process.env.VERCEL ? '/tmp/dev.db' : path.join(__dirname, '../prisma/dev.db');

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${dbPath}`,
    },
  },
});
