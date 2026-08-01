// src/app/dashboard/page.tsx
"use client";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useStore } from "../../lib/store";
import { Activity, Car, CreditCard, Droplets, TrendingDown, TrendingUp, CalendarDays, ChevronLeft, ChevronRight, TrendingDown as PriceIcon } from "lucide-react";
import Link from "next/link";
import PageHeader from "../../components/PageHeader";
import DashboardSkeleton from "../../components/DashboardSkeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import type { FuelStats, YearlyData, PriceHistory } from "../../types";
import { formatGuarani, fuelTypeLabel } from "../../lib/format";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const PERIODS = [
  { key: "day", label: "Diario" },
  { key: "week", label: "Semanal" },
  { key: "month", label: "Mensual" },
] as const;

export default function DashboardPage() {
  const { user } = useStore();
  const router = useRouter();
  const [period, setPeriod] = useState<(typeof PERIODS)[number]["key"]>("month");
  const [stats, setStats] = useState<FuelStats | null>(null);
  const [vehicleCount, setVehicleCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [yearly, setYearly] = useState<YearlyData | null>(null);
  const [chartMode, setChartMode] = useState<"both" | "spent" | "liters">("both");
  const [pricePeriod, setPricePeriod] = useState<"week" | "month" | "year">("month");
  const [priceHistory, setPriceHistory] = useState<PriceHistory | null>(null);

  const fetchData = useCallback(async (p: typeof period) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const [statsRes, vehRes] = await Promise.all([
        axios.get(`${API_URL}/fuel/stats?period=${p}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/vehicles`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
      ]);
      setStats(statsRes.data);
      setVehicleCount(vehRes.data.length);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchYearly = useCallback(async (y: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/fuel/yearly?year=${y}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setYearly(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchPrices = useCallback(async (p: "week" | "month" | "year") => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/fuel/prices?period=${p}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPriceHistory(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchData(period);
    fetchYearly(year);
    fetchPrices(pricePeriod);
  }, [period, year, pricePeriod, router, fetchData, fetchYearly, fetchPrices]);

  if (!user) return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="spinner"></div>
    </div>
  );

  const hasData = stats && stats.loadsCount > 0;

  // Datos para el gráfico de precios: una fila por periodo, una columna por combustible
  const priceChartData = priceHistory?.series[0]?.data.map((point, i) => {
    const row: Record<string, string | number | null> = { period: point.period };
    priceHistory.series.forEach(s => {
      row[`p_${s.fuelType}`] = s.data[i]?.averagePricePerLiter ?? null;
    });
    return row;
  }) ?? [];

  const PRICE_COLORS = ["#6366f1", "#22d3ee", "#10b981", "#f59e0b", "#ef4444", "#a78bfa", "#f472b6"];

  return (
    <div className="page">
      <PageHeader
        icon={<Activity />}
        title="Dashboard"
        subtitle={`Consumos y gastos de combustible, ${user.email || 'Usuario'}`}
        tone="accent"
        actions={
          <Link href="/vehicles" className="btn btn-primary">
            <Car size={18} /> Mis Vehículos
          </Link>
        }
      />

      <div className="mt-8 flex gap-2 flex-wrap">
        {PERIODS.map(p => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`btn ${period === p.key ? 'btn-primary' : 'btn-ghost'}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <DashboardSkeleton loading={loading}>
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 my-10">
            <div className="stat-card">
              <div className="flex justify-between items-start">
                <span className="stat-label">Vehículos</span>
                <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                  <Car size={18} />
                </div>
              </div>
              <span className="stat-value">{vehicleCount}</span>
              <span className="stat-trend">Registrados</span>
            </div>

            <div className="stat-card">
              <div className="flex justify-between items-start">
                <span className="stat-label">Total Gastado</span>
                <div className="w-8 h-8 rounded-lg bg-danger/20 text-danger flex items-center justify-center">
                  <CreditCard size={18} />
                </div>
              </div>
              <span className="stat-value">{formatGuarani(stats?.totalSpent ?? 0)}</span>
              <span className="stat-trend text-text-muted">En combustible</span>
            </div>

            <div className="stat-card">
              <div className="flex justify-between items-start">
                <span className="stat-label">Litros Cargados</span>
                <div className="w-8 h-8 rounded-lg bg-accent/20 text-accent flex items-center justify-center">
                  <Droplets size={18} />
                </div>
              </div>
              <span className="stat-value">{stats?.totalLiters ?? 0} L</span>
              <span className="stat-trend">{stats?.loadsCount ?? 0} cargas</span>
            </div>

            <div className="stat-card">
              <div className="flex justify-between items-start">
                <span className="stat-label">Promedio ₲/Litro</span>
                <div className="w-8 h-8 rounded-lg bg-success/20 text-success flex items-center justify-center">
                  <Activity size={18} />
                </div>
              </div>
              <span className="stat-value">{formatGuarani(stats?.averagePricePerLiter ?? 0)}</span>
              <span className="stat-trend text-text-muted">Del periodo</span>
            </div>
          </div>

          <div className="glass p-8 rounded-2xl mt-12">
            <h2 className="text-xl font-bold mb-6">Consumo por Vehículo</h2>
            {!hasData ? (
              <div className="empty-state py-12">
                <Droplets className="empty-state-icon mb-4" />
                <h3 className="empty-state-title">Sin cargas en este periodo</h3>
                <p className="empty-state-desc">Registra cargas de combustible para ver el consumo y gastos.</p>
                <Link href="/vehicles" className="btn btn-primary mt-4">
                  <Car size={18} /> Ir a mis vehículos
                </Link>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Vehículo</th>
                      <th>Patente</th>
                      <th>Cargas</th>
                      <th>Litros</th>
                      <th>Total Gastado</th>
                      <th>₲/Litro</th>
                      <th>Consumo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats!.perVehicle.map(pv => (
                      <tr key={pv.vehicle.id}>
                        <td className="font-medium">{pv.vehicle.brand} {pv.vehicle.model}</td>
                        <td className="font-mono text-accent">{pv.vehicle.licensePlate}</td>
                        <td>{pv.loadsCount}</td>
                        <td>{pv.totalLiters} L</td>
                        <td>{formatGuarani(pv.totalSpent)}</td>
                        <td>{formatGuarani(pv.averagePricePerLiter)}</td>
                        <td>{pv.totalKmDriven > 0 ? `${pv.litersPer100km.toFixed(1)} L/100km` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="glass p-8 rounded-2xl mt-12">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center">
                  <CalendarDays size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Consumo Anual por Mes</h2>
                  <p className="text-sm text-text-secondary">Gasto y litros cargados mes a mes</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="segmented-control mr-2">
                  <button
                    className={`segmented-btn ${chartMode === "both" ? "active" : ""}`}
                    onClick={() => setChartMode("both")}
                  >
                    Ambos
                  </button>
                  <button
                    className={`segmented-btn ${chartMode === "spent" ? "active" : ""}`}
                    onClick={() => setChartMode("spent")}
                  >
                    Gasto
                  </button>
                  <button
                    className={`segmented-btn ${chartMode === "liters" ? "active" : ""}`}
                    onClick={() => setChartMode("liters")}
                  >
                    Litros
                  </button>
                </div>
                <button
                  onClick={() => setYear(y => y - 1)}
                  className="btn btn-ghost text-sm px-3 py-2"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="font-semibold text-text-primary min-w-16 text-center">{year}</span>
                <button
                  onClick={() => setYear(y => y + 1)}
                  className="btn btn-ghost text-sm px-3 py-2"
                  disabled={year >= new Date().getFullYear()}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={yearly?.data ?? []} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 12 }} stroke="rgba(255,255,255,0.1)" />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} stroke="rgba(255,255,255,0.1)" />
                  <Tooltip
                    contentStyle={{
                      background: '#161b26',
                      border: '1px solid rgba(255,255,255,0.16)',
                      borderRadius: 8,
                      color: '#f1f5f9',
                    }}
                    labelStyle={{ color: '#94a3b8', fontWeight: 600 }}
                    formatter={(value: number | string, name: string) => {
                      if (name === 'Gasto (₲)') return [formatGuarani(Number(value)), name];
                      return [`${value} L`, name];
                    }}
                  />
                  <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                  {chartMode !== "liters" && (
                    <Bar dataKey="totalSpent" name="Gasto (₲)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  )}
                  {chartMode !== "spent" && (
                    <Bar dataKey="totalLiters" name="Litros" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass p-8 rounded-2xl mt-12">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success/20 text-success rounded-xl flex items-center justify-center">
                  <PriceIcon size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Histórico de Precios</h2>
                  <p className="text-sm text-text-secondary">Precio promedio por litro según tipo de combustible</p>
                </div>
              </div>
              <div className="segmented-control">
                <button
                  className={`segmented-btn ${pricePeriod === "week" ? "active" : ""}`}
                  onClick={() => setPricePeriod("week")}
                >
                  Semanal
                </button>
                <button
                  className={`segmented-btn ${pricePeriod === "month" ? "active" : ""}`}
                  onClick={() => setPricePeriod("month")}
                >
                  Mensual
                </button>
                <button
                  className={`segmented-btn ${pricePeriod === "year" ? "active" : ""}`}
                  onClick={() => setPricePeriod("year")}
                >
                  Anual
                </button>
              </div>
            </div>

            {priceHistory && priceHistory.series.length > 0 ? (
              <div style={{ width: '100%', height: Math.max(300, priceChartData.length * 46) }}>
                <ResponsiveContainer>
                  <BarChart data={priceChartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} stroke="rgba(255,255,255,0.1)" />
                    <YAxis
                      type="category"
                      dataKey="period"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      stroke="rgba(255,255,255,0.1)"
                      width={70}
                      interval={0}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#161b26',
                        border: '1px solid rgba(255,255,255,0.16)',
                        borderRadius: 8,
                        color: '#f1f5f9',
                      }}
                      labelStyle={{ color: '#94a3b8', fontWeight: 600 }}
                      formatter={(value: number | string, name: string) => {
                        const label = name.replace('p_', '');
                        return [formatGuarani(Number(value)), fuelTypeLabel(label)];
                      }}
                    />
                    <Legend
                      wrapperStyle={{ color: '#94a3b8', fontSize: 12 }}
                      formatter={(value: string) => fuelTypeLabel(value.replace('p_', ''))}
                    />
                    {priceHistory.series.map((s, i) => (
                      <Bar
                        key={s.fuelType}
                        dataKey={`p_${s.fuelType}`}
                        name={`p_${s.fuelType}`}
                        fill={PRICE_COLORS[i % PRICE_COLORS.length]}
                        radius={[0, 4, 4, 0]}
                        maxBarSize={20}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="empty-state py-8">
                <PriceIcon className="empty-state-icon mb-4" />
                <p className="text-sm text-text-muted">
                  No hay datos de precios registrados aún. Carga combustible con precio por litro para ver el histórico.
                </p>
              </div>
            )}
          </div>

          {stats && stats.averagePricePerLiter > 0 && (
            <div className="glass p-8 rounded-2xl mt-12 flex items-center gap-5">
              {stats.averagePricePerLiter > 9000 ? (
                <TrendingUp className="text-danger" size={28} />
              ) : (
                <TrendingDown className="text-success" size={28} />
              )}
              <div>
                <p className="text-sm text-text-secondary">Indicador de mercado</p>
                <p className="font-semibold">
                  {stats.averagePricePerLiter > 9000
                    ? "El precio promedio del combustible está por encima de lo habitual."
                    : "El precio promedio del combustible está en un rango razonable."}
                </p>
              </div>
            </div>
          )}
        </>
      </DashboardSkeleton>
    </div>
  );
}
