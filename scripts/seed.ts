import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";

import type { Database } from "@/types/database";

config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseDbUrl = process.env.SUPABASE_DB_URL;

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

const MIGRATION_FILES = [
  "supabase/schema.sql",
  "supabase/policies.sql",
  "supabase/storage_buckets.sql",
  "supabase/extra_schema.sql",
  "supabase/extra_policies.sql",
  "supabase/extra_storage_policies.sql",
];

async function applyMigrations() {
  if (!supabaseDbUrl) {
    console.warn("⚠️  SUPABASE_DB_URL not set; skipping automatic schema migrations.\n" +
      "Ensure you've applied supabase/*.sql manually before seeding.");
    return;
  }

  console.log("📦 Applying database migrations via SUPABASE_DB_URL...");
  const pool = new Pool({ connectionString: supabaseDbUrl });
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  try {
    for (const relative of MIGRATION_FILES) {
      const migrationPath = path.resolve(__dirname, "..", relative);
      try {
        const sql = await readFile(migrationPath, "utf8");
        if (sql.trim().length === 0) continue;
        console.log(`  → running ${relative}`);
        await pool.query(sql);
      } catch (error) {
        console.error(`  ✖ failed to apply ${relative}`, error);
        throw error;
      }
    }
    console.log("✅ Migrations applied.\n");
  } finally {
    await pool.end();
  }
}

async function run() {
  console.log("🌱 Seeding Staybook data...\n");

  await applyMigrations();

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
    cancellation_policy_id: "flex",
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
    cancellation_policy_id: "moderate",
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
    cancellation_policy_id: "strict",
  },
];

await supabase.from("listings").upsert(listings, { onConflict: "id" });

await supabase.from("cancellation_policies").upsert(
  [
    {
      id: "moderate",
      name: "Moderate",
      rules: {
        free_until_hours: 48,
        refund_table: [
          { before_hours: 168, guest_pct: 100 },
          { before_hours: 24, guest_pct: 50 },
          { before_hours: 0, guest_pct: 0 },
        ],
      },
    },
    {
      id: "strict",
      name: "Strict",
      rules: {
        free_until_hours: 168,
        refund_table: [
          { before_hours: 336, guest_pct: 100 },
          { before_hours: 168, guest_pct: 50 },
          { before_hours: 0, guest_pct: 0 },
        ],
      },
    },
  ],
  { onConflict: "id" },
);

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

  const priceRules: Database["public"]["Tables"]["listing_price_rules"]["Insert"][] = [
    {
      listing_id: listings[0].id!,
      kind: "weekend_markup",
      amount: 25,
      is_percent: true,
    },
    {
      listing_id: listings[0].id!,
      kind: "early_bird",
      threshold_days: 60,
      amount: -10,
      is_percent: true,
    },
    {
      listing_id: listings[1].id!,
      kind: "last_minute",
      threshold_days: 5,
      amount: -15,
      is_percent: true,
    },
    {
      listing_id: listings[2].id!,
      kind: "extra_guest",
      extra_guest_threshold: 2,
      amount: 35,
    },
  ];
  await supabase.from("listing_price_rules").upsert(priceRules, { onConflict: "id" });

  const overrides: Database["public"]["Tables"]["calendar_overrides"]["Insert"][] = [
    {
      listing_id: listings[0].id!,
      date: "2024-12-31",
      price: 260,
    },
    {
      listing_id: listings[1].id!,
      date: "2024-10-01",
      price: 240,
    },
  ];
  await supabase.from("calendar_overrides").upsert(overrides, { onConflict: "id" });

  const feeRules: Database["public"]["Tables"]["fee_rules"]["Insert"][] = [
    {
      listing_id: listings[0].id!,
      service_fee_bps: 1200,
      cleaning_fee: 45,
      extra_guest_fee: 30,
      pet_fee: 60,
    },
    {
      listing_id: listings[2].id!,
      service_fee_bps: 1000,
      cleaning_fee: 35,
      security_deposit: 250,
    },
  ];
  await supabase.from("fee_rules").upsert(feeRules, { onConflict: "id" });

  const taxRules: Database["public"]["Tables"]["tax_rules"]["Insert"][] = [
    {
      country: "Portugal",
      city: "Lisbon",
      occupancy_tax_pct: 6,
    },
    {
      country: "Japan",
      state: "Kyoto",
      occupancy_tax_pct: 3,
    },
    {
      country: "United States",
      state: "California",
      city: "Joshua Tree",
      occupancy_tax_pct: 12,
    },
  ];
  await supabase.from("tax_rules").upsert(taxRules, { onConflict: "id" });

  const today = new Date().toISOString().slice(0, 10);
  const exchangeRates: Database["public"]["Tables"]["exchange_rates"]["Insert"][] = [
    {
      base: "USD",
      quote: "EUR",
      rate: 0.92,
      as_of: today,
    },
    {
      base: "USD",
      quote: "JPY",
      rate: 156.3,
      as_of: today,
    },
    {
      base: "EUR",
      quote: "USD",
      rate: 1.09,
      as_of: today,
    },
  ];
  await supabase.from("exchange_rates").upsert(exchangeRates, { onConflict: "base,quote,as_of" });

  const externalCalendars: Database["public"]["Tables"]["external_calendars"]["Insert"][] = [
    {
      listing_id: listings[0].id!,
      url: "https://example.com/alfama.ics",
    },
  ];
  await supabase.from("external_calendars").upsert(externalCalendars, { onConflict: "id" });

  const savedSearches: Database["public"]["Tables"]["saved_searches"]["Insert"][] = [
    {
      user_id: userIds["ari@staybook.dev"],
      title: "Beach getaways",
      filters: { destination: "Portugal", guests: 2, priceMax: 300 },
      notify: true,
    },
  ];
  await supabase.from("saved_searches").upsert(savedSearches, { onConflict: "id" });

  const wishlistId = "d2a47b2a-63b0-4d11-8a83-866c2b582b0f";
  await supabase.from("wishlists").upsert(
    [
      {
        id: wishlistId,
        title: "Dream stays",
        user_id: userIds["ari@staybook.dev"],
      },
    ],
    { onConflict: "id" },
  );

  await supabase.from("wishlist_items").upsert(
    [
      {
        wishlist_id: wishlistId,
        listing_id: listings[2].id!,
      },
    ],
    { onConflict: "wishlist_items_pkey" },
  );

  await supabase.from("wishlist_collaborators").upsert(
    [
      {
        wishlist_id: wishlistId,
        user_id: userIds["lou@staybook.dev"],
        role: "editor",
      },
    ],
    { onConflict: "wishlist_collaborators_pkey" },
  );

  const threadId = "8c37dc33-4f61-4ea0-9e4e-d0f6a54d81c0";
  await supabase.from("threads").upsert(
    [
      {
        id: threadId,
        listing_id: listings[0].id!,
        host_id: userIds["jess@staybook.dev"],
        guest_id: userIds["ari@staybook.dev"],
        status: "open",
        last_message_at: new Date().toISOString(),
      },
    ],
    { onConflict: "id" },
  );

  await supabase.from("messages").upsert(
    [
      {
        id: "67fe1fc3-8ef7-4311-9162-4b942677835e",
        thread_id: threadId,
        sender_id: userIds["ari@staybook.dev"],
        content: "Hi Jess, is the rooftop available for New Year's Eve?",
      },
      {
        id: "f0ea1f1d-4bfb-4c0d-bd2d-109ced4f8ef0",
        thread_id: threadId,
        sender_id: userIds["jess@staybook.dev"],
        content: "Absolutely! I'll add a welcome bottle of vinho verde for your stay.",
      },
    ],
    { onConflict: "id" },
  );

  await supabase.from("verification_requests").upsert(
    [
      {
        id: "4cd91f5b-2073-40a7-b0cf-4072b839962b",
        user_id: userIds["jess@staybook.dev"],
        doc_front_path: "verifications/host-jess/front.png",
        doc_back_path: "verifications/host-jess/back.png",
        status: "approved",
        reviewed_by: userIds["mo@staybook.dev"],
        reviewed_at: new Date().toISOString(),
      },
    ],
    { onConflict: "id" },
  );

  await supabase.from("reports").upsert(
    [
      {
        id: "e59cbb38-5e59-463f-af9c-8960d1f83808",
        reporter_id: userIds["lou@staybook.dev"],
        kind: "listing",
        target_id: listings[2].id!,
        reason: "Listing photos look outdated",
        status: "open",
      },
    ],
    { onConflict: "id" },
  );

  await supabase.from("payment_intents").upsert(
    [
      {
        booking_id: bookingsPayload[0].id,
        provider: "fake",
        provider_id: "fake_pi_demo1",
        client_secret: "fake_secret_demo1",
        status: "succeeded",
        amount_total: Math.round(Number(bookingsPayload[0].total_price) * 100),
        currency: "EUR",
      },
      {
        booking_id: bookingsPayload[1].id,
        provider: "fake",
        provider_id: "fake_pi_demo2",
        client_secret: "fake_secret_demo2",
        status: "requires_payment_method",
        amount_total: Math.round(Number(bookingsPayload[1].total_price) * 100),
        currency: "JPY",
      },
    ],
    { onConflict: "payment_intents_booking_id_key" },
  );

  await supabase.from("payout_accounts").upsert(
    [
      {
        user_id: userIds["jess@staybook.dev"],
        stripe_account_id: "acct_demo123",
        status: "linked",
      },
    ],
    { onConflict: "payout_accounts_pkey" },
  );

  await supabase.from("payouts").upsert(
    [
      {
        booking_id: bookingsPayload[0].id,
        stripe_transfer_id: "tr_demo1",
        amount: 82000,
        status: "scheduled",
        scheduled_for: today,
      },
    ],
    { onConflict: "payouts_booking_id_key" },
  );

  await supabase.from("audit_logs").insert([
    {
      user_id: userIds["jess@staybook.dev"],
      action: "listing:create",
      entity: "listing",
      entity_id: listings[0].id,
      meta: { seeded: true },
    },
    {
      user_id: userIds["ari@staybook.dev"],
      action: "booking:create",
      entity: "booking",
      entity_id: bookingsPayload[0].id,
      meta: { seeded: true },
    },
  ]);

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
