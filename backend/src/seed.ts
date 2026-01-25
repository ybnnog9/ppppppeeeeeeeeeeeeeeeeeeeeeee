import { prisma } from './config/prisma.js';
import bcrypt from 'bcryptjs';

const main = async () => {
  const tenant = await prisma.tenant.upsert({
    where: { id: 'demo-tenant' },
    update: {},
    create: {
      id: 'demo-tenant',
      name: 'Demo AutoAgenda',
      whatsappNumberId: 'WHATSAPP_NUMBER_ID',
      whatsappToken: 'WHATSAPP_TOKEN',
      whatsappVerifyToken: 'VERIFY_TOKEN'
    }
  });

  const password = await bcrypt.hash('Password123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@autoagenda.local' },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'admin@autoagenda.local',
      password
    }
  });

  await prisma.service.createMany({
    data: [
      { tenantId: tenant.id, name: 'Consulta inicial', durationMins: 30, price: 500 },
      { tenantId: tenant.id, name: 'Seguimiento', durationMins: 20, price: 350 }
    ],
    skipDuplicates: true
  });
};

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
