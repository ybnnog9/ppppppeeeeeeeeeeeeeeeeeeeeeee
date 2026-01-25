import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { authenticate } from '../utils/auth.js';
import { googleAuthUrl, exchangeGoogleCode } from '../services/googleCalendarService.js';

export const tenantRouter = Router();

tenantRouter.use(authenticate);

tenantRouter.get('/me', async (req, res) => {
  const auth = (req as any).auth;
  const tenant = await prisma.tenant.findUnique({ where: { id: auth.tenantId } });
  return res.json(tenant);
});

tenantRouter.put('/me', async (req, res) => {
  const auth = (req as any).auth;
  const schema = z.object({
    name: z.string().optional(),
    timezone: z.string().optional(),
    whatsappNumberId: z.string().optional(),
    whatsappToken: z.string().optional(),
    whatsappVerifyToken: z.string().optional(),
    calendarProvider: z.enum(['google', 'calendly']).optional(),
    calendlyLink: z.string().url().optional(),
    welcomeMessage: z.string().optional()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  const tenant = await prisma.tenant.update({
    where: { id: auth.tenantId },
    data: parsed.data
  });

  return res.json(tenant);
});

tenantRouter.post('/services', async (req, res) => {
  const auth = (req as any).auth;
  const schema = z.object({
    name: z.string(),
    durationMins: z.number().min(5),
    price: z.number().optional(),
    bufferMins: z.number().min(0).optional()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  const service = await prisma.service.create({
    data: {
      tenantId: auth.tenantId,
      name: parsed.data.name,
      durationMins: parsed.data.durationMins,
      price: parsed.data.price,
      bufferMins: parsed.data.bufferMins ?? 0
    }
  });

  return res.status(201).json(service);
});

tenantRouter.get('/services', async (req, res) => {
  const auth = (req as any).auth;
  const services = await prisma.service.findMany({ where: { tenantId: auth.tenantId } });
  return res.json(services);
});

tenantRouter.get('/google/auth-url', async (_req, res) => {
  return res.json({ url: googleAuthUrl() });
});

tenantRouter.post('/google/exchange', async (req, res) => {
  const auth = (req as any).auth;
  const schema = z.object({ code: z.string() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload' });
  }
  const tokens = await exchangeGoogleCode(parsed.data.code);
  if (!tokens.access_token || !tokens.refresh_token || !tokens.expiry_date) {
    return res.status(400).json({ error: 'Incomplete tokens' });
  }

  await prisma.oAuthToken.upsert({
    where: {
      tenantId_provider: {
        tenantId: auth.tenantId,
        provider: 'google'
      }
    },
    update: {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiry: new Date(tokens.expiry_date)
    },
    create: {
      tenantId: auth.tenantId,
      provider: 'google',
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiry: new Date(tokens.expiry_date)
    }
  });

  return res.json({ success: true });
});
