// src/app/vehicles/new/page.tsx
"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Car, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import PageHeader from "../../../components/PageHeader";
import { isValidPlate, PLATE_ERROR } from "../../../lib/format";
import { toast } from "../../../lib/toast";
import type { Brand } from "../../../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function NewVehiclePage() {
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    brandId: "",
    model: "",
    type: "AUTO",
    licensePlate: "",
    wheels: 4,
    doors: 4,
    tankCapacity: 50,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");
    axios
      .get(`${API_URL}/brands`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setBrands(res.data))
      .catch(err => console.error(err));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const plate = formData.licensePlate.toUpperCase();
    if (!isValidPlate(plate)) {
      setError(PLATE_ERROR);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/vehicles`,
        {
          ...formData,
          brandId: Number(formData.brandId),
          licensePlate: plate,
          wheels: Number(formData.wheels),
          doors: Number(formData.doors),
          tankCapacity: Number(formData.tankCapacity)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Vehículo registrado correctamente");
      router.push("/vehicles");
    } catch (err) {
      console.error(err);
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { error?: string } | undefined)?.error
        : undefined;
      setError(message || "Ocurrió un error al registrar el vehículo.");
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="page max-w-2xl">
      <div className="mb-6">
        <Link href="/vehicles" className="text-text-muted hover:text-primary flex items-center gap-2 inline-flex">
          <ArrowLeft size={18} /> Volver a vehículos
        </Link>
      </div>

      <PageHeader
        icon={<Car />}
        title="Registrar Vehículo"
        subtitle="Ingresa los datos técnicos del nuevo vehículo"
      />

      <div className="glass p-8 rounded-2xl">
        {error && <div className="error-msg mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="input-group">
              <label className="label">Marca</label>
              <select name="brandId" value={formData.brandId} onChange={handleChange} required className="input">
                <option value="" disabled>Selecciona una marca</option>
                {brands.map(brand => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label className="label">Modelo</label>
              <input type="text" name="model" value={formData.model} onChange={handleChange} required className="input" placeholder="Ej: Corolla" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="input-group">
              <label className="label">Tipo de Vehículo</label>
              <select name="type" value={formData.type} onChange={handleChange} className="input">
                <option value="AUTO">Automóvil</option>
                <option value="SUV">SUV</option>
                <option value="MISUV">Mini SUV</option>
                <option value="CARRIAGE">Camioneta</option>
                <option value="MOTO">Motocicleta</option>
              </select>
            </div>
            <div className="input-group">
              <label className="label">Placa / Patente</label>
              <input type="text" name="licensePlate" value={formData.licensePlate} onChange={handleChange} required className="input" placeholder="Ej: ABC-123" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="input-group">
              <label className="label">Ruedas</label>
              <input type="number" name="wheels" value={formData.wheels} onChange={handleChange} required min="2" className="input" />
            </div>
            <div className="input-group">
              <label className="label">Puertas</label>
              <input type="number" name="doors" value={formData.doors} onChange={handleChange} required min="0" className="input" />
            </div>
            <div className="input-group">
              <label className="label">Tanque (Litros)</label>
              <input type="number" name="tankCapacity" value={formData.tankCapacity} onChange={handleChange} required min="1" step="0.1" className="input" />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : <><Save size={18} /> Guardar Vehículo</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
