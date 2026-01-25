import { describe, expect, it, vi } from 'vitest';
import { appointmentService } from './appointmentService.js';
import { prisma } from '../config/prisma.js';
import { googleCalendarService } from './googleCalendarService.js';
import { reminderQueue } from '../queue/queue.js';

vi.mock('../config/prisma.js', () => ({
  prisma: {
    service: { findUnique: vi.fn() },
    tenant: { findUnique: vi.fn() },
    appointment: {
      create: vi.fn(),
      update: vi.fn()
    }
  }
}));

vi.mock('./googleCalendarService.js', () => ({
  googleCalendarService: { createEvent: vi.fn() }
}));

vi.mock('../queue/queue.js', () => ({
  reminderQueue: { add: vi.fn() }
}));

describe('appointmentService', () => {
  it('creates appointment and schedules reminders', async () => {
    (prisma.service.findUnique as any).mockResolvedValue({
      id: 'service-1',
      durationMins: 30,
      bufferMins: 0,
      name: 'Consulta'
    });
    (prisma.appointment.create as any).mockResolvedValue({
      id: 'appt-1',
      startsAt: new Date(),
      endsAt: new Date(),
      status: 'confirmed'
    });
    (prisma.tenant.findUnique as any).mockResolvedValue({ calendarProvider: 'google' });
    (googleCalendarService.createEvent as any).mockResolvedValue('event-1');

    const result = await appointmentService.createAppointment({
      tenantId: 'tenant-1',
      contactId: 'contact-1',
      serviceId: 'service-1',
      start: '2024-08-20 09:00'
    });

    expect(result.id).toBe('appt-1');
    expect(reminderQueue.add).toHaveBeenCalledTimes(2);
  });
});
