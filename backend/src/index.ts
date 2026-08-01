import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { fileURLToPath } from 'url';

import { logger } from './logger.js';
import { prisma } from './prisma.js';
import { pasteRouter } from './routes/pastes.js';
import { authRouter } from './routes/auth.js';
import { startCleanupJob } from './cron.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Setup Pino HTTP logger
app.use(pinoHttp({ logger }));

// CORS & JSON Parser
app.use(cors());
app.use(express.json());

// Rate Limiter on Paste creation / write endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', apiLimiter);

// Health Check Endpoint
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      database: 'disconnected',
      timestamp: new Date().toISOString(),
    });
  }
});

// OpenAPI Swagger Docs
try {
  const swaggerPath = path.resolve(process.cwd(), '../docs/openapi.yaml');
  const swaggerDocument = YAML.load(swaggerPath);
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (e) {
  logger.warn('OpenAPI specification file could not be loaded for /api/docs');
}

// API Routes
app.use('/api/pastes', pasteRouter);
app.use('/api/auth', authRouter);

// Start Cron background cleanup
startCleanupJob();

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
