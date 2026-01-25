import { ConversationState } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { whatsappService } from './whatsappService.js';
import { conversationStateMachine, ConversationContext } from './conversationStateMachine.js';
import { appointmentService } from './appointmentService.js';
import { logger } from '../utils/logger.js';
import { DateTime } from 'luxon';

export const conversationService = {
  async handleIncomingMessage(message: any) {
    const phone = message.from;
    const phoneNumberId = message.metadata?.phone_number_id;

    const tenant = await prisma.tenant.findFirst({
      where: phoneNumberId ? { whatsappNumberId: phoneNumberId } : { id: process.env.DEFAULT_TENANT_ID }
    });

    if (!tenant) {
      logger.warn('Tenant not found for incoming message');
      return;
    }

    const contact = await prisma.contact.upsert({
      where: { phone_tenantId: { phone, tenantId: tenant.id } },
      update: { lastInteraction: new Date() },
      create: { phone, tenantId: tenant.id, lastInteraction: new Date() }
    });

    if (contact.optedOut) {
      return;
    }

    const conversation = await prisma.conversation.upsert({
      where: { contactId_tenantId: { contactId: contact.id, tenantId: tenant.id } },
      update: {},
      create: { contactId: contact.id, tenantId: tenant.id, state: ConversationState.menu }
    });

    const body = message.text?.body ?? '';
    const normalized = body.trim().toLowerCase();

    if (["baja", "stop"].includes(normalized)) {
      await prisma.contact.update({ where: { id: contact.id }, data: { optedOut: true } });
    }

    if (["cancelar"].includes(normalized)) {
      await this.cancelLatestAppointment(tenant.id, contact.id);
      await whatsappService.sendTextMessage(tenant.id, phone, 'Tu cita ha sido cancelada. Si deseas reprogramar escribe REPROGRAMAR.');
      return;
    }

    if (["cambiar", "reprogramar"].includes(normalized)) {
      await whatsappService.sendTextMessage(tenant.id, phone, 'Claro. Indica la nueva fecha o escribe MENU para ver opciones.');
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { state: ConversationState.collecting_date, context: {} }
      });
      return;
    }

    if (normalized === '1') {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { state: ConversationState.collecting_service, context: {} }
      });
      const services = await prisma.service.findMany({ where: { tenantId: tenant.id } });
      const list = services.map((service) => `- ${service.name}`).join('\n');
      await whatsappService.sendTextMessage(tenant.id, phone, `¿Qué servicio deseas?\n${list}`);
      return;
    }

    if (normalized === '2') {
      const services = await prisma.service.findMany({ where: { tenantId: tenant.id } });
      const list = services.map((service) => `${service.name}${service.price ? ` ($${service.price})` : ''}`).join('\n');
      await whatsappService.sendTextMessage(tenant.id, phone, `Servicios disponibles:\n${list}`);
      return;
    }

    if (normalized === '3') {
      await whatsappService.sendTextMessage(tenant.id, phone, 'Nuestro horario es de 9:00 a 18:00. Responde 1 para reservar una cita.');
      return;
    }

    if (normalized === '4') {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { state: ConversationState.handoff }
      });
      await whatsappService.sendTextMessage(tenant.id, phone, 'Te conectaremos con un agente.');
      return;
    }

    if (normalized === 'menu') {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { state: ConversationState.menu }
      });
      await whatsappService.sendTextMessage(
        tenant.id,
        phone,
        'Menú AutoAgenda:\n1) Reservar cita\n2) Precios/Servicios\n3) Ubicación/Horario\n4) Hablar con una persona'
      );
      return;
    }

    const result = await conversationStateMachine.handleMessage(
      tenant.id,
      contact.id,
      conversation.state,
      (conversation.context as ConversationContext) ?? {},
      body
    );

    const updatedContext = { ...result.context };

    if (conversation.state === ConversationState.awaiting_confirmation && normalized === 'si') {
      const selectedSlot = (conversation.context as any)?.selectedSlot ?? updatedContext.selectedSlot;
      if (selectedSlot) {
        if (tenant.calendarProvider === 'calendly' && tenant.calendlyLink) {
          await whatsappService.sendTextMessage(
            tenant.id,
            phone,
            `Para finalizar tu reserva, confirma el horario en nuestro link de Calendly: ${tenant.calendlyLink}`
          );
        } else {
          const appointment = await appointmentService.createAppointment({
            tenantId: tenant.id,
            contactId: contact.id,
            serviceId: updatedContext.serviceId ?? (conversation.context as any).serviceId,
            start: selectedSlot
          });
          const startFormatted = DateTime.fromJSDate(appointment.startsAt).toFormat('yyyy-LL-dd HH:mm');
          await whatsappService.sendTextMessage(tenant.id, phone, `¡Listo! Tu cita está confirmada para ${startFormatted}.`);
        }
      }
    } else {
      await whatsappService.sendTextMessage(tenant.id, phone, result.reply);
    }

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { state: result.nextState, context: updatedContext }
    });
  },

  async cancelLatestAppointment(tenantId: string, contactId: string) {
    const appointment = await prisma.appointment.findFirst({
      where: { tenantId, contactId, status: 'confirmed' },
      orderBy: { startsAt: 'desc' }
    });

    if (!appointment) return;

    await prisma.appointment.update({
      where: { id: appointment.id },
      data: { status: 'cancelled' }
    });
  }
};
