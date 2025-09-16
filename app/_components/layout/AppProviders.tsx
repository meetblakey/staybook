"use client";

import type { ReactNode } from "react";

import { ToastViewport } from "@/app/_components/ui/Toast";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ToastViewport />
    </>
  );
}
