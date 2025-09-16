import { Suspense } from "react";

import { ListingGrid } from "@/app/_components/listings/ListingGrid";
import { MapClient } from "@/app/_components/map/MapClient";
import { SearchFiltersPanel } from "@/app/_components/search/SearchFiltersPanel";
import { parseSearchParams } from "@/app/_features/search/schema";
import { searchListings } from "@/app/_features/listings/queries";

function toUrlSearchParams(params: { [key: string]: string | string[] | undefined }) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      value.forEach((item) => search.append(key, item));
    } else if (typeof value === "string") {
      search.set(key, value);
    }
  }
  return search;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const urlParams = toUrlSearchParams(resolvedParams);
  const filters = parseSearchParams(urlParams);
  const listings = await searchListings(urlParams);

  const markers = listings
    .filter((listing) => listing.coordinates)
    .map((listing) => ({
      id: listing.id,
      position: listing.coordinates!,
      title: listing.title,
      subtitle: [listing.city, listing.country].filter(Boolean).join(", "),
    }));

  return (
    <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
      <Suspense fallback={<div className="rounded-3xl bg-gray-100 p-6" />}>
        <SearchFiltersPanel />
      </Suspense>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{listings.length} stays</h1>
            <p className="text-sm text-gray-500">
              Destination: {filters.destination ?? "Anywhere"} · Guests: {filters.guests}
            </p>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
          <ListingGrid listings={listings} />
          <div className="hidden h-full overflow-hidden rounded-3xl border border-gray-100 lg:block">
            {markers.length > 0 ? (
              <MapClient markers={markers} />
            ) : (
              <div className="flex h-full items-center justify-center bg-gray-50 text-sm text-gray-500">
                Adjust filters to see map results
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
