// src/lib/store.ts
import { create } from "zustand";
import { jwtDecode } from "jwt-decode";

// Tipo para el payload del JWT
type JwtPayload = {
  email: string;
  role: string;
  [key: string]: unknown;
};

type User = {
  email: string;
  role: string;
  permissions?: string[];
};

type Store = {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
  loadAuth: () => void;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const useStore = create<Store>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null });
    // redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },
  loadAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      // Consulta /auth/me para obtener permisos actualizados (el admin puede cambiarlos)
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        set({ user: { email: data.email, role: data.role, permissions: data.permissions } });
        return;
      }
    } catch {
      // fallback al JWT si el endpoint falla
    }
    try {
      const payload = jwtDecode<JwtPayload>(token);
      set({ user: { email: payload.email, role: payload.role } });
    } catch {
      console.error('Invalid token');
      localStorage.removeItem('token');
    }
  },
}));
