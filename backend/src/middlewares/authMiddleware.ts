import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';

export interface AuthRequest extends Request {
  user?: { id: number; role: string };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.token;
  if (!token) {
    return next(); // no auth, continue as unauthenticated
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { id: number; role: string };
    req.user = { id: payload.id, role: payload.role };
  } catch (e) {
    // invalid token, ignore
  }
  next();
};
