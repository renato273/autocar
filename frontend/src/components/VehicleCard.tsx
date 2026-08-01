// src/components/VehicleCard.tsx
"use client";
import { useRouter } from "next/navigation";
import type { Vehicle } from "../types";
import { Car, Settings, Disc, Droplets } from "lucide-react";

export default function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/vehicles/${vehicle.id}`);
  };

  return (
    <div className="vehicle-card" onClick={handleClick}>
      <div className="flex items-center gap-4">
        <div className="vehicle-icon">
          <Car size={28} />
        </div>
        <div>
          <h3 className="vehicle-brand">{vehicle.brand.name}</h3>
          <p className="vehicle-model">{vehicle.model}</p>
        </div>
      </div>
      
      <div className="mt-2 flex items-center justify-between">
        <span className="vehicle-plate">{vehicle.licensePlate}</span>
        <span className="badge badge-primary">{vehicle.type}</span>
      </div>

      <div className="vehicle-details mt-2">
        <div className="vehicle-detail-item">
          <Disc size={14} /> {vehicle.wheels} ruedas
        </div>
        <div className="vehicle-detail-item">
          <Settings size={14} /> {vehicle.doors} ptas
        </div>
        <div className="vehicle-detail-item">
          <Droplets size={14} /> {vehicle.tankCapacity}L
        </div>
      </div>
    </div>
  );
}
