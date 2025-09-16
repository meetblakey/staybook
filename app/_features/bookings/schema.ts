import { z } from "zod";

export const createBookingSchema = z
  .object({
    listingId: z.string().uuid(),
    checkIn: z.string().min(1),
    checkOut: z.string().min(1),
    guests: z.coerce.number().int().min(1).max(16),
    totalPrice: z.coerce.number().min(0),
    kind: z.enum(["booking", "block"]).default("booking"),
  })
  .refine((data) => new Date(data.checkIn) < new Date(data.checkOut), {
    message: "Check-out must be after check-in",
    path: ["checkOut"],
  });

export type CreateBookingInput = z.input<typeof createBookingSchema>;

export const cancelBookingSchema = z.object({
  bookingId: z.string().uuid(),
});

export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
