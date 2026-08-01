// src/app/vehicles/[id]/page.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Car, Droplets, Trash2, ArrowLeft, Activity, Image as ImageIcon, Pencil, Upload, X, ImagePlus, Fuel, Gauge, DoorOpen, Cog } from "lucide-react";
import type { Vehicle, FuelLoad } from "../../../types";
import { fuelTypeLabel, formatGuarani, vehicleTypeLabel } from "../../../lib/format";
import { toast } from "../../../lib/toast";
import { useConfirm } from "../../../lib/confirm";
import PageHeader from "../../../components/PageHeader";
import { TimeMachineGallery } from "../../../components/TimeMachineGallery";

const PAGE_SIZE = 5;

export default function VehicleDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const vehicleId = params.id;
  const confirm = useConfirm(s => s.confirm);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [fuelLoads, setFuelLoads] = useState<FuelLoad[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [pendingImages, setPendingImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalPages = Math.max(1, Math.ceil(fuelLoads.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedLoads = fuelLoads.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return router.push("/login");

        const [vehRes, fuelRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/vehicles`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/fuel?vehicleId=${vehicleId}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const currentVehicle = vehRes.data.find((v: Vehicle) => v.id === Number(vehicleId));
        if (currentVehicle) setVehicle(currentVehicle);
        setFuelLoads(fuelRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [vehicleId, router]);

  const handleDeleteVehicle = async () => {
    const ok = await confirm({
      title: "Eliminar vehículo",
      message: "¿Estás seguro de eliminar este vehículo? Esto borrará también todas sus cargas de combustible.",
      confirmLabel: "Eliminar",
    });
    if (!ok) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/vehicles/${vehicleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Vehículo eliminado");
      router.push("/vehicles");
    } catch (err) {
      console.error(err);
      toast.error("Error al eliminar el vehículo");
    }
  };

  const handleDeleteFuelLoad = async (id: number) => {
    const ok = await confirm({
      title: "Eliminar carga",
      message: "¿Eliminar este registro de combustible?",
      confirmLabel: "Eliminar",
    });
    if (!ok) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/fuel/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Registro eliminado");
      const updated = fuelLoads.filter(f => f.id !== id);
      setFuelLoads(updated);
      setPage(prev => {
        const tp = Math.max(1, Math.ceil(updated.length / PAGE_SIZE));
        return Math.min(prev, tp);
      });
    } catch (err) {
      console.error(err);
      toast.error("Error al eliminar el registro");
    }
  };

  const handleSelectImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    e.target.value = "";
    queueImages(files);
  };

  const queueImages = (files: File[]) => {
    const existing = (vehicle?.images?.length || 0) + pendingImages.length;
    const remaining = 3 - existing;
    if (remaining <= 0) {
      toast.warning("Ya alcanzaste el máximo de 3 imágenes.");
      return;
    }
    const accepted = files.slice(0, remaining);
    if (files.length > remaining) {
      toast.warning(`Solo podés agregar ${remaining} imagen(es) más (máximo 3 en total).`);
    }
    setPendingImages(prev => [...prev, ...accepted]);
    setPreviewUrls(prev => [...prev, ...accepted.map(f => URL.createObjectURL(f))]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files || []).filter(f => f.type.startsWith("image/"));
    if (files.length) queueImages(files);
  };

  const removePending = (index: number) => {
    setPendingImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleUploadImages = async () => {
    if (!pendingImages.length) return;
    setUploadingImages(true);
    try {
      const token = localStorage.getItem("token");
      const payload = new FormData();
      pendingImages.forEach(f => payload.append("images", f));
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/vehicles/${vehicleId}/images`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVehicle(res.data);
      previewUrls.forEach(u => URL.revokeObjectURL(u));
      setPendingImages([]);
      setPreviewUrls([]);
      toast.success("Imágenes subidas correctamente");
    } catch (err) {
      console.error(err);
      toast.error("Error al subir las imágenes");
    } finally {
      setUploadingImages(false);
    }
  };

  const handleDeleteImage = async (index: number) => {
    const ok = await confirm({
      title: "Eliminar imagen",
      message: "¿Eliminar esta imagen?",
      confirmLabel: "Eliminar",
    });
    if (!ok) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/vehicles/${vehicleId}/images/${index}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVehicle(res.data);
      toast.success("Imagen eliminada");
    } catch (err) {
      console.error(err);
      toast.error("Error al eliminar la imagen");
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="spinner"></div></div>;
  if (!vehicle) return <div className="page text-center py-12">Vehículo no encontrado.</div>;

  return (
    <div className="page">
      <div className="mb-6">
        <Link href="/vehicles" className="text-text-muted hover:text-primary flex items-center gap-2 inline-flex">
          <ArrowLeft size={18} /> Volver a vehículos
        </Link>
      </div>

      <PageHeader
        icon={<Car />}
        title={`${vehicle.brand.name} ${vehicle.model}`}
        subtitle={
          <>
            Placa: <span className="font-mono text-accent">{vehicle.licensePlate}</span>
          </>
        }
        actions={
          <>
            <Link href={`/vehicles/${vehicle.id}/edit`} className="btn btn-ghost">
              <Pencil size={18} /> Editar
            </Link>
            <Link href={`/vehicles/${vehicle.id}/fuel-loads/new`} className="btn btn-primary">
              <Droplets size={18} /> Registrar Carga
            </Link>
            <button onClick={handleDeleteVehicle} className="btn btn-danger">
              <Trash2 size={18} />
            </button>
          </>
        }
      />

      <div className="mt-8 glass p-6 rounded-2xl">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Car className="text-primary" size={20} /> Datos del Vehículo
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="stat-card">
            <span className="stat-label">Marca</span>
            <span className="font-semibold text-text-primary">{vehicle.brand.name}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Modelo</span>
            <span className="font-semibold text-text-primary">{vehicle.model}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Tipo</span>
            <span className="font-semibold text-text-primary">{vehicleTypeLabel(vehicle.type)}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Placa</span>
            <span className="font-mono text-accent font-semibold">{vehicle.licensePlate}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label flex items-center gap-1"><Gauge size={14} /> Ruedas</span>
            <span className="font-semibold text-text-primary">{vehicle.wheels}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label flex items-center gap-1"><DoorOpen size={14} /> Puertas</span>
            <span className="font-semibold text-text-primary">{vehicle.doors}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label flex items-center gap-1"><Fuel size={14} /> Tanque</span>
            <span className="font-semibold text-text-primary">{vehicle.tankCapacity} L</span>
          </div>
          <div className="stat-card">
            <span className="stat-label flex items-center gap-1"><Cog size={14} /> Cargas</span>
            <span className="font-semibold text-text-primary">{fuelLoads.length}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 glass p-6 rounded-2xl">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Activity className="text-accent" size={20} /> Historial de Combustible
        </h2>
        
        {fuelLoads.length === 0 ? (
          <div className="empty-state py-8">
            <Droplets className="empty-state-icon mb-4 text-text-muted" />
            <h3 className="empty-state-title">No hay cargas registradas</h3>
            <p className="empty-state-desc">Registra tus cargas de combustible para llevar el control de gastos.</p>
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Odómetro</th>
                    <th>Km Recorridos</th>
                    <th>Tipo</th>
                    <th>Litros</th>
                    <th>Total Pagado</th>
                    <th>₲/Litro</th>
                    <th>km/L</th>
                    <th>L/100km</th>
                    <th>Foto</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLoads.map(load => (
                    <tr key={load.id}>
                      <td>{new Date(load.date || load.createdAt).toLocaleDateString()}</td>
                      <td>{load.odometer ? `${load.odometer} km` : '—'}</td>
                      <td>{load.kmDriven} km</td>
                      <td>{fuelTypeLabel(load.fuelType)}</td>
                      <td>{load.liters} L</td>
                      <td>{formatGuarani(load.totalPrice)}</td>
                      <td>{formatGuarani(load.pricePerLiter)}</td>
                      <td>{load.kmPerLiter ? `${load.kmPerLiter.toFixed(1)}` : '—'}</td>
                      <td>{load.litersPer100km ? `${load.litersPer100km.toFixed(1)}` : '—'}</td>
                      <td>
                        {load.imageUrl ? (
                          <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${load.imageUrl}`} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent/70" title="Ver foto">
                            <ImageIcon size={16} />
                          </a>
                        ) : (
                          <span className="text-text-muted">—</span>
                        )}
                      </td>
                      <td>
                        <div className="flex gap-2 items-center justify-end">
                          <Link href={`/vehicles/${vehicle.id}/fuel-loads/${load.id}/edit`} className="text-text-muted hover:text-primary" title="Editar">
                            <Pencil size={16} />
                          </Link>
                          <button onClick={() => handleDeleteFuelLoad(load.id)} className="text-danger hover:text-red-400">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-4 gap-2 flex-wrap">
              <span className="text-sm text-text-muted">
                {fuelLoads.length} registro(s) — Página {currentPage} de {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage <= 1}
                  className="btn btn-ghost text-sm px-3 py-2"
                >
                  ← Anterior
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`btn text-sm px-3 py-2 ${p === currentPage ? 'btn-primary' : 'btn-ghost'}`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage >= totalPages}
                  className="btn btn-ghost text-sm px-3 py-2"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="mt-8 glass p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ImageIcon className="text-accent" size={20} /> Fotos del Vehículo
          </h2>
          <span className="badge badge-primary">{vehicle.images?.length || 0} / 3</span>
        </div>

        {(vehicle.images || []).length > 0 && (
          <TimeMachineGallery
            images={vehicle.images || []}
            baseUrl={process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}
            onView={(src) => setLightbox(src)}
            onDelete={handleDeleteImage}
          />
        )}

        {(vehicle.images || []).length < 3 && (
          <div
            className={`dropzone ${dragging ? "dragging" : ""}`}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus className="text-primary" size={36} />
            <p className="font-semibold text-text-primary">Arrastrá tus fotos aquí</p>
            <p className="text-sm text-text-muted">o toca para seleccionar (JPG, PNG, WebP — hasta {3 - (vehicle.images?.length || 0)} más)</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleSelectImages}
              disabled={uploadingImages}
              className="hidden"
            />
          </div>
        )}

        {pendingImages.length > 0 && (
          <div className="mt-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-text-secondary">
                {pendingImages.length} imagen(es) por subir
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    previewUrls.forEach(u => URL.revokeObjectURL(u));
                    setPendingImages([]);
                    setPreviewUrls([]);
                  }}
                  className="btn btn-ghost text-sm px-3 py-2"
                  disabled={uploadingImages}
                >
                  Cancelar
                </button>
                <button onClick={handleUploadImages} className="btn btn-primary text-sm px-3 py-2" disabled={uploadingImages}>
                  {uploadingImages ? <span className="spinner" /> : <Upload size={16} />}
                  {uploadingImages ? "Subiendo..." : "Subir ahora"}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {previewUrls.map((url, i) => (
                <div key={i} className="gallery-item">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Nueva foto ${i + 1}`} className="gallery-img" />
                  <button onClick={() => removePending(i)} className="gallery-remove" title="Quitar">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {lightbox && (
        <div className="modal-overlay" onClick={() => setLightbox(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${lightbox}`}
            alt="Vista ampliada"
            className="lightbox-img"
            onClick={e => e.stopPropagation()}
          />
          <button
            className="lightbox-close"
            onClick={() => setLightbox(null)}
            aria-label="Cerrar"
          >
            <X size={28} />
          </button>
        </div>
      )}
    </div>
  );
}
