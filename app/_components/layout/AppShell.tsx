import type { ReactNode } from "react";

import { AppFooter } from "@/app/_components/layout/AppFooter";
import { AppHeader } from "@/app/_components/layout/AppHeader";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen grid-rows-[auto,1fr,auto] bg-white text-gray-900">
      <AppHeader />
      <main className="container mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
      <AppFooter />
    </div>
  );
}
