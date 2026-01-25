import { Router } from 'express';
import { webhookRouter } from './controllers/webhookController.js';
import { authRouter } from './controllers/authController.js';
import { tenantRouter } from './controllers/tenantController.js';
import { appointmentRouter } from './controllers/appointmentController.js';

export const router = Router();

router.use('/webhooks/whatsapp', webhookRouter);
router.use('/auth', authRouter);
router.use('/tenants', tenantRouter);
router.use('/appointments', appointmentRouter);
