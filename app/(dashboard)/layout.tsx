import type { ReactNode } from "react";

import { DashboardNav } from "@/app/_components/layout/DashboardNav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[240px,1fr]">
      <DashboardNav />
      <section className="space-y-6">{children}</section>
    </div>
  );
}
