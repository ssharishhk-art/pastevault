import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// On Vercel serverless, copy baseline dev.db sqlite file to writable /tmp directory if needed
const isVercel = Boolean(process.env.VERCEL);
let dbUrl = 'file:./dev.db';

if (isVercel) {
  const tmpDbPath = '/tmp/dev.db';
  const sourceDbPath = path.join(__dirname, '../prisma/dev.db');
  
  try {
    if (!fs.existsSync(tmpDbPath) && fs.existsSync(sourceDbPath)) {
      fs.copyFileSync(sourceDbPath, tmpDbPath);
    }
  } catch (e) {
    // Fallback if file system copy is restricted
  }
  dbUrl = `file:${tmpDbPath}`;
}

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
});
