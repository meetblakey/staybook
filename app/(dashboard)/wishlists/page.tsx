import Link from "next/link";

import { ListingCard } from "@/app/_components/listings/ListingCard";
import { Card } from "@/app/_components/ui/Card";
import { getCurrentProfile } from "@/app/_features/auth/session";
import { getUserWishlists, type WishlistWithListings } from "@/app/_features/wishlists/queries";

export default async function WishlistsPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return <Card className="text-sm text-gray-500">Sign in to manage wishlists.</Card>;
  }

  const wishlists = await getUserWishlists(profile.id);

  if (wishlists.length === 0) {
    return (
      <Card className="space-y-3 text-center">
        <p className="text-sm text-gray-500">Save your favorite stays to plan future trips.</p>
        <Link href="/search" className="text-sm font-semibold text-[var(--color-brand-600)]">
          Browse stays
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Wishlists</h1>
        <p className="text-sm text-gray-500">Collect stays and share them with friends.</p>
      </div>
      {wishlists.map((wishlist: WishlistWithListings) => (
        <div key={wishlist.id} className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">{wishlist.title}</h2>
            <span className="text-xs text-gray-500">{wishlist.items?.length ?? 0} stays</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {wishlist.items.length > 0 ? (
              wishlist.items
                .filter((item) => item.listing)
                .map((item) => <ListingCard key={item.listing!.id} listing={item.listing!} />)
            ) : (
              <p className="text-sm text-gray-500">No stays yet.</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
