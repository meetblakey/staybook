import { notFound } from "next/navigation";

import { ListingAmenities } from "@/app/_components/listings/ListingAmenities";
import { ListingBookingPanel } from "@/app/_components/listings/ListingBookingPanel";
import { ListingGallery } from "@/app/_components/listings/ListingGallery";
import { ListingHostCard } from "@/app/_components/listings/ListingHostCard";
import { ListingMapSection } from "@/app/_components/listings/ListingMapSection";
import { ListingReviews } from "@/app/_components/listings/ListingReviews";
import { getListingById } from "@/app/_features/listings/queries";
import { formatCurrency } from "@/app/_lib/currency";

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getListingById(id);

  if (!listing) {
    notFound();
  }

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-gray-900">{listing.title}</h1>
        <p className="text-sm text-gray-500">
          {[listing.city, listing.state, listing.country].filter(Boolean).join(", ")} · {formatCurrency(listing.price_nightly, listing.currency ?? "USD")} night
        </p>
      </div>
      <ListingGallery listing={listing} />
      <div className="grid gap-10 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="space-y-10">
          <ListingHostCard listing={listing} />
          {listing.description ? (
            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">About this stay</h3>
              <p className="text-sm leading-relaxed text-gray-700">{listing.description}</p>
            </section>
          ) : null}
          <ListingAmenities amenities={listing.amenities} />
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Reviews</h3>
            <ListingReviews listing={listing} />
          </section>
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">Where you&apos;ll be</h3>
            <ListingMapSection listing={listing} />
          </section>
        </div>
        <ListingBookingPanel listing={listing} />
      </div>
    </div>
  );
}
