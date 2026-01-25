import { Worker } from 'bullmq';
import { prisma } from '../config/prisma.js';
import { whatsappService } from '../services/whatsappService.js';
import { logger } from '../utils/logger.js';

export const initQueueWorkers = () => {
  const worker = new Worker(
    'reminders',
    async (job) => {
      if (job.name !== 'reminder') return;
      const { appointmentId, tenantId, offsetHours } = job.data as {
        appointmentId: string;
        tenantId: string;
        offsetHours: number;
      };

      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: { contact: true, service: true }
      });

      if (!appointment || appointment.status !== 'confirmed') {
        return;
      }

      const message = `Recordatorio AutoAgenda: tu cita de ${appointment.service.name} es en ${offsetHours}h. Responde CAMBIAR o CANCELAR si necesitas modificar.`;
      await whatsappService.sendTextMessage(tenantId, appointment.contact.phone, message);
    },
    {
      connection: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: Number(process.env.REDIS_PORT ?? 6379)
      }
    }
  );

  worker.on('failed', (job, err) => {
    logger.error('Reminder job failed', { jobId: job?.id, err });
  });
};
