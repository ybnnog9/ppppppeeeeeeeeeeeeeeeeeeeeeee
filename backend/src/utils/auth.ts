import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export type AuthPayload = {
  sub: string;
  tenantId: string;
  role: string;
};

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ error: 'Missing authorization' });
  }

  const token = header.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET ?? 'dev-secret') as AuthPayload;
    (req as Request & { auth: AuthPayload }).auth = payload;
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
