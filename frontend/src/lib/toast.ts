// src/lib/toast.ts
import { create } from "zustand";

export type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastState {
  toasts: Toast[];
  push: (type: ToastType, message: string) => void;
  remove: (id: number) => void;
}

let toastId = 0;

export const useToast = create<ToastState>((set, get) => ({
  toasts: [],
  push: (type, message) => {
    const id = ++toastId;
    set({ toasts: [...get().toasts, { id, type, message }] });
    setTimeout(() => get().remove(id), 4000);
  },
  remove: (id) => set({ toasts: get().toasts.filter(t => t.id !== id) }),
}));

export const toast = {
  success: (m: string) => useToast.getState().push("success", m),
  error: (m: string) => useToast.getState().push("error", m),
  info: (m: string) => useToast.getState().push("info", m),
  warning: (m: string) => useToast.getState().push("warning", m),
};
