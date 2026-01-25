import { DateTime } from 'luxon';
import { prisma } from '../config/prisma.js';
import { googleCalendarService } from './googleCalendarService.js';

export const availabilityService = {
  async getAvailableSlots({
    tenantId,
    serviceId,
    date,
    preference
  }: {
    tenantId: string;
    serviceId: string;
    date: string;
    preference: 'morning' | 'afternoon' | 'any';
  }) {
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) {
      return [];
    }

    const dayStart = DateTime.fromISO(date).set({ hour: 9, minute: 0 });
    const dayEnd = DateTime.fromISO(date).set({ hour: 18, minute: 0 });
    const slots: string[] = [];

    const busy = await googleCalendarService.getBusySlots({
      tenantId,
      start: dayStart.toISO(),
      end: dayEnd.toISO()
    });

    for (let cursor = dayStart; cursor < dayEnd; cursor = cursor.plus({ minutes: service.durationMins + service.bufferMins })) {
      if (slots.length >= 3) break;
      const hour = cursor.hour;
      if (preference === 'morning' && hour >= 13) continue;
      if (preference === 'afternoon' && hour < 13) continue;
      const slotEnd = cursor.plus({ minutes: service.durationMins });
      const overlaps = busy.some((range) => {
        const start = DateTime.fromISO(range.start);
        const end = DateTime.fromISO(range.end);
        return cursor < end && slotEnd > start;
      });
      if (!overlaps) {
        slots.push(cursor.toFormat('yyyy-LL-dd HH:mm'));
      }
    }

    return slots;
  }
};
