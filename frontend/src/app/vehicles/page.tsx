// src/app/vehicles/page.tsx
"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import VehicleCard from "../../components/VehicleCard";
import PageHeader from "../../components/PageHeader";
import type { Vehicle } from "../../types";
import { Plus, Car } from "lucide-react";
import Link from "next/link";

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/vehicles`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setVehicles(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [router]);

  return (
    <div className="page">
      <PageHeader
        icon={<Car />}
        title="Tus Vehículos"
        subtitle="Gestiona tu flota o autos personales"
        actions={
          <Link href="/vehicles/new" className="btn btn-primary">
            <Plus size={18} /> Nuevo Vehículo
          </Link>
        }
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="spinner"></div>
        </div>
      ) : vehicles.length > 0 ? (
        <div className="grid-cards">
          {vehicles.map(v => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </div>
      ) : (
        <div className="glass p-12 flex flex-col items-center text-center rounded-2xl">
          <Car className="text-text-muted mb-4" size={48} />
          <h2 className="text-xl font-bold mb-2">No tienes vehículos registrados</h2>
          <p className="text-text-secondary mb-6 max-w-md">
            Comienza agregando tu primer vehículo para llevar el control de mantenimiento, gastos y rendimiento.
          </p>
          <Link href="/vehicles/new" className="btn btn-primary">
            <Plus size={18} /> Agregar Vehículo
          </Link>
        </div>
      )}
    </div>
  );
}
