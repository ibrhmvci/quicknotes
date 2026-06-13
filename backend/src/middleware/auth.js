import { getAuth, verifyToken, clerkClient } from '@clerk/express';
import prisma from '../lib/prisma.js';

export async function authenticate(req, res, next) {
  // Try clerkMiddleware result first
  const auth = getAuth(req);
  if (auth?.userId) {
    req.userId = auth.userId;
    return next();
  }

  // clerkMiddleware didn't resolve it — manually verify Bearer token
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.slice(7);
  try {
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    req.userId = payload.sub;
    return next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

// Ensures the authenticated user exists in our DB.
// Falls back to Clerk API if the webhook hasn't synced the user yet.
export async function ensureUser(req, res, next) {
  const userId = req.userId;
  try {
    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (existing) return next();

    // User not in DB yet — fetch from Clerk and create
    const clerkUser = await clerkClient.users.getUser(userId);
    const email = clerkUser.emailAddresses?.[0]?.emailAddress ?? `${userId}@noemail.dev`;
    const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null;
    await prisma.user.upsert({
      where: { id: userId },
      create: { id: userId, email, name },
      update: { email, name },
    });
    next();
  } catch (err) {
    next(err);
  }
}
