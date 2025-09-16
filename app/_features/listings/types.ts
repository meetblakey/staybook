import type { Database, Json } from "@/types/database";

export type ListingRow = Database["public"]["Tables"]["listings"]["Row"];
export type ListingPhotoRow = Database["public"]["Tables"]["listing_photos"]["Row"];
export type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export type ListingHost = Pick<ProfileRow, "id" | "full_name" | "avatar_url"> & {
  role?: ProfileRow["role"];
};

export type CancellationPolicy = {
  id: string;
  name: string;
  rules: Json;
};

export type ListingSummary = ListingRow & {
  photos: ListingPhotoRow[];
  host: ListingHost;
  rating?: number | null;
  reviewsCount: number;
  coordinates?: { lat: number; lng: number } | null;
  cancellationPolicy?: CancellationPolicy | null;
};

export type ListingDetail = ListingSummary & {
  reviews: ReviewRow[];
};

export type SearchResult = ListingSummary & {
  distanceKm?: number;
};
