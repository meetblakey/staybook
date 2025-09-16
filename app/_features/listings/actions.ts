"use server";

import { revalidatePath } from "next/cache";

import { createListingSchema, type CreateListingInput, type UpdateListingInput, updateListingSchema } from "@/app/_features/listings/schema";
import { recordAuditLog } from "@/utils/audit/log";
import { createSupabaseServerClient } from "@/utils/supabase/server";

const LISTING_REVALIDATE_PATHS = [
  "/",
  "/search",
  "/dashboard/host",
  "/dashboard/host/listings",
];

const toGeoJSONPoint = (coordinates: CreateListingInput["coordinates"]) => ({
  type: "Point",
  coordinates: [coordinates.lng, coordinates.lat],
});

export async function createListing(input: CreateListingInput) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You need to be signed in to create listings.");
  }

  const payload = createListingSchema.parse(input);

  const { data, error } = await supabase
    .from("listings")
    .insert({
      host_id: user.id,
      title: payload.title,
      description: payload.description,
      property_type: payload.propertyType,
      room_type: payload.roomType,
      max_guests: payload.maxGuests,
      bedrooms: payload.bedrooms,
      beds: payload.beds,
      bathrooms: payload.bathrooms,
      price_nightly: payload.priceNightly,
      cleaning_fee: payload.cleaningFee,
      service_fee: payload.serviceFee,
      currency: payload.currency,
      address_line1: payload.addressLine1,
      address_line2: payload.addressLine2,
      city: payload.city,
      state: payload.state,
      country: payload.country,
      postal_code: payload.postalCode,
      amenities: payload.amenities,
      status: payload.status,
      cancellation_policy_id: payload.cancellationPolicyId,
      location: toGeoJSONPoint(payload.coordinates),
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to create listing", error);
    throw new Error("Unable to create listing. Please try again.");
  }

  await recordAuditLog(supabase, {
    userId: user.id,
    action: "listing:create",
    entity: "listing",
    entityId: data.id,
    meta: {
      status: payload.status,
      cancellation_policy_id: payload.cancellationPolicyId,
    },
  });

  LISTING_REVALIDATE_PATHS.forEach((path) => revalidatePath(path));

  return { listingId: data.id };
}

export async function updateListing(input: UpdateListingInput) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You need to be signed in to update listings.");
  }

  const payload = updateListingSchema.parse(input);
  const { id, coordinates, ...rest } = payload;

  const updatePayload: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(rest)) {
    if (value !== undefined) {
      switch (key) {
        case "propertyType":
          updatePayload.property_type = value;
          break;
        case "roomType":
          updatePayload.room_type = value;
          break;
        case "maxGuests":
          updatePayload.max_guests = value;
          break;
        case "priceNightly":
          updatePayload.price_nightly = value;
          break;
        case "cleaningFee":
          updatePayload.cleaning_fee = value;
          break;
        case "serviceFee":
          updatePayload.service_fee = value;
          break;
        case "cancellationPolicyId":
          updatePayload.cancellation_policy_id = value;
          break;
        case "addressLine1":
          updatePayload.address_line1 = value;
          break;
        case "addressLine2":
          updatePayload.address_line2 = value;
          break;
        case "postalCode":
          updatePayload.postal_code = value;
          break;
        default:
          updatePayload[key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)] = value;
          break;
      }
    }
  }

  if (coordinates) {
    updatePayload.location = toGeoJSONPoint(coordinates);
  }

  const { error } = await supabase
    .from("listings")
    .update(updatePayload)
    .eq("id", id)
    .eq("host_id", user.id);

  if (error) {
    console.error("Failed to update listing", error);
    throw new Error("Unable to update listing. Please try again.");
  }

  await recordAuditLog(supabase, {
    userId: user.id,
    action: "listing:update",
    entity: "listing",
    entityId: id,
    meta: updatePayload,
  });

  LISTING_REVALIDATE_PATHS.forEach((path) => revalidatePath(path));
  revalidatePath(`/listing/${id}`);

  return { listingId: id };
}

export async function uploadPhoto({
  listingId,
  file,
  sortOrder = 0,
}: {
  listingId: string;
  file: File;
  sortOrder?: number;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You need to be signed in to upload photos.");
  }

  const extension = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
  const relativePath = `${user.id}/${listingId}/${fileName}`;

  const uploadResult = await supabase.storage
    .from("listing-photos")
    .upload(relativePath, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });

  if (uploadResult.error) {
    console.error("Photo upload failed", uploadResult.error);
    throw new Error("Failed to upload photo.");
  }

  const { error } = await supabase.from("listing_photos").insert({
    listing_id: listingId,
    path: relativePath,
    sort_order: sortOrder,
  });

  if (error) {
    console.error("Failed to record photo", error);
    throw new Error("Could not save photo metadata.");
  }

  await recordAuditLog(supabase, {
    userId: user.id,
    action: "listing:photo_upload",
    entity: "listing",
    entityId: listingId,
    meta: { path: relativePath, sort_order: sortOrder },
  });

  revalidatePath(`/listing/${listingId}`);
  revalidatePath(`/dashboard/host/listings/${listingId}`);

  return { path: relativePath };
}
