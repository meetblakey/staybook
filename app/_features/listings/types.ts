import type { Database } from "@/types/database";

export type ListingRow = Database["public"]["Tables"]["listings"]["Row"];
export type ListingPhotoRow = Database["public"]["Tables"]["listing_photos"]["Row"];
export type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export type ListingSummary = ListingRow & {
  photos: ListingPhotoRow[];
  host: Pick<ProfileRow, "id" | "full_name" | "avatar_url">;
  rating?: number | null;
  reviewsCount: number;
  coordinates?: { lat: number; lng: number } | null;
};

export type ListingDetail = ListingRow & {
  photos: ListingPhotoRow[];
  host: Pick<ProfileRow, "id" | "full_name" | "avatar_url" | "role">;
  reviews: ReviewRow[];
  coordinates?: { lat: number; lng: number } | null;
};

export type SearchResult = ListingSummary & {
  distanceKm?: number;
};
