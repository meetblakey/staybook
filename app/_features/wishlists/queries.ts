import { mapListingRecord, type ListingRecord } from "@/app/_features/listings/queries";
import type { ListingSummary } from "@/app/_features/listings/types";
import { createSupabaseServerClient } from "@/utils/supabase/server";

type WishlistRow = {
  id: string;
  title: string;
  created_at: string | null;
  items: { listing: ListingRecord | null }[] | null;
};

export type WishlistWithListings = {
  id: string;
  title: string;
  created_at: string | null;
  items: { listing: ListingSummary | null }[];
};

export async function getUserWishlists(userId: string): Promise<WishlistWithListings[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("wishlists")
    .select(
      `id, title, created_at, items:wishlist_items(listing:listings(*, host:profiles!listings_host_id_fkey(id,full_name,avatar_url), photos:listing_photos(*), reviews:reviews(overall)))`,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load wishlists", error);
    return [];
  }

  const rows = (data as WishlistRow[] | null) ?? [];

  return rows.map((wishlist) => ({
    id: wishlist.id,
    title: wishlist.title,
    created_at: wishlist.created_at,
    items:
      wishlist.items?.map((item) => ({
        listing: item.listing ? mapListingRecord(item.listing) : null,
      })) ?? [],
  }));
}
