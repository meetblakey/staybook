import type { Metadata } from "next";

import { AppProviders } from "@/app/_components/layout/AppProviders";
import { AppShell } from "@/app/_components/layout/AppShell";
import "@/app/_styles/globals.css";

export const metadata: Metadata = {
  title: "staybook",
  description: "Staybook — local-first, host-friendly stays with Supabase & Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-gray-50 text-gray-800">
      <body className="font-sans antialiased">
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
