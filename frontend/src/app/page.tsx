// src/app/page.tsx
"use client";
import Link from "next/link";
import { Car, ShieldCheck, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="page flex flex-col items-center justify-center min-h-[80vh] text-center">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-muted text-primary mb-6 animate-fade-in">
        <Car size={18} />
        <span className="text-sm font-semibold tracking-wide">AUTOCAR PREMIUM</span>
      </div>
      
      <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
        Gestión Vehicular <br /> del Futuro
      </h1>
      
      <p className="text-lg text-text-secondary max-w-2xl mb-10 leading-relaxed">
        Controla el rendimiento, los gastos y el mantenimiento de tu flota o vehículo personal con nuestra plataforma avanzada de telemetría y administración.
      </p>

      <div className="flex flex-wrap gap-4 justify-center mb-16">
        <Link href="/register" className="btn btn-primary px-8 py-3 text-lg rounded-full shadow-[0_0_20px_rgba(99,102,241,0.4)]">
          Comenzar Gratis
        </Link>
        <Link href="/login" className="btn btn-ghost px-8 py-3 text-lg rounded-full border border-border hover:border-primary">
          Iniciar Sesión
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <div className="glass p-6 rounded-2xl flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-primary-muted text-primary rounded-xl flex items-center justify-center mb-4">
            <ShieldCheck size={24} />
          </div>
          <h3 className="text-lg font-bold mb-2 text-text-primary">Seguro y Privado</h3>
          <p className="text-sm text-text-secondary">Tus datos están encriptados y seguros bajo los más altos estándares.</p>
        </div>
        
        <div className="glass p-6 rounded-2xl flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-accent-muted text-accent rounded-xl flex items-center justify-center mb-4">
            <Zap size={24} />
          </div>
          <h3 className="text-lg font-bold mb-2 text-text-primary">Rápido e Intuitivo</h3>
          <p className="text-sm text-text-secondary">Interfaz diseñada para ofrecer la mejor experiencia de usuario.</p>
        </div>

        <div className="glass p-6 rounded-2xl flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-success/10 text-success rounded-xl flex items-center justify-center mb-4">
            <Car size={24} />
          </div>
          <h3 className="text-lg font-bold mb-2 text-text-primary">Multi-Vehículo</h3>
          <p className="text-sm text-text-secondary">Gestiona desde un solo auto hasta una flota completa fácilmente.</p>
        </div>
      </div>
    </div>
  );
}
