import axios from 'axios';
import { WhatsappIncomingMessage, WhatsappMessagePayload } from '../types/whatsapp.js';
import { prisma } from '../config/prisma.js';
import { logger } from '../utils/logger.js';

const apiUrl = 'https://graph.facebook.com/v19.0';

export const whatsappService = {
  extractMessages(payload: any): (WhatsappIncomingMessage & { metadata?: any })[] {
    const messages: WhatsappIncomingMessage[] = [];
    for (const entry of payload.entry ?? []) {
      for (const change of entry.changes ?? []) {
        const value = change.value;
        if (value?.messages) {
          for (const message of value.messages) {
            messages.push({ ...message, metadata: value.metadata });
          }
        }
      }
    }
    return messages;
  },

  async sendTextMessage(tenantId: string, to: string, body: string) {
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      logger.warn('Tenant not found for WhatsApp send', { tenantId });
      return;
    }

    const payload: WhatsappMessagePayload = {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body }
    };

    const url = `${apiUrl}/${tenant.whatsappNumberId}/messages`;
    try {
      await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${tenant.whatsappToken}`
        }
      });
    } catch (error) {
      logger.error('Failed to send WhatsApp message', { error });
    }
  }
};
