import { Request, Response } from 'express';
import { prisma } from '../prisma';

export const getBrands = async (req: Request, res: Response) => {
  const brands = await prisma.brand.findMany({
    orderBy: { name: 'asc' }
  });
  res.json(brands);
};

export const createBrand = async (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  
  try {
    const brand = await prisma.brand.create({ data: { name } });
    res.status(201).json(brand);
  } catch (err: any) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'Brand already exists' });
    res.status(500).json({ error: 'Error creating brand' });
  }
};

export const deleteBrand = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  try {
    await prisma.brand.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Error deleting brand' });
  }
};
