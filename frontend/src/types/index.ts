// src/types/index.ts
export interface User {
  id: number;
  email: string;
  role: string;
}

export interface Brand {
  id: number;
  name: string;
}

export interface Vehicle {
  id: number;
  brand: Brand;
  model: string;
  type: string;
  licensePlate: string;
  wheels: number;
  doors: number;
  tankCapacity: number;
  userId: number;
  images?: string[];
}

export interface FuelLoad {
  id: number;
  date: string;
  odometer?: number;
  kmDriven: number;
  fuelType?: string;
  liters: number;
  totalPrice: number;
  pricePerLiter: number;
  vehicleId: number;
  imageUrl?: string;
  createdAt: string;
  kmPerLiter?: number;
  litersPer100km?: number;
}

export interface FuelStats {
  period: string;
  totalSpent: number;
  totalLiters: number;
  totalKmDriven: number;
  litersPer100km: number;
  loadsCount: number;
  averagePricePerLiter: number;
  perVehicle: {
    vehicle: { id: number; brand: string; model: string; licensePlate: string };
    totalSpent: number;
    totalLiters: number;
    loadsCount: number;
    averagePricePerLiter: number;
    totalKmDriven: number;
    litersPer100km: number;
  }[];
}

export interface AdminUser {
  id: number;
  email: string;
  role: string;
  _count?: { vehicles: number };
}

export interface MenuPermission {
  menu: string;
  enabled: boolean;
}

export interface MonthlyData {
  month: number;
  label: string;
  totalSpent: number;
  totalLiters: number;
  totalKmDriven: number;
  litersPer100km: number;
}

export interface YearlyData {
  year: number;
  data: MonthlyData[];
}

export interface PricePoint {
  period: string;
  averagePricePerLiter: number | null;
}

export interface PriceSeries {
  fuelType: string;
  data: PricePoint[];
}

export interface PriceHistory {
  period: string;
  series: PriceSeries[];
}
