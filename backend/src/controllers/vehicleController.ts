import express from 'express';
import { prisma } from '../prisma';
import { Request, Response } from 'express';
import { authorize } from '../middlewares/role';

// Matrícula alfanumérica: letras, números y guiones, de 3 a 10 caracteres
const PLATE_REGEX = /^[A-Za-z0-9-]{3,10}$/;

const isValidPlate = (plate: string) => PLATE_REGEX.test(plate);

export const getVehicles = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const vehicles = await prisma.vehicle.findMany({ 
    where: { userId },
    include: { brand: true }
  });
  res.json(vehicles);
};

export const createVehicle = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { brandId, model, type, licensePlate, wheels, doors, tankCapacity } = req.body;
  const plate = (licensePlate || '').toString().toUpperCase();
  if (!isValidPlate(plate)) {
    return res.status(400).json({ error: 'Matrícula inválida: usa solo letras, números y guiones (3 a 10 caracteres)' });
  }
  try {
    const vehicle = await prisma.vehicle.create({
      data: {
        brand: { connect: { id: Number(brandId) } },
        model,
        type,
        licensePlate: plate,
        wheels,
        doors,
        tankCapacity,
        user: { connect: { id: userId } },
      },
      include: { brand: true }
    });
    res.status(201).json(vehicle);
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return res.status(400).json({ error: 'Esa placa ya está registrada' });
    }
    res.status(500).json({ error: 'Error al registrar el vehículo' });
  }
};

export const updateVehicle = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const vehicleId = Number(req.params.id);
  const data = req.body;
  if (data.licensePlate !== undefined) {
    const plate = data.licensePlate.toString().toUpperCase();
    if (!isValidPlate(plate)) {
      return res.status(400).json({ error: 'Matrícula inválida: usa solo letras, números y guiones (3 a 10 caracteres)' });
    }
    data.licensePlate = plate;
  }
  try {
    const vehicle = await prisma.vehicle.update({
      where: { id: vehicleId, userId },
      data,
    });
    res.json(vehicle);
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return res.status(400).json({ error: 'Esa placa ya está registrada' });
    }
    res.status(500).json({ error: 'Error al actualizar el vehículo' });
  }
};

export const deleteVehicle = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const vehicleId = Number(req.params.id);
  await prisma.vehicle.delete({ where: { id: vehicleId, userId } });
  res.status(204).send();
};

export const addVehicleImages = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const vehicleId = Number(req.params.id);
  const files = (req as any).files as Express.Multer.File[] | undefined;

  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle || vehicle.userId !== userId) {
    return res.status(403).json({ error: 'Not authorized' });
  }
  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'No images provided' });
  }
  if (vehicle.images.length + files.length > 3) {
    return res.status(400).json({ error: 'El vehículo puede tener máximo 3 imágenes' });
  }

  const urls = files.map(f => `/uploads/${f.filename}`);
  const updated = await prisma.vehicle.update({
    where: { id: vehicleId },
    data: { images: { push: urls } },
    include: { brand: true },
  });
  res.json(updated);
};

export const deleteVehicleImage = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const vehicleId = Number(req.params.id);
  const index = Number(req.params.index);

  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle || vehicle.userId !== userId) {
    return res.status(403).json({ error: 'Not authorized' });
  }
  if (index < 0 || index >= vehicle.images.length) {
    return res.status(400).json({ error: 'Índice de imagen inválido' });
  }

  const images = vehicle.images.filter((_, i) => i !== index);
  const updated = await prisma.vehicle.update({
    where: { id: vehicleId },
    data: { images },
    include: { brand: true },
  });
  res.json(updated);
};
