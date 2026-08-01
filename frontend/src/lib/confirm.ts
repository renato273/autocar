// src/lib/confirm.ts
import { create } from "zustand";

interface ConfirmState {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  danger: boolean;
  resolve?: (value: boolean) => void;
  confirm: (opts: { title?: string; message: string; confirmLabel?: string; danger?: boolean }) => Promise<boolean>;
  close: (result: boolean) => void;
}

export const useConfirm = create<ConfirmState>((set, get) => ({
  open: false,
  title: "¿Confirmar?",
  message: "",
  confirmLabel: "Confirmar",
  danger: true,
  resolve: undefined,
  confirm: (opts) =>
    new Promise<boolean>((resolve) => {
      set({
        open: true,
        title: opts.title ?? "¿Confirmar?",
        message: opts.message,
        confirmLabel: opts.confirmLabel ?? "Confirmar",
        danger: opts.danger ?? true,
        resolve,
      });
    }),
  close: (result) => {
    const r = get().resolve;
    set({ open: false, resolve: undefined });
    r?.(result);
  },
}));
