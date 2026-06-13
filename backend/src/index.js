import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { clerkMiddleware, getAuth } from '@clerk/express';

import { authenticate, ensureUser } from './middleware/auth.js';
import notesRouter from './routes/notes.js';
import { handleClerkWebhook } from './webhooks/clerk.js';

const app = express();
const PORT = process.env.PORT ?? 5000;

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(clerkMiddleware({
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  authorizedParties: [process.env.FRONTEND_URL ?? 'http://localhost:5173'],
}));


// Webhook must receive raw body for svix signature verification
app.post(
  '/api/webhooks/clerk',
  express.raw({ type: 'application/json' }),
  handleClerkWebhook,
);

app.use(express.json());

app.use('/api/notes', authenticate, ensureUser, notesRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, _req, res, _next) => {
  const status = err.status ?? err.statusCode ?? 500;
  const message = status < 500 ? err.message : 'Internal server error';
  res.status(status).json({ error: message });
});

app.listen(PORT, () => {
  process.stdout.write(`Backend running on http://localhost:${PORT}\n`);
});
