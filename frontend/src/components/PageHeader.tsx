// src/components/PageHeader.tsx
import { ReactNode } from "react";

type Tone = "primary" | "accent" | "success" | "danger";

interface PageHeaderProps {
  icon: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  tone?: Tone;
  actions?: ReactNode;
}

const toneClass: Record<Tone, string> = {
  primary: "page-header-icon--primary",
  accent: "page-header-icon--accent",
  success: "page-header-icon--success",
  danger: "page-header-icon--danger",
};

export default function PageHeader({ icon, title, subtitle, tone = "primary", actions }: PageHeaderProps) {
  return (
    <div className="page-header-bar">
      <div className={`page-header-icon ${toneClass[tone]}`}>{icon}</div>
      <div className="page-header-text">
        <h1 className="page-header-title">{title}</h1>
        {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </div>
  );
}
