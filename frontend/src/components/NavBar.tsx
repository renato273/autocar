// src/components/NavBar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "../lib/store";
import { useEffect, useState } from "react";
import { Car, LayoutDashboard, Settings, LogOut, User, Menu, X } from "lucide-react";

export default function NavBar() {
  const { user, logout, loadAuth } = useStore();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadAuth();
  }, [loadAuth]);

  // Cerrar menú al cambiar de ruta en móvil
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const toggleMenu = () => setIsOpen(!isOpen);

  // Permisos por menú (si aún no cargaron, cae al rol)
  const hasAccess = (menu: string, roleFallback: boolean) => {
    if (!user) return false;
    if (user.permissions && Array.isArray(user.permissions)) {
      return user.permissions.includes(menu);
    }
    return roleFallback;
  };

  return (
    <nav className="navbar">
      <Link href="/" className="navbar-brand">
        <Car size={24} className="text-primary" />
        AutoCar
      </Link>

      <button className="mobile-menu-btn" onClick={toggleMenu} aria-label="Menu">
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`navbar-nav ${isOpen ? "mobile-open" : ""}`}>
        {user ? (
          <>
            {hasAccess("DASHBOARD", true) && (
              <Link 
                href="/dashboard" 
                className={`nav-link flex items-center gap-2 ${pathname === '/dashboard' ? 'active' : ''}`}
              >
                <LayoutDashboard size={18} /> Dashboard
              </Link>
            )}
            {hasAccess("VEHICLES", true) && (
              <Link 
                href="/vehicles" 
                className={`nav-link flex items-center gap-2 ${pathname === '/vehicles' ? 'active' : ''}`}
              >
                <Car size={18} /> Vehículos
              </Link>
            )}
            
            {hasAccess("ADMIN", user.role === "ADMIN") && (
              <Link 
                href="/admin" 
                className={`nav-link flex items-center gap-2 ${pathname === '/admin' ? 'active' : ''}`}
              >
                <Settings size={18} /> Admin
              </Link>
            )}
            
            <div className="nav-user">
              <div className="nav-avatar">
                {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </div>
              <button
                onClick={logout}
                className="btn btn-ghost"
                title="Cerrar sesión"
              >
                <LogOut size={18} /> <span className="md:hidden ml-2">Cerrar sesión</span>
              </button>
            </div>
          </>
        ) : (
          <>
            <Link href="/login" className="btn btn-ghost">
              Iniciar sesión
            </Link>
            <Link href="/register" className="btn btn-primary">
              <User size={18} /> Regístrate
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
