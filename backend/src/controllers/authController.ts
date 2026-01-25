import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';

export const authRouter = Router();

authRouter.post('/register', async (req, res) => {
  const schema = z.object({
    tenantId: z.string(),
    email: z.string().email(),
    password: z.string().min(8)
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  const hashed = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: {
      tenantId: parsed.data.tenantId,
      email: parsed.data.email,
      password: hashed
    }
  });

  return res.status(201).json({ id: user.id });
});

authRouter.post('/login', async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8)
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const match = await bcrypt.compare(parsed.data.password, user.password);
  if (!match) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { sub: user.id, tenantId: user.tenantId, role: user.role },
    process.env.JWT_SECRET ?? 'dev-secret',
    { expiresIn: '8h' }
  );

  return res.json({ token });
});
