import Image from "next/image";

import type { ListingDetail } from "@/app/_features/listings/types";
import { getPublicStorageUrl } from "@/app/_lib/storage";

export function ListingGallery({ listing }: { listing: ListingDetail }) {
  const images = [...listing.photos].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  if (images.length === 0) {
    return <div className="h-64 rounded-3xl bg-gray-100" />;
  }

  const [hero, ...rest] = images;
  const heroUrl = getPublicStorageUrl("listing-photos", hero.path);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl md:row-span-2">
        {heroUrl ? (
          <Image src={heroUrl} alt={listing.title} fill className="object-cover" />
        ) : (
          <div className="h-full w-full bg-gray-100" />
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {rest.slice(0, 4).map((photo) => {
          const url = getPublicStorageUrl("listing-photos", photo.path);
          return (
            <div key={photo.id} className="relative aspect-square overflow-hidden rounded-2xl">
              {url ? (
                <Image src={url} alt={`${listing.title} photo`} fill className="object-cover" />
              ) : (
                <div className="h-full w-full bg-gray-100" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
