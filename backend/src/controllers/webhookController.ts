import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { verifyWebhookSignature } from '../utils/webhookSignature.js';
import { whatsappService } from '../services/whatsappService.js';
import { conversationService } from '../services/conversationService.js';
import { logger } from '../utils/logger.js';

export const webhookRouter = Router();

const limiter = rateLimit({
  windowMs: 60_000,
  max: 120
});

webhookRouter.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

webhookRouter.post('/', limiter, async (req, res) => {
  const signature = req.headers['x-hub-signature-256'];
  if (!verifyWebhookSignature(signature as string | undefined, req.body)) {
    logger.warn('Invalid webhook signature');
    return res.sendStatus(401);
  }

  const payloadSchema = z.object({
    entry: z.array(z.object({
      changes: z.array(z.object({
        value: z.object({
          messages: z.array(z.any()).optional(),
          contacts: z.array(z.any()).optional(),
          metadata: z.any().optional()
        })
      }))
    }))
  });

  const parseResult = payloadSchema.safeParse(req.body);
  if (!parseResult.success) {
    logger.warn('Webhook payload invalid');
    return res.sendStatus(400);
  }

  const messages = whatsappService.extractMessages(req.body);
  for (const message of messages) {
    await conversationService.handleIncomingMessage(message);
  }

  return res.sendStatus(200);
});
