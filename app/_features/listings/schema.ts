import { z } from "zod";

const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

const baseListingSchema = z.object({
  title: z.string().min(4).max(120),
  description: z.string().min(20),
  propertyType: z.string().min(1),
  roomType: z.string().min(1),
  maxGuests: z.coerce.number().int().min(1).max(16),
  bedrooms: z.coerce.number().int().min(0).max(10).default(1),
  beds: z.coerce.number().int().min(1).max(20).default(1),
  bathrooms: z.coerce.number().min(0).max(10).default(1),
  priceNightly: z.coerce.number().min(0),
  cleaningFee: z.coerce.number().min(0).default(0),
  serviceFee: z.coerce.number().min(0).default(0),
  currency: z.string().length(3).default("USD"),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().optional(),
  country: z.string().min(2),
  postalCode: z.string().optional(),
  amenities: z.array(z.string()).default([]),
  coordinates: coordinatesSchema,
  status: z.enum(["draft", "published", "snoozed", "paused", "deleted"]).default("draft"),
  cancellationPolicyId: z.string().trim().default("flex"),
});

export const createListingSchema = baseListingSchema;

export const updateListingSchema = baseListingSchema.partial().extend({
  id: z.string().uuid(),
});

export type CreateListingInput = z.input<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
