import cors from 'cors';
import express, { Request, Response } from 'express';

import { errorMiddleware, notFoundHandler } from './middleware/errorMiddleware';
import { adminAuthRoutes } from './routes/adminRoutes';
import { formRoutes } from './routes/formRoutes';
import { publicClientReviewRoutes, adminClientReviewRoutes } from './routes/clientReviewRoutes';
import { publicReviewRoutes, adminReviewRoutes } from './routes/reviewRoutes';
import { adminSettingsRoutes, publicSettingsRoutes } from './routes/settingsRoutes';

const app = express();

/* Do not advertise the framework in response headers. */
app.disable('x-powered-by');

/* Accept the Vite dev server on any localhost port in the 5173-5179 range. */
const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';
const allowedOrigins = [frontendUrl];
for (let p = 5173; p <= 5179; p++) {
  allowedOrigins.push(`http://localhost:${p}`);
}

app.use(
  cors({
    origin: (origin, callback) => {
      /* Allow requests with no origin (e.g. curl, mobile apps). */
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(express.json());

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

/* Public website forms. */
app.use('/api', formRoutes);

/* Public review endpoints. */
app.use('/api/products', publicReviewRoutes);
app.use('/api/client-reviews', publicClientReviewRoutes);
app.use('/api/review-settings', publicSettingsRoutes);

/* Admin endpoints (all except login require a valid admin JWT). */
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/reviews', adminReviewRoutes);
app.use('/api/admin/client-reviews', adminClientReviewRoutes);
app.use('/api/admin/review-settings', adminSettingsRoutes);

app.use(notFoundHandler);
app.use(errorMiddleware);

export default app;
