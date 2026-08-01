// src/app/admin/page.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useStore } from "../../lib/store";
import { ShieldAlert, Users, Tag, Lock, Plus, Trash2, UserPlus, ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import { toast } from "../../lib/toast";
import { useConfirm } from "../../lib/confirm";
import type { Brand, AdminUser, MenuPermission } from "../../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
});

const BRANDS_PER_PAGE = 6;

const MENU_LABELS: Record<string, string> = {
  DASHBOARD: "Dashboard",
  VEHICLES: "Vehículos",
  ADMIN: "Panel Admin",
};

type Section = "users" | "brands" | "permissions";

export default function AdminPage() {
  const { user } = useStore();
  const router = useRouter();
  const confirm = useConfirm(s => s.confirm);

  const [section, setSection] = useState<Section>("users");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const dragging = useRef(false);
  const splitRef = useRef<HTMLDivElement>(null);

  const [brands, setBrands] = useState<Brand[]>([]);
  const [newBrand, setNewBrand] = useState("");
  const [brandError, setBrandError] = useState("");
  const [brandPage, setBrandPage] = useState(1);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [newUser, setNewUser] = useState({ email: "", password: "", role: "USER" });
  const [userError, setUserError] = useState("");

  const [permUser, setPermUser] = useState<number | null>(null);
  const [perms, setPerms] = useState<MenuPermission[]>([]);
  const [permSaving, setPermSaving] = useState(false);
  const [permError, setPermError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    if (user && user.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
    fetchBrands();
    fetchUsers();
  }, [user, router]);

  const fetchBrands = async () => {
    try {
      const res = await axios.get(`${API_URL}/brands`, getAuthHeaders());
      setBrands(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/users`, getAuthHeaders());
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newBrand.trim();
    if (!name) return;
    setBrandError("");
    try {
      await axios.post(`${API_URL}/brands`, { name }, getAuthHeaders());
      setNewBrand("");
      fetchBrands();
      toast.success("Marca añadida correctamente");
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { error?: string } | undefined)?.error
        : undefined;
      setBrandError(message || "Error al crear la marca");
      toast.error(message || "Error al crear la marca");
    }
  };

  const handleDeleteBrand = async (id: number) => {
    const ok = await confirm({
      title: "Eliminar marca",
      message: "¿Eliminar esta marca? Los vehículos asociados podrían verse afectados.",
      confirmLabel: "Eliminar",
    });
    if (!ok) return;
    try {
      await axios.delete(`${API_URL}/brands/${id}`, getAuthHeaders());
      const updated = brands.filter(b => b.id !== id);
      setBrands(updated);
      const totalPages = Math.max(1, Math.ceil(updated.length / BRANDS_PER_PAGE));
      if (brandPage > totalPages) setBrandPage(totalPages);
      toast.success("Marca eliminada");
    } catch {
      toast.error("Error al eliminar la marca. Puede que tenga vehículos asociados.");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.email || !newUser.password) return;
    setUserError("");
    try {
      await axios.post(`${API_URL}/users`, newUser, getAuthHeaders());
      setNewUser({ email: "", password: "", role: "USER" });
      fetchUsers();
      toast.success("Usuario creado correctamente");
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { error?: string } | undefined)?.error
        : undefined;
      setUserError(message || "Error al crear el usuario");
      toast.error(message || "Error al crear el usuario");
    }
  };

  const handleChangeRole = async (id: number, role: string) => {
    try {
      await axios.put(`${API_URL}/users/${id}`, { role }, getAuthHeaders());
      setUsers(users.map(u => u.id === id ? { ...u, role } : u));
      toast.success("Rol actualizado");
    } catch {
      toast.error("Error al cambiar el rol");
    }
  };

  const handleDeleteUser = async (id: number) => {
    const ok = await confirm({
      title: "Eliminar usuario",
      message: "¿Eliminar este usuario? Se eliminarán también sus vehículos.",
      confirmLabel: "Eliminar",
    });
    if (!ok) return;
    try {
      await axios.delete(`${API_URL}/users/${id}`, getAuthHeaders());
      setUsers(users.filter(u => u.id !== id));
      if (permUser === id) {
        setPermUser(null);
        setPerms([]);
      }
      toast.success("Usuario eliminado");
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { error?: string } | undefined)?.error
        : undefined;
      toast.error(message || "Error al eliminar el usuario");
    }
  };

  const loadPerms = async (id: number) => {
    setPermError("");
    try {
      const res = await axios.get(`${API_URL}/permissions/users/${id}`, getAuthHeaders());
      setPerms(res.data.permissions);
      setPermUser(id);
    } catch (err) {
      console.error(err);
      setPermError("Error al cargar los permisos");
      toast.error("Error al cargar los permisos");
    }
  };

  const togglePerm = (menu: string) => {
    setPerms(perms.map(p => p.menu === menu ? { ...p, enabled: !p.enabled } : p));
  };

  const savePerms = async () => {
    if (permUser == null) return;
    setPermSaving(true);
    setPermError("");
    try {
      await axios.put(
        `${API_URL}/permissions/users/${permUser}`,
        { permissions: perms },
        getAuthHeaders()
      );
      toast.success("Permisos actualizados correctamente");
    } catch (err) {
      console.error(err);
      setPermError("Error al guardar los permisos");
      toast.error("Error al guardar los permisos");
    } finally {
      setPermSaving(false);
    }
  };

  // ---- Paginado de marcas ----
  const brandTotalPages = Math.max(1, Math.ceil(brands.length / BRANDS_PER_PAGE));
  const currentBrandPage = Math.min(brandPage, brandTotalPages);
  const paginatedBrands = brands.slice((currentBrandPage - 1) * BRANDS_PER_PAGE, currentBrandPage * BRANDS_PER_PAGE);

  // ---- Divider arrastrable ----
  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    (e.currentTarget as HTMLElement).classList.add('dragging');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMove = (ev: MouseEvent) => {
      if (!splitRef.current) return;
      const rect = splitRef.current.getBoundingClientRect();
      const width = ev.clientX - rect.left;
      setSidebarWidth(Math.min(420, Math.max(160, width)));
      setSidebarCollapsed(false);
    };
    const onUp = () => {
      dragging.current = false;
      document.querySelectorAll('.admin-divider').forEach(el => el.classList.remove('dragging'));
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  if (!user || user.role !== "ADMIN") return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="spinner"></div>
    </div>
  );

  const sections: { key: Section; label: string; icon: React.ReactNode }[] = [
    { key: "users", label: "Usuarios y Roles", icon: <Users size={18} /> },
    { key: "brands", label: "Marcas", icon: <Tag size={18} /> },
    { key: "permissions", label: "Permisos de Menús", icon: <Lock size={18} /> },
  ];

  return (
    <div className="page">
      <PageHeader
        icon={<ShieldAlert />}
        title="Panel de Administración"
        subtitle="Zona de configuración y gestión global"
        tone="danger"
      />

      <div className="admin-split" ref={splitRef}>
        <aside
          className={`admin-sidebar ${sidebarCollapsed ? "collapsed" : ""}`}
          style={sidebarCollapsed ? undefined : { width: sidebarWidth }}
        >
          <div className="admin-sidebar-label">Secciones</div>
          {sections.map(s => (
            <button
              key={s.key}
              className={`admin-nav-item ${section === s.key ? "active" : ""}`}
              onClick={() => setSection(s.key)}
            >
              {s.icon}
              <span className="admin-nav-text">{s.label}</span>
            </button>
          ))}
          <button
            className="admin-nav-item"
            onClick={() => setSidebarCollapsed(c => !c)}
            title={sidebarCollapsed ? "Expandir" : "Colapsar"}
          >
            {sidebarCollapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
            <span className="admin-nav-text">{sidebarCollapsed ? "" : "Colapsar panel"}</span>
          </button>
        </aside>

        <div className={`admin-divider ${dragging.current ? "dragging" : ""}`} onMouseDown={startDrag} />

        <main className="admin-content">
          {section === "users" && (
            <>
              <div className="admin-content-header">
                <div className="admin-content-title">
                  <div className="admin-content-icon bg-danger/20 text-danger">
                    <Users size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Usuarios y Roles</h2>
                    <p className="text-sm text-text-secondary">Crea usuarios y controla sus roles</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleCreateUser} className="glass-elevated p-4 mb-4 flex items-center gap-2 flex-wrap">
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="email@dominio.com"
                  className="input"
                  required
                />
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Contraseña"
                  className="input"
                  required
                  minLength={6}
                />
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="input w-auto"
                >
                  <option value="USER">Usuario</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <button type="submit" className="btn btn-primary whitespace-nowrap">
                  <UserPlus size={18} /> Crear
                </button>
              </form>

              {userError && <div className="error-msg mb-4">{userError}</div>}

              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Email</th>
                      <th>Vehículos</th>
                      <th>Rol</th>
                      <th className="text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td className="font-medium">{u.email}</td>
                        <td>{u._count?.vehicles ?? 0}</td>
                        <td>
                          <select
                            value={u.role}
                            onChange={(e) => handleChangeRole(u.id, e.target.value)}
                            className="input !py-1 !px-2 w-auto"
                            disabled={u.email === user.email}
                          >
                            <option value="USER">Usuario</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                        </td>
                        <td className="text-right">
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="text-danger hover:text-red-400 disabled:opacity-40"
                            disabled={u.email === user.email}
                            aria-label={`Eliminar ${u.email}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {section === "brands" && (
            <>
              <div className="admin-content-header">
                <div className="admin-content-title">
                  <div className="admin-content-icon bg-primary/20 text-primary">
                    <Tag size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Gestor de Marcas</h2>
                    <p className="text-sm text-text-secondary">Listado predeterminado de marcas populares</p>
                  </div>
                </div>
                <form onSubmit={handleAddBrand} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    placeholder="Nueva marca..."
                    className="input"
                  />
                  <button type="submit" className="btn btn-primary whitespace-nowrap">
                    <Plus size={18} /> Añadir
                  </button>
                </form>
              </div>

              {brandError && <div className="error-msg mb-4">{brandError}</div>}

              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th className="text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedBrands.map(brand => (
                      <tr key={brand.id}>
                        <td>{brand.id}</td>
                        <td>{brand.name}</td>
                        <td className="text-right">
                          <button onClick={() => handleDeleteBrand(brand.id)} className="text-danger hover:text-red-400" aria-label={`Eliminar ${brand.name}`}>
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {brands.length === 0 && (
                  <p className="text-center text-text-muted py-4">No hay marcas registradas.</p>
                )}
              </div>

              {brands.length > 0 && (
                <div className="flex items-center justify-between mt-4 gap-2 flex-wrap">
                  <span className="text-sm text-text-muted">
                    {brands.length} marca(s) — Página {currentBrandPage} de {brandTotalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setBrandPage(prev => Math.max(1, prev - 1))}
                      disabled={currentBrandPage <= 1}
                      className="btn btn-ghost text-sm px-3 py-2"
                    >
                      <ChevronLeft size={16} /> Anterior
                    </button>
                    {Array.from({ length: brandTotalPages }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        onClick={() => setBrandPage(p)}
                        className={`btn text-sm px-3 py-2 ${p === currentBrandPage ? 'btn-primary' : 'btn-ghost'}`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => setBrandPage(prev => Math.min(brandTotalPages, prev + 1))}
                      disabled={currentBrandPage >= brandTotalPages}
                      className="btn btn-ghost text-sm px-3 py-2"
                    >
                      Siguiente <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {section === "permissions" && (
            <>
              <div className="admin-content-header">
                <div className="admin-content-title">
                  <div className="admin-content-icon bg-accent/20 text-accent">
                    <Lock size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Permisos de Menús</h2>
                    <p className="text-sm text-text-secondary">
                      Habilita o deshabilita los menús que verá cada usuario
                    </p>
                  </div>
                </div>
              </div>

              {permError && <div className="error-msg mb-4">{permError}</div>}

              <div className="input-group mb-6">
                <label className="label">Selecciona un usuario</label>
                <select
                  className="input"
                  value={permUser ?? ""}
                  onChange={(e) => {
                    const id = e.target.value ? Number(e.target.value) : null;
                    if (id != null) loadPerms(id);
                    else { setPermUser(null); setPerms([]); }
                  }}
                >
                  <option value="">— Elegir usuario —</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.email} ({u.role})</option>
                  ))}
                </select>
              </div>

              {permUser == null ? (
                <div className="empty-state py-8">
                  <Lock className="empty-state-icon mb-4" />
                  <p className="text-sm text-text-muted">
                    Elige un usuario para ver y configurar los menús que podrá ver.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-3 mb-6">
                    {perms.map(p => (
                      <div key={p.menu} className="glass-elevated flex items-center justify-between gap-4 p-4">
                        <div>
                          <p className="font-semibold text-text-primary">{MENU_LABELS[p.menu] ?? p.menu}</p>
                          <p className="text-xs text-text-muted">{p.menu}</p>
                        </div>
                        <button
                          onClick={() => togglePerm(p.menu)}
                          className={`toggle ${p.enabled ? 'toggle-on' : 'toggle-off'}`}
                          aria-label={`${MENU_LABELS[p.menu]} ${p.enabled ? 'deshabilitar' : 'habilitar'}`}
                        >
                          <span className={`toggle-knob ${p.enabled ? 'toggle-knob-on' : 'toggle-knob-off'}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => { setPermUser(null); setPerms([]); }}
                      className="btn btn-ghost"
                    >
                      Cancelar
                    </button>
                    <button onClick={savePerms} className="btn btn-primary" disabled={permSaving}>
                      {permSaving ? <span className="spinner" /> : <><Lock size={18} /> Guardar Permisos</>}
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
