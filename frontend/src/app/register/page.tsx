// src/app/register/page.tsx
"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Mail, Lock } from "lucide-react";
import { useStore } from "../../lib/store";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const loadAuth = useStore((state) => state.loadAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/auth/register`,
        { email, password }
      );
      // after register, login automatically
      const loginRes = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/auth/login`,
        { email, password }
      );
      localStorage.setItem("token", loginRes.data.token);
      loadAuth();
      router.push("/dashboard");
    } catch {
      setError("Registro fallido. El correo podría estar en uso.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">AutoCar Premium</div>
        <h1 className="auth-title">Crear una cuenta</h1>
        <p className="auth-subtitle">Regístrate para gestionar tus vehículos</p>

        {error && <div className="error-msg mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label className="label">Correo Electrónico</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 text-text-muted" size={18} />
              <input
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input pl-10"
              />
            </div>
          </div>

          <div className="input-group">
            <label className="label">Contraseña</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 text-text-muted" size={18} />
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input pl-10"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary mt-2" disabled={loading}>
            {loading ? (
              <span className="spinner" />
            ) : (
              <>
                <UserPlus size={18} /> Registrarse
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          ¿Ya tienes cuenta? <Link href="/login">Inicia sesión aquí</Link>
        </div>
      </div>
    </div>
  );
}
