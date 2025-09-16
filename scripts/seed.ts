import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

type SeedUser = {
  email: string;
  password: string;
  fullName: string;
  role: "host" | "guest";
};

const seedUsers: SeedUser[] = [
  {
    email: "jess@staybook.dev",
    password: "Password123!",
    fullName: "Jess Host",
    role: "host",
  },
  {
    email: "mo@staybook.dev",
    password: "Password123!",
    fullName: "Mo Host",
    role: "host",
  },
  {
    email: "ari@staybook.dev",
    password: "Password123!",
    fullName: "Ari Guest",
    role: "guest",
  },
  {
    email: "lou@staybook.dev",
    password: "Password123!",
    fullName: "Lou Guest",
    role: "guest",
  },
];

async function ensureUser({ email, password, fullName, role }: SeedUser) {
  const { data: list } = await supabase.auth.admin.listUsers();
  const existing = list?.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());

  if (existing) {
    await supabase
      .from("profiles")
      .upsert({ id: existing.id, full_name: fullName, role });
    return existing.id;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (error || !data.user) {
    throw error ?? new Error(`Failed to create user for ${email}`);
  }

  await supabase
    .from("profiles")
    .upsert({ id: data.user.id, full_name: fullName, role, avatar_url: data.user.user_metadata?.avatar_url ?? null });

  return data.user.id;
}

async function run() {
  console.log("🌱 Seeding Staybook data...\n");

  const userIds: Record<string, string> = {};
  for (const user of seedUsers) {
    userIds[user.email] = await ensureUser(user);
  }

  const listings: Database["public"]["Tables"]["listings"]["Insert"][] = [
    {
      id: "6d94cf15-3477-4a4f-9ebd-9f8d60124d80",
      host_id: userIds["jess@staybook.dev"],
      title: "Alfama rooftop loft",
      description: "Watch the sunrise over Lisbon with floor-to-ceiling windows and a private terrace.",
      property_type: "Apartment",
      room_type: "Entire place",
      max_guests: 4,
      bedrooms: 2,
      beds: 2,
      bathrooms: 1.5,
      price_nightly: 180,
      cleaning_fee: 30,
      service_fee: 20,
      currency: "EUR",
      address_line1: "Rua do Salvador 15",
      city: "Lisbon",
      country: "Portugal",
      location: { type: "Point", coordinates: [-9.131, 38.711] },
      amenities: ["Wifi", "Kitchen", "Air conditioning", "Dedicated workspace", "EV charger"],
      status: "published" as const,
    },
    {
      id: "9fa2b7a3-16f9-45cb-a9a1-c4e26c3b0faa",
      host_id: userIds["mo@staybook.dev"],
      title: "Modern Kyoto machiya",
      description: "Restored townhouse blending tatami floors with soaking tub and zen courtyard.",
      property_type: "Townhouse",
      room_type: "Entire place",
      max_guests: 5,
      bedrooms: 3,
      beds: 4,
      bathrooms: 2,
      price_nightly: 210,
      cleaning_fee: 40,
      service_fee: 25,
      currency: "JPY",
      address_line1: "Sakyo Ward",
      city: "Kyoto",
      country: "Japan",
      location: { type: "Point", coordinates: [135.772, 35.015] },
      amenities: ["Wifi", "Kitchen", "Washer", "Hot tub", "Garden"],
      status: "published" as const,
    },
    {
      id: "a32b4fd0-5a51-4d20-b39a-4b6f4a5da72e",
      host_id: userIds["jess@staybook.dev"],
      title: "High-desert container home",
      description: "Sustainable desert escape with starry-night views and outdoor soaking tub.",
      property_type: "Tiny home",
      room_type: "Entire place",
      max_guests: 2,
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
      price_nightly: 145,
      cleaning_fee: 20,
      service_fee: 15,
      currency: "USD",
      address_line1: "Joshua Tree",
      city: "Joshua Tree",
      country: "United States",
      location: { type: "Point", coordinates: [-116.313, 34.134] },
      amenities: ["Wifi", "Kitchen", "Outdoor shower", "Parking"],
      status: "published" as const,
    },
  ];

  await supabase.from("listings").upsert(listings, { onConflict: "id" });

  const photoPayload: Database["public"]["Tables"]["listing_photos"]["Insert"][] = [
    { id: "f3f531d3-fe9f-4ae3-a53f-0b3df9872201", listing_id: listings[0].id!, path: "demo/lisbon/hero.jpg", sort_order: 1 },
    { id: "aa0be2b2-bf74-4b11-a3cf-8002972c4640", listing_id: listings[0].id!, path: "demo/lisbon/living.jpg", sort_order: 2 },
    { id: "32d9b0f5-0a55-4d66-a251-84295f2cf4fb", listing_id: listings[1].id!, path: "demo/kyoto/hero.jpg", sort_order: 1 },
    { id: "d04f6416-6e55-4e43-a439-c9b8e47bfba0", listing_id: listings[2].id!, path: "demo/desert/hero.jpg", sort_order: 1 },
  ];
  await supabase.from("listing_photos").upsert(photoPayload, { onConflict: "id" });

  const bookingsPayload: Database["public"]["Tables"]["bookings"]["Insert"][] = [
    {
      id: "d88152af-d905-4c7e-8df9-1b4032adff64",
      listing_id: listings[0].id!,
      guest_id: userIds["ari@staybook.dev"],
      kind: "booking",
      date_range: "[2024-11-03,2024-11-08)",
      guests_count: 2,
      total_price: 920,
      status: "confirmed",
      payment_status: "paid",
    },
    {
      id: "78f7a1f8-c64d-46a4-b7fd-93932be40f56",
      listing_id: listings[1].id!,
      guest_id: userIds["lou@staybook.dev"],
      kind: "booking",
      date_range: "[2024-12-20,2024-12-27)",
      guests_count: 3,
      total_price: 1680,
      status: "pending",
      payment_status: "test",
    },
  ];
  await supabase.from("bookings").upsert(bookingsPayload, { onConflict: "id" });

  const reviewsPayload: Database["public"]["Tables"]["reviews"]["Insert"][] = [
    {
      id: "2228fab5-1dc1-4fc2-9f80-8745096930e2",
      booking_id: "d88152af-d905-4c7e-8df9-1b4032adff64",
      listing_id: listings[0].id!,
      author_id: userIds["ari@staybook.dev"],
      target_user_id: listings[0].host_id!,
      overall: 5,
      cleanliness: 5,
      accuracy: 5,
      comment: "Incredible views and thoughtful touches throughout the loft.",
    },
  ];
  await supabase.from("reviews").upsert(reviewsPayload, { onConflict: "id" });

  console.log("✅ Seed completed. Sample users:");
  for (const user of seedUsers) {
    console.log(` • ${user.email} / ${user.password} (${user.role})`);
  }
  console.log("\nRemember: remove the service role key from your shell when finished.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
