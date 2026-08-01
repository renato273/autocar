// src/components/Toaster.tsx
"use client";
import { CheckCircle2, AlertCircle, Info, TriangleAlert, X } from "lucide-react";
import { useToast } from "../lib/toast";
import { useConfirm } from "../lib/confirm";

const ICONS = {
  success: <CheckCircle2 size={18} className="text-success" />,
  error: <AlertCircle size={18} className="text-danger" />,
  info: <Info size={18} className="text-accent" />,
  warning: <TriangleAlert size={18} className="text-warning" />,
};

export function Toaster() {
  const toasts = useToast(s => s.toasts);
  const remove = useToast(s => s.remove);

  const confirmState = useConfirm();

  return (
    <>
      {/* Toast viewport */}
      <div className="toast-viewport" role="status" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`} onMouseEnter={() => remove(t.id)}>
            <span className="toast-icon">{ICONS[t.type]}</span>
            <span className="toast-message">{t.message}</span>
            <button className="toast-close" onClick={() => remove(t.id)} aria-label="Cerrar">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Confirm dialog */}
      {confirmState.open && (
        <div className="modal-overlay" onClick={() => confirmState.close(false)}>
          <div className="modal" role="alertdialog" aria-modal="true" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">{confirmState.title}</h3>
            <p className="text-sm text-text-secondary mb-6">{confirmState.message}</p>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => confirmState.close(false)}>
                Cancelar
              </button>
              <button
                className={`btn ${confirmState.danger ? "btn-danger" : "btn-primary"}`}
                onClick={() => confirmState.close(true)}
              >
                {confirmState.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
