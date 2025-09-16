import { z } from "zod";

export const searchParamsSchema = z.object({
  destination: z.string().trim().min(1).optional(),
  checkIn: z.string().trim().min(1).optional(),
  checkOut: z.string().trim().min(1).optional(),
  guests: z.coerce.number().min(1).max(16).default(1),
  priceMin: z.coerce.number().optional(),
  priceMax: z.coerce.number().optional(),
  propertyType: z.string().optional(),
  roomType: z.string().optional(),
  amenities: z.string().optional(),
  sort: z.enum(["relevance", "price_asc", "price_desc", "rating_desc"]).default("relevance"),
  bounds: z.string().optional(),
});

export type SearchParamsInput = z.input<typeof searchParamsSchema>;
export type SearchParams = z.output<typeof searchParamsSchema> & {
  amenitiesList: string[];
};

export function parseSearchParams(values: URLSearchParams | SearchParamsInput): SearchParams {
  const raw = values instanceof URLSearchParams ? Object.fromEntries(values.entries()) : values;
  const parsed = searchParamsSchema.safeParse(raw);

  const data = parsed.success ? parsed.data : searchParamsSchema.parse({});
  const amenitiesList = data.amenities ? data.amenities.split(",").filter(Boolean) : [];

  return { ...data, amenitiesList };
}
