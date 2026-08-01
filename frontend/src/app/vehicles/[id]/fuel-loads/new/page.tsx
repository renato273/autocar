// src/app/vehicles/[id]/fuel-loads/new/page.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Droplets, Save, ArrowLeft, ImagePlus, X } from "lucide-react";
import Link from "next/link";
import { FUEL_TYPES, formatGuarani } from "../../../../../lib/format";
import PageHeader from "../../../../../components/PageHeader";
import FuelLoadGuide from "../../../../../components/FuelLoadGuide";
import { toast } from "../../../../../lib/toast";
import type { FuelLoad } from "../../../../../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const todayStr = () => new Date().toISOString().split('T')[0];

export default function NewFuelLoadPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const vehicleId = params.id;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loads, setLoads] = useState<FuelLoad[]>([]);

  const [formData, setFormData] = useState({
    date: todayStr(),
    odometer: "",
    kmDriven: "",
    fuelType: "NAFTA_COMUN",
    liters: "",
    totalPrice: "",
    pricePerLiter: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");
    axios
      .get(`${API_URL}/fuel?vehicleId=${vehicleId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setLoads(res.data))
      .catch(err => console.error(err));
  }, [vehicleId, router]);

  // Odómetro anterior: la última carga con fecha <= a la fecha ingresada.
  const lastOdometer = useMemo(() => {
    const date = formData.date ? new Date(formData.date) : null;
    const prev = loads
      .filter(l => date && new Date(l.date) <= date)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    return prev?.odometer != null ? prev.odometer : null;
  }, [loads, formData.date]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "odometer" && lastOdometer != null && value !== "") {
      const diff = Number(value) - lastOdometer;
      setFormData(prev => ({
        ...prev,
        odometer: value,
        kmDriven: diff > 0 ? String(diff) : "",
      }));
      return;
    }
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      // Al cambiar la fecha, recalcular kmDriven desde el nuevo odómetro anterior
      if (name === "date" && next.odometer !== "") {
        const odomNum = Number(next.odometer);
        if (lastOdometer != null) {
          const diff = odomNum - lastOdometer;
          next.kmDriven = diff > 0 ? String(diff) : "";
        }
      }
      // Ingeniería inversa: si hay total y precio/litro, se calculan los litros
      if ((name === "totalPrice" || name === "pricePerLiter") && value !== "") {
        const total = next.totalPrice !== "" ? Number(next.totalPrice) : NaN;
        const perLiter = next.pricePerLiter !== "" ? Number(next.pricePerLiter) : NaN;
        if (!Number.isNaN(total) && !Number.isNaN(perLiter) && perLiter > 0) {
          next.liters = String((total / perLiter).toFixed(2));
        }
      }
      return next;
    });
  };

  // Ingeniería inversa: calcula en vivo el dato faltante
  const calc = useMemo(() => {
    const liters = Number(formData.liters);
    const total = formData.totalPrice !== "" ? Number(formData.totalPrice) : NaN;
    const perLiter = formData.pricePerLiter !== "" ? Number(formData.pricePerLiter) : NaN;

    let computedPerLiter: number | null = null;
    let computedTotal: number | null = null;
    let computedLiters: number | null = null;

    if (!Number.isNaN(total) && !Number.isNaN(perLiter) && perLiter > 0) {
      computedLiters = total / perLiter;
    } else if (!Number.isNaN(total) && liters > 0 && Number.isNaN(perLiter)) {
      computedPerLiter = total / liters;
    } else if (!Number.isNaN(perLiter) && liters > 0) {
      computedTotal = perLiter * liters;
    }

    const odometerNum = formData.odometer !== "";
    const kmDrivenNum = Number(formData.kmDriven);
    let kmPerLiter: number | null = null;
    let litersPer100km: number | null = null;

    if (kmDrivenNum > 0 && liters > 0) {
      kmPerLiter = kmDrivenNum / liters;
      litersPer100km = (liters / kmDrivenNum) * 100;
    }

    return {
      computedPerLiter,
      computedTotal,
      computedLiters,
      usesOdometer: odometerNum,
      kmPerLiter,
      litersPer100km,
    };
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const payload = new FormData();
      payload.append("vehicleId", vehicleId);
      payload.append("date", formData.date);
      payload.append("fuelType", formData.fuelType);
      if (formData.odometer !== "") payload.append("odometer", formData.odometer);
      if (formData.kmDriven !== "") payload.append("kmDriven", formData.kmDriven);
      payload.append("liters", formData.liters);
      if (formData.totalPrice !== "") payload.append("totalPrice", formData.totalPrice);
      if (formData.pricePerLiter !== "") payload.append("pricePerLiter", formData.pricePerLiter);
      if (image) payload.append("image", image);

      await axios.post(`${API_URL}/fuel`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Carga de combustible registrada");
      router.push(`/vehicles/${vehicleId}`);
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error al registrar la carga de combustible.");
      setLoading(false);
    }
  };

  return (
    <div className="page max-w-2xl">
      <div className="mb-6">
        <Link href={`/vehicles/${vehicleId}`} className="text-text-muted hover:text-primary flex items-center gap-2 inline-flex">
          <ArrowLeft size={18} /> Volver al vehículo
        </Link>
      </div>

      <PageHeader
        icon={<Droplets />}
        title="Nueva Carga"
        subtitle="Registra tu abastecimiento de combustible"
        tone="accent"
        actions={<FuelLoadGuide />}
      />

      <div className="glass p-8 rounded-2xl">
        {error && <div className="error-msg mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="input-group">
            <label className="label">Fecha de la Carga</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} max={todayStr()} required className="input" />
            <p className="text-xs text-text-muted mt-1">
              Puedes registrar cargas con fecha anterior: el sistema busca la última carga anterior a esa fecha para calcular los km.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="input-group">
              <label className="label">Odómetro Anterior (Km)</label>
              <input id="prev-odometer" type="number" value={lastOdometer ?? 0} readOnly disabled className="input opacity-60" placeholder="0" />
            </div>
            <div className="input-group">
              <label className="label">Odómetro Actual (Km) <span className="text-text-muted text-xs">opcional</span></label>
              <input type="number" name="odometer" value={formData.odometer} onChange={handleChange} min="0" className="input" placeholder="Ej: 45000" />
            </div>
          </div>
          <p className="text-xs text-text-muted -mt-2">
            {lastOdometer != null
              ? `Kilómetros recorridos = odómetro actual − ${lastOdometer} (última carga antes de la fecha elegida).`
              : "No hay cargas anteriores a esta fecha: ingresa los kilómetros recorridos manualmente."}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="input-group">
              <label className="label">Kilómetros Recorridos <span className="text-text-muted text-xs">opcional</span></label>
              <input type="number" name="kmDriven" value={formData.kmDriven} onChange={handleChange} min="0" className="input" placeholder={lastOdometer != null ? "Auto-calculado" : "Ej: 350"} />
            </div>
            <div className="input-group">
              <label className="label">Tipo de Combustible</label>
              <select name="fuelType" value={formData.fuelType} onChange={handleChange} className="input">
                {FUEL_TYPES.map(ft => (
                  <option key={ft.value} value={ft.value}>{ft.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="input-group">
            <label className="label">Litros Cargados</label>
            <input type="number" name="liters" value={formData.liters} onChange={handleChange} required min="0.1" step="0.01" className="input" placeholder="Ej: 40.5" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="input-group">
              <label className="label">Precio Total Pagado (₲)</label>
              <input type="number" name="totalPrice" value={formData.totalPrice} onChange={handleChange} min="0.1" step="0.01" className="input" placeholder="Ej: 200000" />
            </div>
            <div className="input-group">
              <label className="label">Precio por Litro (₲/L)</label>
              <input type="number" name="pricePerLiter" value={formData.pricePerLiter} onChange={handleChange} min="0.01" step="0.01" className="input" placeholder="Ej: 8500" />
            </div>
          </div>
          <p className="text-xs text-text-muted -mt-2">
            Completa dos de los tres: los litros se calculan con <strong>total ÷ precio/litro</strong>.
          </p>

          {(calc.computedPerLiter !== null || calc.computedTotal !== null || calc.computedLiters !== null) && (
            <div id="calc-results" className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {calc.computedLiters !== null && (
                <div className="stat-card">
                  <span className="stat-label">Litros</span>
                  <span className="stat-value text-sm">{calc.computedLiters.toFixed(2)} L</span>
                </div>
              )}
              {calc.computedPerLiter !== null && (
                <div className="stat-card">
                  <span className="stat-label">₲/Litro</span>
                  <span className="stat-value text-sm">{formatGuarani(calc.computedPerLiter)}</span>
                </div>
              )}
              {calc.computedTotal !== null && (
                <div className="stat-card">
                  <span className="stat-label">Total (₲)</span>
                  <span className="stat-value text-sm">{formatGuarani(calc.computedTotal)}</span>
                </div>
              )}
              {calc.kmPerLiter !== null && (
                <div className="stat-card">
                  <span className="stat-label">Rendimiento</span>
                  <span className="stat-value text-sm">{calc.kmPerLiter.toFixed(1)} km/L</span>
                </div>
              )}
              {calc.litersPer100km !== null && (
                <div className="stat-card">
                  <span className="stat-label">Consumo</span>
                  <span className="stat-value text-sm">{calc.litersPer100km.toFixed(1)} L/100km</span>
                </div>
              )}
            </div>
          )}

          <div className="input-group">
            <label className="label">Foto del Odómetro <span className="text-text-muted text-xs">opcional</span></label>
            {imagePreview ? (
              <div className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Vista previa odómetro" className="rounded-xl max-h-40 border border-white/10" />
                <button type="button" onClick={removeImage} className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-danger text-white flex items-center justify-center" aria-label="Quitar imagen">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-white/15 rounded-xl py-8 cursor-pointer hover:border-accent transition-colors">
                <ImagePlus className="text-text-muted" size={28} />
                <span className="text-sm text-text-muted">Toca para subir una imagen</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </div>

          <div className="mt-4 flex justify-end">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : <><Save size={18} /> Guardar Registro</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
