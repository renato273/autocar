// src/app/login/page.tsx
"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, Mail, Lock } from "lucide-react";
import { useStore } from "../../lib/store";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const loadAuth = useStore((state) => state.loadAuth);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) router.push("/dashboard");
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/auth/login`,
        { email, password }
      );
      localStorage.setItem("token", data.token);
      loadAuth();
      router.push("/dashboard");
    } catch {
      setError("Credenciales inválidas. Por favor intenta de nuevo.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">AutoCar Premium</div>
        <h1 className="auth-title">Bienvenido de nuevo</h1>
        <p className="auth-subtitle">Ingresa a tu cuenta para continuar</p>

        <div className="demo-box">
          <p><strong>Demo Admin:</strong> admin@example.com</p>
          <p><strong>Contraseña:</strong> AdminPass123</p>
        </div>

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
                placeholder="••••••••"
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
                <LogIn size={18} /> Iniciar Sesión
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          ¿No tienes una cuenta? <Link href="/register">Regístrate aquí</Link>
        </div>
      </div>
    </div>
  );
}
