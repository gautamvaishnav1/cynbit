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

/* Behind a production load balancer, req.ip must reflect the real client. */
app.set('trust proxy', true);

/* Only the configured frontend origin may call this API (set FRONTEND_URL in .env). */
const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';

app.use(
  cors({
    origin: frontendUrl,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

/* Cap request bodies at 100 KB to reject abusive payloads. */
app.use(express.json({ limit: '100kb' }));

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
