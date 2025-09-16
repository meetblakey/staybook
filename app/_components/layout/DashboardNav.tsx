"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, CalendarCheck, Heart, Home, List, MessageSquareText } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard/host", label: "Host overview", icon: Home },
  { href: "/dashboard/host/listings", label: "Listings", icon: List },
  { href: "/dashboard/host/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquareText },
  { href: "/dashboard/trips", label: "Trips", icon: Bookmark },
  { href: "/dashboard/wishlists", label: "Wishlists", icon: Heart },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-2xl px-4 py-2 text-sm font-semibold transition ${
              active
                ? "bg-[var(--color-brand-600)]/10 text-[var(--color-brand-700)]"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
