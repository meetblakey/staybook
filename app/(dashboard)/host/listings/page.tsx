import Link from "next/link";

import { ListingGrid } from "@/app/_components/listings/ListingGrid";
import { Card } from "@/app/_components/ui/Card";
import { getCurrentProfile } from "@/app/_features/auth/session";
import { getHostListings } from "@/app/_features/listings/queries";

export default async function HostListingsPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <Card className="text-center text-sm text-gray-500">Sign in to manage your listings.</Card>
    );
  }

  const listings = await getHostListings(profile.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Listings</h1>
          <p className="text-sm text-gray-500">Draft and publish new stays in minutes.</p>
        </div>
        <Link
          href="/dashboard/host/listings/new"
          className="rounded-full bg-[var(--color-brand-600)] px-4 py-2 text-sm font-semibold text-white"
        >
          Add listing
        </Link>
      </div>
      <ListingGrid listings={listings} />
    </div>
  );
}
