import type { ListingSummary } from "@/app/_features/listings/types";
import { ListingCard } from "@/app/_components/listings/ListingCard";

export function ListingGrid({ listings }: { listings: ListingSummary[] }) {
  if (listings.length === 0) {
    return <p className="rounded-3xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">No stays match your filters yet. Try adjusting your search.</p>;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
