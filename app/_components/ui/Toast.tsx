"use client";

import { useEffect } from "react";
import { create } from "zustand";
import clsx from "clsx";

export type ToastVariant = "default" | "success" | "error";

export type ToastMessage = {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
};

type ToastStore = {
  toasts: ToastMessage[];
  add: (toast: ToastMessage) => void;
  dismiss: (id: string) => void;
};

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (toast) => set((state) => ({ toasts: [...state.toasts, toast] })),
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}));

export function pushToast(payload: { title: string; description?: string; variant?: ToastVariant }) {
  const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  useToastStore.getState().add({ id, title: payload.title, description: payload.description, variant: payload.variant ?? "default" });
  return id;
}

const variantClasses: Record<ToastVariant, string> = {
  default: "border-gray-200 bg-white text-gray-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-red-200 bg-red-50 text-red-700",
};

function ToastItem({ toast }: { toast: ToastMessage }) {
  const dismiss = useToastStore((state) => state.dismiss);

  useEffect(() => {
    const timer = window.setTimeout(() => dismiss(toast.id), 5000);
    return () => window.clearTimeout(timer);
  }, [dismiss, toast.id]);

  return (
    <div
      className={clsx(
        "flex w-72 flex-col gap-1 rounded-2xl border px-4 py-3 shadow-lg",
        variantClasses[toast.variant],
      )}
    >
      <div className="flex items-center justify-between text-sm font-semibold">
        {toast.title}
        <button type="button" onClick={() => dismiss(toast.id)} className="text-xs uppercase tracking-wide">
          Close
        </button>
      </div>
      {toast.description ? <p className="text-xs text-gray-600">{toast.description}</p> : null}
    </div>
  );
}

export function ToastViewport() {
  const toasts = useToastStore((state) => state.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-3">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
