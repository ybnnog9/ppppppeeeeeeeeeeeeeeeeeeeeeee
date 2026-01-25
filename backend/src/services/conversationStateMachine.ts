import { ConversationState } from '@prisma/client';
import { DateTime } from 'luxon';
import { prisma } from '../config/prisma.js';
import { availabilityService } from './availabilityService.js';

export type ConversationContext = {
  serviceId?: string;
  date?: string;
  timePreference?: 'morning' | 'afternoon' | 'any';
  customerName?: string;
  proposedSlots?: string[];
  selectedSlot?: string;
};

export type StateMachineResult = {
  nextState: ConversationState;
  reply: string;
  context: ConversationContext;
};

const normalize = (text: string) => text.trim().toLowerCase();

export const conversationStateMachine = {
  async handleMessage(
    tenantId: string,
    contactId: string,
    state: ConversationState,
    context: ConversationContext,
    message: string
  ): Promise<StateMachineResult> {
    const text = normalize(message);

    if (["baja", "stop"].includes(text)) {
      return {
        nextState: ConversationState.idle,
        reply: 'Entendido. Hemos desactivado los mensajes automáticos. Si deseas reactivarlos escribe ACTIVAR.',
        context: {}
      };
    }

    if (["agente", "humano"].includes(text)) {
      return {
        nextState: ConversationState.handoff,
        reply: 'Te conectaremos con una persona. En breve alguien del equipo te escribirá.',
        context: {}
      };
    }

    switch (state) {
      case ConversationState.idle:
      case ConversationState.menu:
        return {
          nextState: ConversationState.menu,
          reply: 'Menú AutoAgenda:\n1) Reservar cita\n2) Precios/Servicios\n3) Ubicación/Horario\n4) Hablar con una persona',
          context
        };
      case ConversationState.collecting_service: {
        const service = await prisma.service.findFirst({
          where: { tenantId, name: { contains: text, mode: 'insensitive' } }
        });
        if (!service) {
          return {
            nextState: ConversationState.collecting_service,
            reply: 'No encontré ese servicio. Por favor indica el nombre del servicio tal como aparece en el catálogo.',
            context
          };
        }
        return {
          nextState: ConversationState.collecting_date,
          reply: '¿Qué día prefieres? (ej: hoy, mañana o 2024-08-30)',
          context: { ...context, serviceId: service.id }
        };
      }
      case ConversationState.collecting_date: {
        const date = parseDate(text);
        if (!date) {
          return {
            nextState: ConversationState.collecting_date,
            reply: 'No pude interpretar la fecha. Indica hoy, mañana o una fecha en formato AAAA-MM-DD.',
            context
          };
        }
        return {
          nextState: ConversationState.collecting_time_pref,
          reply: '¿Prefieres mañana, tarde o cualquiera?',
          context: { ...context, date: date.toISODate() ?? undefined }
        };
      }
      case ConversationState.collecting_time_pref: {
        const pref = parsePreference(text);
        if (!pref) {
          return {
            nextState: ConversationState.collecting_time_pref,
            reply: 'Indica mañana, tarde o cualquiera.',
            context
          };
        }
        return {
          nextState: ConversationState.collecting_name,
          reply: '¿Cuál es tu nombre completo?',
          context: { ...context, timePreference: pref }
        };
      }
      case ConversationState.collecting_name: {
        const slots = await availabilityService.getAvailableSlots({
          tenantId,
          serviceId: context.serviceId!,
          date: context.date!,
          preference: context.timePreference ?? 'any'
        });
        if (slots.length === 0) {
          return {
            nextState: ConversationState.menu,
            reply: 'No hay horarios disponibles para ese día. Puedes intentar otra fecha o escribir AGENTE para atención humana.',
            context: {}
          };
        }
        const formatted = slots.map((slot, index) => `${index + 1}) ${slot}`).join('\n');
        return {
          nextState: ConversationState.proposing_slots,
          reply: `Gracias ${message}. Estos son los próximos horarios disponibles:\n${formatted}\nResponde con el número de tu elección.`,
          context: { ...context, customerName: message, proposedSlots: slots }
        };
      }
      case ConversationState.proposing_slots: {
        const choice = Number(text);
        const slot = context.proposedSlots?.[choice - 1];
        if (!slot) {
          return {
            nextState: ConversationState.proposing_slots,
            reply: 'Indica el número del horario que deseas reservar.',
            context
          };
        }
        return {
          nextState: ConversationState.awaiting_confirmation,
          reply: `Perfecto. ¿Confirmas tu cita para ${slot}? Responde SI o NO.`,
          context: { ...context, selectedSlot: slot }
        };
      }
      case ConversationState.awaiting_confirmation: {
        if (text !== 'si') {
          return {
            nextState: ConversationState.menu,
            reply: 'Sin problema. Si deseas intentar otra fecha escribe "Reservar" o vuelve al menú.',
            context: {}
          };
        }
        return {
          nextState: ConversationState.menu,
          reply: 'Confirmando tu cita. Un momento por favor...',
          context
        };
      }
      case ConversationState.handoff:
        return {
          nextState: ConversationState.handoff,
          reply: 'Nuestro equipo te atenderá en breve.',
          context
        };
      default:
        return {
          nextState: ConversationState.menu,
          reply: '¿Quieres reservar una cita o necesitas ayuda?',
          context
        };
    }
  }
};

const parseDate = (text: string) => {
  if (text === 'hoy') {
    return DateTime.local();
  }
  if (text === 'mañana' || text === 'manana') {
    return DateTime.local().plus({ days: 1 });
  }
  const parsed = DateTime.fromISO(text);
  if (parsed.isValid) {
    return parsed;
  }
  return null;
};

const parsePreference = (text: string): ConversationContext['timePreference'] | null => {
  if (text.includes('mañ') || text.includes('manana')) {
    return 'morning';
  }
  if (text.includes('tarde')) {
    return 'afternoon';
  }
  if (text.includes('cual')) {
    return 'any';
  }
  return null;
};
