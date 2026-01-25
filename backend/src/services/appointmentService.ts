import { DateTime } from 'luxon';
import { prisma } from '../config/prisma.js';
import { googleCalendarService } from './googleCalendarService.js';
import { reminderQueue } from '../queue/queue.js';

export const appointmentService = {
  async createAppointment({
    tenantId,
    contactId,
    serviceId,
    start
  }: {
    tenantId: string;
    contactId: string;
    serviceId: string;
    start: string;
  }) {
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) {
      throw new Error('Service not found');
    }

    const startDate = DateTime.fromFormat(start, 'yyyy-LL-dd HH:mm').toUTC();
    const endDate = startDate.plus({ minutes: service.durationMins });

    const appointment = await prisma.appointment.create({
      data: {
        tenantId,
        contactId,
        serviceId,
        startsAt: startDate.toJSDate(),
        endsAt: endDate.toJSDate(),
        status: 'confirmed'
      }
    });

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (tenant?.calendarProvider === 'google') {
      const eventId = await googleCalendarService.createEvent({
        tenantId,
        summary: `Cita - ${service.name}`,
        description: 'Reservada desde AutoAgenda',
        start: startDate.toISO(),
        end: endDate.toISO(),
        attendees: []
      });

      if (eventId) {
        await prisma.appointment.update({
          where: { id: appointment.id },
          data: { calendarEventId: eventId }
        });
      }
    }

    const reminder24h = startDate.minus({ hours: 24 }).toMillis();
    const reminder2h = startDate.minus({ hours: 2 }).toMillis();

    await reminderQueue.add('reminder', {
      appointmentId: appointment.id,
      tenantId,
      offsetHours: 24
    }, { delay: Math.max(reminder24h - Date.now(), 0) });

    await reminderQueue.add('reminder', {
      appointmentId: appointment.id,
      tenantId,
      offsetHours: 2
    }, { delay: Math.max(reminder2h - Date.now(), 0) });

    return appointment;
  }
};
