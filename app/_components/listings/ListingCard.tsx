import Image from "next/image";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";

import type { ListingSummary } from "@/app/_features/listings/types";
import { formatCurrency } from "@/app/_lib/currency";
import { getPublicStorageUrl } from "@/app/_lib/storage";

export function ListingCard({ listing }: { listing: ListingSummary }) {
  const cover = [...listing.photos].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0];
  const coordinates = listing.coordinates;

  const coverUrl = cover ? getPublicStorageUrl("listing-photos", cover.path) : null;

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {cover && coverUrl ? (
          <Image
            src={coverUrl}
            alt={listing.title}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100 text-sm text-gray-500">
            No photo yet
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-3 text-sm font-semibold text-gray-900">
          <span className="line-clamp-1 text-left">{listing.title}</span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Star className="h-4 w-4 text-amber-400" />
            {listing.rating ? listing.rating.toFixed(2) : "New"}
          </span>
        </div>
        {(listing.city || listing.country) && (
          <p className="line-clamp-2 text-sm text-gray-500">
            <MapPin className="mr-1 inline h-4 w-4 text-gray-400" />
            {[listing.city, listing.country].filter(Boolean).join(", ")}
          </p>
        )}
        <div className="mt-auto flex items-baseline gap-1 text-sm text-gray-900">
          <span className="text-base font-semibold">{formatCurrency(listing.price_nightly, listing.currency ?? "USD")}</span>
          <span className="text-xs text-gray-500">night</span>
        </div>
        {coordinates ? (
          <p className="text-xs text-gray-400">
            {coordinates.lat.toFixed(3)}, {coordinates.lng.toFixed(3)}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
