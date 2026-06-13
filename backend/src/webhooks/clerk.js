import { Webhook } from 'svix';
import prisma from '../lib/prisma.js';

export async function handleClerkWebhook(req, res) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  const svixId = req.headers['svix-id'];
  const svixTimestamp = req.headers['svix-timestamp'];
  const svixSignature = req.headers['svix-signature'];

  if (!svixId || !svixTimestamp || !svixSignature) {
    return res.status(400).json({ error: 'Missing svix headers' });
  }

  let event;
  try {
    const wh = new Webhook(secret);
    event = wh.verify(req.body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    });
  } catch {
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  const { id, email_addresses, first_name, last_name } = event.data ?? {};
  const email = email_addresses?.[0]?.email_address;
  const name = [first_name, last_name].filter(Boolean).join(' ') || null;

  try {
    switch (event.type) {
      case 'user.created':
      case 'user.updated':
        await prisma.user.upsert({
          where: { id },
          update: { email, name },
          create: { id, email, name },
        });
        break;

      case 'user.deleted':
        await prisma.user.deleteMany({ where: { id } });
        break;

      default:
        break;
    }

    res.status(200).json({ received: true });
  } catch (err) {
    const status = err.code === 'P2002' ? 409 : 500;
    res.status(status).json({ error: 'Database operation failed' });
  }
}
