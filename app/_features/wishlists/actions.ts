"use server";

import { revalidatePath } from "next/cache";

import { createWishlistSchema, type CreateWishlistInput } from "@/app/_features/wishlists/schema";
import { recordAuditLog } from "@/utils/audit/log";
import { createSupabaseServerClient } from "@/utils/supabase/server";

export async function createWishlist(input: CreateWishlistInput) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Sign in to save wishlists.");
  }

  const payload = createWishlistSchema.parse(input);

  const { data, error } = await supabase
    .from("wishlists")
    .insert({
      title: payload.title,
      user_id: user.id,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to create wishlist", error);
    throw new Error("Could not create wishlist.");
  }

  if (payload.listingId) {
    await supabase
      .from("wishlist_items")
      .upsert({
        wishlist_id: data.id,
        listing_id: payload.listingId,
      });
  }

  await recordAuditLog(supabase, {
    userId: user.id,
    action: "wishlist:create",
    entity: "wishlist",
    entityId: data.id,
    meta: { title: payload.title, listing_id: payload.listingId },
  });

  revalidatePath("/dashboard/wishlists");

  return { wishlistId: data.id };
}
