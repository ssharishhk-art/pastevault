import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { pasteRouter } from './routes/pastes';
import { authRouter } from './routes/auth';
import { logger } from './logger';
import { startCleanupJob } from './cron';

dotenv.config();

export const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

// Root route for backend serverless deployment
app.get('/', (req, res) => {
  res.json({
    message: 'PasteVault REST API Server',
    health: '/health',
    docs: '/api/docs',
    pastes: '/api/pastes'
  });
});

// Serve OpenAPI Docs via CDN assets for Vercel Serverless
try {
  const swaggerDocument = YAML.load(path.join(__dirname, '../../docs/openapi.yaml'));
  const swaggerOptions = {
    customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js'
    ]
  };
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));
} catch (e) {
  logger.warn('OpenAPI spec file not loaded for swagger docs');
}

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/pastes', pasteRouter);
app.use('/api/auth', authRouter);

// Standardized Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// Start cleanup background cron task
startCleanupJob();

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Swagger UI docs available at http://localhost:${PORT}/api/docs`);
  });
}

export default app;
