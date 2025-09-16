import { z } from "zod";

export const createWishlistSchema = z.object({
  title: z.string().min(1).max(60),
  listingId: z.string().uuid().optional(),
});

export type CreateWishlistInput = z.infer<typeof createWishlistSchema>;
