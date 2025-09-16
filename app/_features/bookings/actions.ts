"use server";

import { revalidatePath } from "next/cache";

import { createBookingSchema, type CancelBookingInput, type CreateBookingInput, cancelBookingSchema } from "@/app/_features/bookings/schema";
import { recordAuditLog } from "@/utils/audit/log";
import { createSupabaseServerClient } from "@/utils/supabase/server";

const BOOKING_REVALIDATE_PATHS = [
  "/dashboard/trips",
  "/dashboard/host/bookings",
];

const toDateRange = (checkIn: string, checkOut: string) => `[${checkIn},${checkOut})`;

export async function createBooking(input: CreateBookingInput) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Sign in to reserve this stay.");
  }

  const payload = createBookingSchema.parse(input);

  const { error } = await supabase.from("bookings").insert({
    listing_id: payload.listingId,
    guest_id: user.id,
    kind: payload.kind,
    date_range: toDateRange(payload.checkIn, payload.checkOut),
    guests_count: payload.guests,
    total_price: payload.totalPrice,
    status: "pending",
    payment_status: "test",
  });

  if (error) {
    console.error("Failed to create booking", error);
    throw new Error("Unable to create booking. Dates may be unavailable.");
  }

  await recordAuditLog(supabase, {
    userId: user.id,
    action: "booking:create",
    entity: "booking",
    meta: {
      listing_id: payload.listingId,
      check_in: payload.checkIn,
      check_out: payload.checkOut,
      guests: payload.guests,
      total_price: payload.totalPrice,
    },
  });

  BOOKING_REVALIDATE_PATHS.forEach((path) => revalidatePath(path));
  revalidatePath(`/listing/${payload.listingId}`);

  return { success: true };
}

export async function cancelBooking(input: CancelBookingInput) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Sign in to cancel bookings.");
  }

  const payload = cancelBookingSchema.parse(input);

  const { error } = await supabase
    .from("bookings")
    .update({ status: "canceled" })
    .eq("id", payload.bookingId);

  if (error) {
    console.error("Failed to cancel booking", error);
    throw new Error("Unable to cancel booking. Please try again.");
  }

  await recordAuditLog(supabase, {
    userId: user.id,
    action: "booking:cancel",
    entity: "booking",
    entityId: payload.bookingId,
  });

  BOOKING_REVALIDATE_PATHS.forEach((path) => revalidatePath(path));

  return { success: true };
}
