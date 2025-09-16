import { CheckCircle } from "lucide-react";

export function ListingAmenities({ amenities }: { amenities: unknown }) {
  const list = Array.isArray(amenities) ? (amenities as string[]) : [];

  if (list.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900">What this place offers</h3>
      <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
        {list.map((amenity) => (
          <span key={amenity} className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-[var(--color-brand-600)]" /> {amenity}
          </span>
        ))}
      </div>
    </div>
  );
}
