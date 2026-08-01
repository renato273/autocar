import { Request, Response } from 'express';
import { prisma } from '../prisma';

const round = (n: number, decimals = 2) => {
  const factor = Math.pow(10, decimals);
  return Math.round(n * factor) / factor;
};

const computeMetrics = (kmDriven: number, liters: number) => {
  const kmPerLiter = liters > 0 ? round(kmDriven / liters) : 0;
  const litersPer100km = kmDriven > 0 ? round((liters / kmDriven) * 100) : 0;
  return { kmPerLiter, litersPer100km };
};

export const getFuelLoads = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const vehicleId = Number(req.query.vehicleId);
  const where = vehicleId ? { vehicleId, vehicle: { userId } } : { vehicle: { userId } };
  const loads = await prisma.fuelLoad.findMany({
    where,
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    include: { vehicle: { include: { brand: true } } },
  });
  const withMetrics = loads.map((load) => ({
    ...load,
    ...computeMetrics(load.kmDriven, load.liters),
  }));
  res.json(withMetrics);
};

export const createFuelLoad = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const {
    vehicleId,
    date,
    odometer,
    kmDriven,
    fuelType,
    liters,
    totalPrice,
    pricePerLiter,
  } = req.body;
  const imageUrl = (req as any).file
    ? `/uploads/${(req as any).file.filename}`
    : (req.body.imageUrl ?? null);

  const loadDate = date !== undefined && date !== '' ? new Date(date) : new Date();
  if (isNaN(loadDate.getTime())) {
    return res.status(400).json({ error: 'Fecha inválida' });
  }

  // Verify vehicle belongs to user
  const vehicle = await prisma.vehicle.findUnique({ where: { id: Number(vehicleId) } });
  if (!vehicle || vehicle.userId !== userId) {
    return res.status(403).json({ error: 'Vehicle not owned by user' });
  }

  const litersRaw = liters !== undefined && liters !== '' ? Number(liters) : undefined;

  // Reverse engineering: derive the missing value between totalPrice, pricePerLiter and liters
  let total = totalPrice !== undefined && totalPrice !== '' ? Number(totalPrice) : undefined;
  let perLiter = pricePerLiter !== undefined && pricePerLiter !== '' ? Number(pricePerLiter) : undefined;
  let litersNum = litersRaw;

  if (litersNum === undefined && total !== undefined && perLiter !== undefined && perLiter > 0) {
    // Litros = total / precio por litro
    litersNum = total / perLiter;
  }

  if (litersNum === undefined || litersNum <= 0) {
    return res.status(400).json({ error: 'Liters is required and must be greater than 0' });
  }

  if (total === undefined && perLiter === undefined) {
    return res.status(400).json({ error: 'totalPrice or pricePerLiter is required' });
  }
  if (total === undefined) {
    total = perLiter! * litersNum;
  }
  if (perLiter === undefined) {
    perLiter = litersNum > 0 ? total! / litersNum : 0;
  }

  // Km recorridos: prioridad a la resta del odómetro (actual vs última carga con fecha <= a esta).
  // Si la resta no es posible, usa el valor ingresado en el input.
  const odometerNum = odometer !== undefined && odometer !== '' ? Number(odometer) : undefined;
  const providedKmDriven = kmDriven !== undefined && kmDriven !== '' ? Number(kmDriven) : undefined;

  let kmDrivenNum: number | undefined;
  if (odometerNum !== undefined) {
    const lastLoad = await prisma.fuelLoad.findFirst({
      where: { vehicleId: Number(vehicleId), date: { lte: loadDate } },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });
    if (lastLoad?.odometer != null) {
      kmDrivenNum = Math.max(odometerNum - lastLoad.odometer, 0);
    }
  }
  if (kmDrivenNum === undefined) {
    kmDrivenNum = providedKmDriven ?? 0;
  }

  const fuelLoad = await prisma.fuelLoad.create({
    data: {
      vehicleId: Number(vehicleId),
      date: loadDate,
      odometer: odometer !== undefined && odometer !== '' ? Number(odometer) : undefined,
      kmDriven: kmDrivenNum,
      fuelType,
      liters: litersNum,
      totalPrice: round(total!),
      pricePerLiter: round(perLiter),
      imageUrl,
    },
  });

  const metrics = computeMetrics(fuelLoad.kmDriven, fuelLoad.liters);
  res.status(201).json({ ...fuelLoad, ...metrics });
};

export const updateFuelLoad = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const loadId = Number(req.params.id);
  const { date, odometer, kmDriven, fuelType, liters, totalPrice, pricePerLiter } = req.body;
  const imageUrl = (req as any).file
    ? `/uploads/${(req as any).file.filename}`
    : undefined;

  const existing = await prisma.fuelLoad.findUnique({
    where: { id: loadId },
    include: { vehicle: true },
  });
  if (!existing || existing.vehicle.userId !== userId) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  let loadDate = existing.date;
  if (date !== undefined && date !== '') {
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) {
      return res.status(400).json({ error: 'Fecha inválida' });
    }
    loadDate = parsed;
  }

  const data: any = { date: loadDate };

  if (odometer !== undefined) {
    data.odometer = odometer !== '' ? Number(odometer) : null;
  }

  // Km recorridos: prioridad a la resta del odómetro (contra la última carga con fecha <= a esta, excluyendo esta).
  const odometerNum = odometer !== undefined && odometer !== ''
    ? Number(odometer)
    : existing.odometer;
  const providedKm = kmDriven !== undefined && kmDriven !== '' ? Number(kmDriven) : undefined;
  if (providedKm !== undefined) {
    data.kmDriven = providedKm;
  } else {
    let computed: number | undefined;
    if (odometerNum != null) {
      const lastLoad = await prisma.fuelLoad.findFirst({
        where: { vehicleId: existing.vehicleId, id: { not: loadId }, date: { lte: loadDate } },
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      });
      if (lastLoad?.odometer != null) {
        computed = Math.max(odometerNum - lastLoad.odometer, 0);
      }
    }
    data.kmDriven = computed ?? existing.kmDriven;
  }

  if (fuelType) data.fuelType = fuelType;

  const totalNum = totalPrice !== undefined && totalPrice !== '' ? Number(totalPrice) : existing.totalPrice;
  const perLiterNum = pricePerLiter !== undefined && pricePerLiter !== '' ? Number(pricePerLiter) : undefined;

  // Ingeniería inversa: si no llegan litros pero sí total y precio/litro, se calculan
  const litersProvided = liters !== undefined && liters !== '';
  const litersNum = litersProvided
    ? Number(liters)
    : perLiterNum !== undefined && perLiterNum > 0
      ? totalNum / perLiterNum
      : existing.liters;

  if (litersProvided) data.liters = litersNum;

  if (totalPrice !== undefined && totalPrice !== '') data.totalPrice = round(totalNum);
  data.pricePerLiter = round(perLiterNum ?? (litersNum > 0 ? totalNum / litersNum : 0));

  if (imageUrl) data.imageUrl = imageUrl;

  const updated = await prisma.fuelLoad.update({ where: { id: loadId }, data });
  const metrics = computeMetrics(updated.kmDriven, updated.liters);
  res.json({ ...updated, ...metrics });
};

export const getFuelStats = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const vehicleId = req.query.vehicleId ? Number(req.query.vehicleId) : undefined;
  const period = String(req.query.period || 'month');

  const now = new Date();
  let start = new Date();
  if (period === 'day') {
    start.setHours(0, 0, 0, 0);
  } else if (period === 'week') {
    start.setDate(now.getDate() - 7);
  } else if (period === 'month') {
    start.setDate(now.getDate() - 30);
  } else {
    return res.status(400).json({ error: 'Invalid period. Use day, week or month' });
  }

  const where: any = {
    date: { gte: start },
    vehicle: { userId },
  };
  if (vehicleId) {
    where.vehicleId = vehicleId;
  }

  const loads = await prisma.fuelLoad.findMany({
    where,
    include: { vehicle: { include: { brand: true } } },
    orderBy: { createdAt: 'asc' },
  });

  const byVehicle = new Map<number, { vehicle: any; loads: any[]; totalSpent: number; totalLiters: number; totalKm: number }>();
  for (const load of loads) {
    const entry = byVehicle.get(load.vehicleId) || {
      vehicle: load.vehicle,
      loads: [],
      totalSpent: 0,
      totalLiters: 0,
      totalKm: 0,
    };
    entry.loads.push(load);
    entry.totalSpent += load.totalPrice;
    entry.totalLiters += load.liters;
    entry.totalKm += load.kmDriven;
    byVehicle.set(load.vehicleId, entry);
  }

  const perVehicle = Array.from(byVehicle.values()).map((entry) => ({
    vehicle: {
      id: entry.vehicle.id,
      brand: entry.vehicle.brand?.name ?? '',
      model: entry.vehicle.model,
      licensePlate: entry.vehicle.licensePlate,
    },
    totalSpent: round(entry.totalSpent),
    totalLiters: round(entry.totalLiters),
    loadsCount: entry.loads.length,
    averagePricePerLiter: entry.totalLiters > 0 ? round(entry.totalSpent / entry.totalLiters) : 0,
    totalKmDriven: entry.totalKm,
    litersPer100km: entry.totalKm > 0 ? round((entry.totalLiters / entry.totalKm) * 100) : 0,
  }));

  const totalSpent = round(loads.reduce((acc, l) => acc + l.totalPrice, 0));
  const totalLiters = round(loads.reduce((acc, l) => acc + l.liters, 0));
  const totalKm = loads.reduce((acc, l) => acc + l.kmDriven, 0);

  res.json({
    period,
    from: start,
    totalSpent,
    totalLiters,
    totalKmDriven: totalKm,
    litersPer100km: totalKm > 0 ? round((totalLiters / totalKm) * 100) : 0,
    loadsCount: loads.length,
    averagePricePerLiter: totalLiters > 0 ? round(totalSpent / totalLiters) : 0,
    perVehicle,
  });
};

export const deleteFuelLoad = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const loadId = Number(req.params.id);
  const load = await prisma.fuelLoad.findUnique({ where: { id: loadId }, include: { vehicle: true } });
  if (!load || load.vehicle.userId !== userId) {
    return res.status(403).json({ error: 'Not authorized' });
  }
  await prisma.fuelLoad.delete({ where: { id: loadId } });
  res.status(204).send();
};

export const getFuelYearly = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const vehicleId = req.query.vehicleId ? Number(req.query.vehicleId) : undefined;
  const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();

  const where: any = {
    vehicle: { userId },
    date: {
      gte: new Date(year, 0, 1),
      lt: new Date(year + 1, 0, 1),
    },
  };
  if (vehicleId) where.vehicleId = vehicleId;

  const loads = await prisma.fuelLoad.findMany({
    where,
    select: { date: true, liters: true, totalPrice: true, kmDriven: true },
  });

  const months = Array.from({ length: 12 }, (_, i) => ({
    month: i,
    label: new Date(year, i, 1).toLocaleString('es', { month: 'short' }),
    totalSpent: 0,
    totalLiters: 0,
    totalKmDriven: 0,
  }));

  for (const load of loads) {
    const m = load.date.getMonth();
    months[m].totalSpent += load.totalPrice;
    months[m].totalLiters += load.liters;
    months[m].totalKmDriven += load.kmDriven;
  }

  const data = months.map(m => ({
    ...m,
    totalSpent: round(m.totalSpent),
    totalLiters: round(m.totalLiters),
    totalKmDriven: m.totalKmDriven,
    litersPer100km: m.totalKmDriven > 0 ? round((m.totalLiters / m.totalKmDriven) * 100) : 0,
  }));

  res.json({ year, data });
};

export const getFuelPriceHistory = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const vehicleId = req.query.vehicleId ? Number(req.query.vehicleId) : undefined;
  const period = String(req.query.period || 'month');

  let from: Date;
  if (req.query.from) {
    from = new Date(String(req.query.from));
  } else if (period === 'week') {
    from = new Date();
    from.setDate(from.getDate() - 90); // últimos ~13 semanas
  } else if (period === 'year') {
    from = new Date(new Date().getFullYear() - 2, 0, 1);
  } else {
    from = new Date(new Date().getFullYear() - 2, 0, 1);
  }

  const where: any = {
    vehicle: { userId },
    date: { gte: from },
    pricePerLiter: { not: null },
  };
  if (vehicleId) where.vehicleId = vehicleId;

  const loads = await prisma.fuelLoad.findMany({
    where,
    select: { date: true, fuelType: true, pricePerLiter: true },
  });

  // Semana ISO (para el periodo semanal)
  const isoWeek = (d: Date) => {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
  };

  // Agrupa por combustible y por periodo (semana, mes o año)
  const buckets = new Map<string, Map<string, { sum: number; count: number }>>();

  for (const load of loads) {
    const price = Number(load.pricePerLiter);
    if (!price || price <= 0) continue;
    const type = load.fuelType;
    const key = period === 'year'
      ? `${load.date.getFullYear()}`
      : period === 'week'
        ? isoWeek(load.date)
        : `${load.date.getFullYear()}-${String(load.date.getMonth() + 1).padStart(2, '0')}`;

    if (!buckets.has(type)) buckets.set(type, new Map());
    const typeBuckets = buckets.get(type)!;
    const entry = typeBuckets.get(key) || { sum: 0, count: 0 };
    entry.sum += price;
    entry.count += 1;
    typeBuckets.set(key, entry);
  }

  const labels = Array.from(
    new Set(Array.from(buckets.values()).flatMap(m => Array.from(m.keys())))
  ).sort();

  const series = Array.from(buckets.entries()).map(([type, typeBuckets]) => ({
    fuelType: type,
    data: labels.map(label => ({
      period: label,
      averagePricePerLiter: typeBuckets.has(label)
        ? round(typeBuckets.get(label)!.sum / typeBuckets.get(label)!.count)
        : null,
    })),
  }));

  res.json({ period, from, series });
};
