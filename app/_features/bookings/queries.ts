import { createSupabaseServerClient } from "@/utils/supabase/server";

export async function getGuestBookings(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(
      `*, listing:listings(id,title,city,country,currency,price_nightly,photos:listing_photos(path,sort_order))`,
    )
    .eq("guest_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load guest bookings", error);
    return [];
  }

  return data ?? [];
}

export async function getHostBookings(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(
      `*, listing:listings(id,title,city,country,currency,price_nightly,photos:listing_photos(path,sort_order),host_id), guest:profiles!bookings_guest_id_fkey(id,full_name,avatar_url)`,
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load host bookings", error);
    return [];
  }

  return (data ?? []).filter((booking) => booking.listing?.host_id === userId);
}

export async function getListingCalendar(listingId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("id,date_range,status,kind")
    .eq("listing_id", listingId);

  if (error) {
    console.error("Failed to load calendar", error);
    return [];
  }

  return data ?? [];
}
