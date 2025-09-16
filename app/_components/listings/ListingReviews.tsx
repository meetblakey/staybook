import { Star } from "lucide-react";

import type { ListingDetail } from "@/app/_features/listings/types";

export function ListingReviews({ listing }: { listing: ListingDetail }) {
  if (!listing.reviews || listing.reviews.length === 0) {
    return <p className="rounded-3xl border border-dashed border-gray-200 p-6 text-sm text-gray-500">No reviews yet. Be the first to stay.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
        <Star className="h-5 w-5 text-amber-400" />
        {(
          listing.reviews.reduce((total, review) => total + review.overall, 0) / listing.reviews.length
        ).toFixed(1)}
        <span className="text-sm font-normal text-gray-500">({listing.reviews.length} reviews)</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {listing.reviews.slice(0, 6).map((review) => (
          <div key={review.id} className="rounded-3xl border border-gray-100 p-4 shadow-sm">
            <p className="text-sm font-semibold text-gray-900">Overall: {review.overall}/5</p>
            {review.comment ? <p className="mt-2 text-sm text-gray-600">{review.comment}</p> : null}
            <p className="mt-3 text-xs uppercase tracking-wide text-gray-400">Stay completed on {review.created_at?.slice(0, 10)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
