import { Avatar } from "@/app/_components/ui/Avatar";
import type { ListingDetail } from "@/app/_features/listings/types";

export function ListingHostCard({ listing }: { listing: ListingDetail }) {
  return (
    <div className="flex items-center gap-4 rounded-3xl border border-gray-100 p-4 shadow-sm">
      <Avatar src={listing.host.avatar_url} alt={listing.host.full_name ?? "Host"} className="h-16 w-16" />
      <div>
        <p className="text-lg font-semibold text-gray-900">Hosted by {listing.host.full_name ?? "Your host"}</p>
        <p className="text-sm text-gray-500">
          {listing.max_guests} guests · {listing.bedrooms ?? 0} bedrooms · {listing.bathrooms ?? 1} baths
        </p>
      </div>
    </div>
  );
}
