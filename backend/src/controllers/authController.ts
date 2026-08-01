import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';

const MENUS = ['DASHBOARD', 'VEHICLES', 'ADMIN'] as const;
const DEFAULT_MENUS: Record<string, readonly string[]> = {
  ADMIN: ['DASHBOARD', 'VEHICLES', 'ADMIN'],
  USER: ['DASHBOARD', 'VEHICLES'],
};

async function resolvePermissions(user: { id: number; role: string }) {
  const stored = await prisma.menuPermission.findMany({ where: { userId: user.id } });
  const storedMap = new Map(stored.map(p => [p.menu, p.enabled]));
  const defaults = DEFAULT_MENUS[user.role] ?? [];
  const permissions = MENUS.map(menu => ({
    menu,
    enabled: storedMap.has(menu) ? storedMap.get(menu)! : defaults.includes(menu),
  }));
  return permissions.filter(p => p.enabled).map(p => p.menu);
}

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y password son obligatorios' });
  }
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      password: hash,
      role: 'USER',
      permissions: {
        create: [
          { menu: 'DASHBOARD', enabled: true },
          { menu: 'VEHICLES', enabled: true },
        ],
      },
    },
  });

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET!, {
    expiresIn: '7d',
  });
  const permissions = await resolvePermissions(user);

  res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role, permissions } });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y password son obligatorios' });
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Credenciales inválidas' });

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET!, {
    expiresIn: '7d',
  });
  const permissions = await resolvePermissions(user);

  res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.json({ token, user: { id: user.id, email: user.email, role: user.role, permissions } });
};

export const getMe = async (req: any, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  const permissions = await resolvePermissions(user);
  res.json({ id: user.id, email: user.email, role: user.role, permissions });
};
