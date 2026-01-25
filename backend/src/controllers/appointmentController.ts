import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { authenticate } from '../utils/auth.js';

export const appointmentRouter = Router();

appointmentRouter.use(authenticate);

appointmentRouter.get('/', async (req, res) => {
  const auth = (req as any).auth;
  const appointments = await prisma.appointment.findMany({
    where: { tenantId: auth.tenantId },
    include: { contact: true, service: true }
  });
  return res.json(appointments);
});

appointmentRouter.get('/export/csv', async (req, res) => {
  const auth = (req as any).auth;
  const appointments = await prisma.appointment.findMany({
    where: { tenantId: auth.tenantId },
    include: { contact: true, service: true }
  });

  const header = 'id,contact,service,start,end,status';
  const rows = appointments.map((item) => {
    return [
      item.id,
      item.contact.phone,
      item.service.name,
      item.startsAt.toISOString(),
      item.endsAt.toISOString(),
      item.status
    ].join(',');
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="appointments.csv"');
  return res.send([header, ...rows].join('\n'));
});
