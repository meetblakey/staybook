import Link from "next/link";

import { ListingGrid } from "@/app/_components/listings/ListingGrid";
import { getFeaturedListings } from "@/app/_features/listings/queries";

const FEATURED_CITIES = [
  {
    name: "Lisbon",
    description: "Sun-soaked rooftops and ocean breeze.",
    image:
      "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Kyoto",
    description: "Temple walks and artisan tea houses.",
    image:
      "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Mexico City",
    description: "Colorful barrios and vibrant markets.",
    image:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
  },
];

export default async function HomePage() {
  const featuredListings = await getFeaturedListings();

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl border border-gray-100 bg-gradient-to-br from-[var(--color-brand-600)] to-[var(--color-brand-700)] px-8 py-16 text-white shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.2),transparent_60%)]" />
        <div className="relative z-10 grid gap-8 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            <span className="rounded-full bg-white/10 px-4 py-1 text-sm font-semibold uppercase tracking-wide">Local-first hosting</span>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              Staybook makes it effortless to host and stay anywhere
            </h1>
            <p className="max-w-xl text-base text-white/80">
              Discover design-forward homes, instant insights for hosts, and realtime messaging backed by Supabase.
            </p>
            <div className="flex flex-wrap gap-3 text-sm font-semibold">
              <Link
                href="/search"
                className="rounded-full bg-white px-5 py-3 text-gray-900 shadow-lg shadow-black/10 transition hover:-translate-y-1"
              >
                Explore stays
              </Link>
              <Link
                href="/dashboard/host/listings/new"
                className="rounded-full border border-white/40 px-5 py-3 text-white transition hover:bg-white/10"
              >
                Become a host
              </Link>
            </div>
          </div>
          <div className="grid gap-4">
            {FEATURED_CITIES.map((city) => (
              <div key={city.name} className="rounded-3xl bg-white/10 p-5 backdrop-blur">
                <p className="text-lg font-semibold">{city.name}</p>
                <p className="text-sm text-white/80">{city.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">Featured homes for your next trip</h2>
          <Link href="/search" className="text-sm font-semibold text-[var(--color-brand-600)] hover:text-[var(--color-brand-700)]">
            View all
          </Link>
        </div>
        <ListingGrid listings={featuredListings} />
      </section>
    </div>
  );
}
