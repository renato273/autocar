import { Request, Response } from 'express';
import { prisma } from '../prisma';

// Menús configurables del sistema
const MENUS = ['DASHBOARD', 'VEHICLES', 'ADMIN'] as const;
type MenuKey = (typeof MENUS)[number];

// Defaults: un ADMIN ve todo; un USER ve lo básico
const DEFAULT_MENUS: Record<string, MenuKey[]> = {
  ADMIN: ['DASHBOARD', 'VEHICLES', 'ADMIN'],
  USER: ['DASHBOARD', 'VEHICLES'],
};

export const getMenuPermissions = async (req: Request, res: Response) => {
  const userId = Number(req.params.userId);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  const stored = await prisma.menuPermission.findMany({ where: { userId } });
  const storedMap = new Map(stored.map(p => [p.menu, p.enabled]));

  const result = MENUS.map(menu => ({
    menu,
    enabled: storedMap.has(menu) ? storedMap.get(menu)! : DEFAULT_MENUS[user.role]?.includes(menu) ?? false,
  }));

  res.json({ userId, role: user.role, permissions: result });
};

export const setMenuPermissions = async (req: Request, res: Response) => {
  const userId = Number(req.params.userId);
  const { permissions } = req.body;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  if (!Array.isArray(permissions)) {
    return res.status(400).json({ error: 'permissions debe ser un array de { menu, enabled }' });
  }

  const data = permissions
    .filter(p => MENUS.includes(p.menu) && typeof p.enabled === 'boolean')
    .map(p => ({ menu: p.menu as MenuKey, enabled: p.enabled }));

  await prisma.$transaction([
    prisma.menuPermission.deleteMany({ where: { userId } }),
    ...data.map(p =>
      prisma.menuPermission.create({ data: { userId, menu: p.menu, enabled: p.enabled } })
    ),
  ]);

  res.json({ userId, permissions: data });
};
