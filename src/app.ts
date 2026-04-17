import express, { Request, Response } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth';
import eventRoutes from './routes/events';
import userRoutes from './routes/users';
import skillRoutes from './routes/skills';
import dashboardRoutes from './routes/dashboard';
import revenueRoutes from './routes/revenue';

const app = express();
// All origins are allowed: this is a mobile-first API consumed by native Expo
// clients that do not enforce browser CORS restrictions. Expo Web is also
// supported without a fixed origin. If a web-only front-end is added later,
// restrict origins via the CORS_ORIGIN environment variable.
const allowedOrigin = process.env.CORS_ORIGIN;
app.use(cors(allowedOrigin ? { origin: allowedOrigin } : undefined));
app.use(express.json());

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

app.use('/', dashboardRoutes);
app.use('/auth', authRoutes);
app.use('/events', eventRoutes);
app.use('/users', userRoutes);
app.use('/skills', skillRoutes);
app.use('/revenue', revenueRoutes);

export default app;
