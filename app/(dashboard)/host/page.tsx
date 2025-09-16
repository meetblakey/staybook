import Link from "next/link";

import { ListingGrid } from "@/app/_components/listings/ListingGrid";
import { Card } from "@/app/_components/ui/Card";
import { formatCurrency } from "@/app/_lib/currency";
import { getCurrentProfile } from "@/app/_features/auth/session";
import { getHostBookings } from "@/app/_features/bookings/queries";
import { getHostListings } from "@/app/_features/listings/queries";

export default async function HostOverviewPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <Card className="space-y-4 text-center">
        <h1 className="text-xl font-semibold text-gray-900">Sign in to manage your listings</h1>
        <p className="text-sm text-gray-500">Your host dashboard keeps an eye on bookings, payouts, and guest messages.</p>
        <Link href="/auth/login" className="inline-flex rounded-full bg-[var(--color-brand-600)] px-5 py-2 text-sm font-semibold text-white">
          Go to login
        </Link>
      </Card>
    );
  }

  const [listings, bookings] = await Promise.all([
    getHostListings(profile.id),
    getHostBookings(profile.id),
  ]);

  const publishedListings = listings.filter((listing) => listing.status === "published").length;
  const totalBookings = bookings.length;
  const projectedRevenue = bookings.reduce((total, booking) => total + Number(booking.total_price ?? 0), 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Welcome back, {profile.full_name ?? "Host"}</h1>
          <p className="text-sm text-gray-500">Track your hosting performance at a glance.</p>
        </div>
        <Link
          href="/dashboard/host/listings/new"
          className="rounded-full bg-[var(--color-brand-600)] px-4 py-2 text-sm font-semibold text-white"
        >
          Create listing
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Active listings</p>
          <p className="text-3xl font-semibold text-gray-900">{publishedListings}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Upcoming trips</p>
          <p className="text-3xl font-semibold text-gray-900">{totalBookings}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Projected revenue</p>
          <p className="text-3xl font-semibold text-gray-900">
            {formatCurrency(projectedRevenue, "USD")}
          </p>
        </Card>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Your listings</h2>
          <Link href="/dashboard/host/listings" className="text-sm font-semibold text-[var(--color-brand-600)]">
            Manage listings
          </Link>
        </div>
        <ListingGrid listings={listings.slice(0, 3)} />
      </section>
    </div>
  );
}
