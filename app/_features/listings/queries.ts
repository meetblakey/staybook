import { cache } from "react";

import { parseSearchParams, type SearchParamsInput } from "@/app/_features/search/schema";
import type {
  ListingDetail,
  ListingPhotoRow,
  ListingRow,
  ListingSummary,
  ProfileRow,
  ReviewRow,
  SearchResult,
} from "@/app/_features/listings/types";
import { calculateHaversineDistanceKm } from "@/app/_lib/geo";
import type { MapBounds } from "@/app/_lib/geo";
import { parseBounds } from "@/app/_lib/geo";
import { createSupabaseServerClient } from "@/utils/supabase/server";

const listingSelect = `*, host:profiles!listings_host_id_fkey(id,full_name,avatar_url,role), photos:listing_photos(*), reviews:reviews(*)`;

export type ListingRecord = ListingRow & {
  photos: ListingPhotoRow[];
  host: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    role?: string | null;
  } | null;
  reviews: ReviewRow[] | null;
};

type Coordinates = { lat: number; lng: number } | null;

const toCoordinates = (location: unknown): Coordinates => {
  if (!location || typeof location !== "object" || !("coordinates" in location)) {
    return null;
  }

  const coordinates = (location as { coordinates?: number[] }).coordinates;
  if (!coordinates || coordinates.length < 2) {
    return null;
  }

  const [lng, lat] = coordinates;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return { lat, lng };
};

export const mapListingRecord = (record: ListingRecord): ListingSummary => {
  const coordinates = toCoordinates(record.location);
  const reviews = record.reviews ?? [];
  const reviewsCount = reviews.length;
  const rating = reviewsCount > 0 ? reviews.reduce((total, item) => total + item.overall, 0) / reviewsCount : null;

  return {
    ...record,
    coordinates,
    reviewsCount,
    rating,
    host: {
      id: record.host?.id ?? "",
      full_name: record.host?.full_name ?? null,
      avatar_url: record.host?.avatar_url ?? null,
    },
  };
};

const mapListingToDetail = (record: ListingRecord & { reviews: { overall: number }[] }): ListingDetail => {
  const summary = mapListingRecord(record);
  return {
    ...summary,
    host: {
      id: record.host?.id ?? "",
      full_name: record.host?.full_name ?? null,
      avatar_url: record.host?.avatar_url ?? null,
      role: (record.host?.role as ProfileRow["role"] | undefined) ?? "host",
    },
    reviews: record.reviews ?? [],
  };
};

export const getFeaturedListings = cache(async (limit = 8): Promise<ListingSummary[]> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("listings")
    .select(listingSelect)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to load featured listings", error);
    return [];
  }

  return (data as ListingRecord[]).map(mapListingRecord);
});

export const getListingById = cache(async (id: string): Promise<ListingDetail | null> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("listings")
    .select(listingSelect)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Failed to load listing", error);
    return null;
  }

  if (!data) return null;

  return mapListingToDetail(data as ListingRecord & { reviews: { overall: number }[] });
});

const getBoundsCenter = (bounds: MapBounds | null) => {
  if (!bounds) return null;
  const lat = (bounds.north + bounds.south) / 2;
  const lng = (bounds.east + bounds.west) / 2;
  return { lat, lng };
};

export async function searchListings(input: SearchParamsInput | URLSearchParams): Promise<SearchResult[]> {
  const supabase = await createSupabaseServerClient();
  const filters = parseSearchParams(input);
  const bounds = parseBounds(filters.bounds);
  const center = getBoundsCenter(bounds);

  let query = supabase.from("listings").select(listingSelect).eq("status", "published");

  if (filters.destination) {
    query = query.textSearch("search", filters.destination, { type: "websearch" });
  }

  if (filters.priceMin) {
    query = query.gte("price_nightly", filters.priceMin);
  }

  if (filters.priceMax) {
    query = query.lte("price_nightly", filters.priceMax);
  }

  if (filters.propertyType) {
    query = query.eq("property_type", filters.propertyType);
  }

  if (filters.roomType) {
    query = query.eq("room_type", filters.roomType);
  }

  if (filters.amenitiesList.length > 0) {
    for (const amenity of filters.amenitiesList) {
      query = query.contains("amenities", [amenity]);
    }
  }

  const { data, error } = await query.limit(60);

  if (error) {
    console.error("Search query failed", error);
    return [];
  }

  const results = (data as ListingRecord[]).map(mapListingRecord);

  if (!center) {
    return results;
  }

  return results
    .map((result) => {
      const coordinates = result.coordinates;
      const distanceKm = coordinates ? calculateHaversineDistanceKm(center, coordinates) : undefined;
      return { ...result, distanceKm };
    })
    .sort((a, b) => {
      if (filters.sort === "price_asc") return Number(a.price_nightly) - Number(b.price_nightly);
      if (filters.sort === "price_desc") return Number(b.price_nightly) - Number(a.price_nightly);
      if (filters.sort === "rating_desc") return (b.rating ?? 0) - (a.rating ?? 0);
      return (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity);
    });
}

export async function getHostListings(hostId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("listings")
    .select(listingSelect)
    .eq("host_id", hostId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load host listings", error);
    return [];
  }

  return (data as ListingRecord[]).map(mapListingRecord);
}
