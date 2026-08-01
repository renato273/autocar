import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma';

const sanitize = (user: any) => ({ id: user.id, email: user.email, role: user.role });

export const getUsers = async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    orderBy: { id: 'asc' },
    select: { id: true, email: true, role: true, _count: { select: { vehicles: true } } },
  });
  res.json(users);
};

export const createUser = async (req: Request, res: Response) => {
  const { email, password, role } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y password son obligatorios' });
  }
  if (!['ADMIN', 'USER'].includes(role)) {
    return res.status(400).json({ error: 'Rol inválido' });
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(400).json({ error: 'El email ya está registrado' });
  }
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      password: hash,
      role,
      permissions: {
        create: role === 'ADMIN'
          ? [
              { menu: 'DASHBOARD', enabled: true },
              { menu: 'VEHICLES', enabled: true },
              { menu: 'ADMIN', enabled: true },
            ]
          : [
              { menu: 'DASHBOARD', enabled: true },
              { menu: 'VEHICLES', enabled: true },
            ],
      },
    },
  });
  res.status(201).json(sanitize(user));
};

export const updateUser = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { email, password, role } = req.body;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  if (role && !['ADMIN', 'USER'].includes(role)) {
    return res.status(400).json({ error: 'Rol inválido' });
  }

  const data: any = {};
  if (email) data.email = email;
  if (role) data.role = role;
  if (password) data.password = await bcrypt.hash(password, 10);

  const updated = await prisma.user.update({ where: { id }, data });
  res.json(sanitize(updated));
};

export const deleteUser = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const currentUserId = (req as any).user.id;
  if (id === currentUserId) {
    return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
  }
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  await prisma.user.delete({ where: { id } });
  res.status(204).send();
};
