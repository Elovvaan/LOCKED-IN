import express, { Request, Response } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth';
import eventRoutes from './routes/events';
import userRoutes from './routes/users';
import skillRoutes from './routes/skills';
import revenueRoutes from './routes/revenue';
import sweepstakesRoutes from './routes/sweepstakes';

const app = express();
// All origins are allowed for native/mobile clients by default.
// If you need to restrict browser origins, set CORS_ORIGIN.
const allowedOrigin = process.env.CORS_ORIGIN;
app.use(cors(allowedOrigin ? { origin: allowedOrigin } : undefined));
app.use(express.json());

const apiManifest = {
  api: 'LOCKED-IN',
  version: '1.0.0',
  status: 'ok',
  endpoints: [
    'GET  /health',
    'GET  /',
    'GET  /api',
    'GET  /backend',
    'ANY  /auth/*',
    'ANY  /users/*',
    'ANY  /events/*',
    'ANY  /skills/*',
    'ANY  /revenue/*',
    'ANY  /sweepstakes/*',
    'POST /auth/register',
    'POST /auth/login',
    'GET  /events',
    'POST /events',
    'GET  /users/:id/profile',
    'GET  /skills',
    'POST /skills',
  ],
};

// Rate limiting - skip in test environment
if (process.env.NODE_ENV !== 'test') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    // 500 req / 15 min per IP supports continuous feed + battle polling
    // (feed: ~4 req/min at 15 s intervals, battle: ~12 req/min at 5 s intervals)
    // without triggering 429s for normal in-app activity
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);
}

// Health check — used by Railway and uptime monitors
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (_req: Request, res: Response) => {
  res.json({
    service: 'LOCKED-IN backend',
    routes: {
      health: '/health',
      api: '/api',
      backend: '/backend',
    },
  });
});

app.get('/api', (_req: Request, res: Response) => {
  res.json(apiManifest);
});

app.get('/backend', (_req: Request, res: Response) => {
  res.json(apiManifest);
});

app.use('/auth', authRoutes);
app.use('/events', eventRoutes);
app.use('/users', userRoutes);
app.use('/skills', skillRoutes);
app.use('/revenue', revenueRoutes);
app.use('/sweepstakes', sweepstakesRoutes);

export default app;
