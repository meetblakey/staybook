import { MapClient } from "@/app/_components/map/MapClient";
import type { ListingDetail } from "@/app/_features/listings/types";

export function ListingMapSection({ listing }: { listing: ListingDetail }) {
  if (!listing.coordinates) {
    return null;
  }

  return (
    <div className="h-80 overflow-hidden rounded-3xl">
      <MapClient
        markers={[
          {
            id: listing.id,
            position: listing.coordinates,
            title: listing.title,
            subtitle: `${listing.city ?? ""}, ${listing.country ?? ""}`,
          },
        ]}
        center={listing.coordinates}
        zoom={13}
      />
    </div>
  );
}
