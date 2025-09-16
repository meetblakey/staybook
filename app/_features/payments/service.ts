import { differenceInCalendarDays } from "date-fns";
import { z } from "zod";

import { calculateDetailedPrice } from "@/app/_lib/pricing";
import { normalizeCurrency } from "@/app/_lib/currency";
import type { PriceQuoteBreakdown } from "@/app/_features/pricing/types";
import { getListingPricingContext } from "@/app/_features/listings/queries";
import { getStripeClient, PLATFORM_FEE_BPS } from "@/app/_features/payments/stripe";
import { createSupabaseServerClient } from "@/utils/supabase/server";

const BASIS_POINT = 10000;

const CreateIntentSchema = z.object({
  listingId: z.string().uuid(),
  checkIn: z.string().datetime(),
  checkOut: z.string().datetime(),
  guests: z.number().int().min(1).max(16),
  pets: z.number().int().min(0).optional(),
  includePetFee: z.boolean().optional(),
  targetCurrency: z.string().regex(/^[A-Za-z]{3}$/).optional(),
});

export type CreatePaymentIntentRequest = z.infer<typeof CreateIntentSchema>;

export type PaymentIntentResponse = {
  provider: "stripe" | "fake";
  providerIntentId: string;
  clientSecret: string;
  currency: string;
  amount: number;
  amountFormatted: string;
  breakdown: PriceQuoteBreakdown;
};

function createFakeClientSecret() {
  return `fake_secret_${crypto.randomUUID()}`;
}

function createFakeProviderId() {
  return `fake_pi_${crypto.randomUUID()}`;
}

export async function createPaymentIntentForBooking(
  rawInput: CreatePaymentIntentRequest,
  userId: string,
): Promise<PaymentIntentResponse> {
  const input = CreateIntentSchema.parse(rawInput);

  const checkIn = new Date(input.checkIn);
  const checkOut = new Date(input.checkOut);
  if (differenceInCalendarDays(checkOut, checkIn) <= 0) {
    throw new Error("Check-out must be after check-in");
  }

  const { listing, priceRules, calendarOverrides, feeRule, taxRules, exchangeRates } =
    await getListingPricingContext(input.listingId);

  if (listing.status !== "published") {
    throw new Error("Listing is not available for booking");
  }

  const breakdown = calculateDetailedPrice({
    listing,
    priceRules,
    calendarOverrides,
    feeRule,
    taxRules,
    exchangeRates,
    checkIn,
    checkOut,
    guests: input.guests,
    pets: input.pets,
    includePetFee: input.includePetFee,
    targetCurrency: input.targetCurrency,
  });

  const currency = normalizeCurrency(breakdown.currency);
  const amountCents = Math.max(1, Math.round(breakdown.grandTotal * 100));

  const supabase = await createSupabaseServerClient();

  const stripe = getStripeClient();

  if (stripe) {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: currency.toLowerCase(),
      metadata: {
        listing_id: input.listingId,
        check_in: checkIn.toISOString(),
        check_out: checkOut.toISOString(),
        user_id: userId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
      application_fee_amount: PLATFORM_FEE_BPS ? Math.round((amountCents * PLATFORM_FEE_BPS) / BASIS_POINT) : undefined,
    });

    const insertResult = await supabase.from("payment_intents").insert({
      provider: "stripe",
      provider_id: paymentIntent.id,
      client_secret: paymentIntent.client_secret,
      status: paymentIntent.status,
      amount_total: amountCents,
      currency,
    });

    if (insertResult.error) {
      throw new Error(insertResult.error.message);
    }

    return {
      provider: "stripe",
      providerIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret ?? "",
      currency,
      amount: amountCents,
      amountFormatted: new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
      }).format(breakdown.grandTotal),
      breakdown,
    };
  }

  const fakeProviderId = createFakeProviderId();
  const fakeClientSecret = createFakeClientSecret();

  const insertResult = await supabase.from("payment_intents").insert({
    provider: "fake",
    provider_id: fakeProviderId,
    client_secret: fakeClientSecret,
    status: "requires_payment_method",
    amount_total: amountCents,
    currency,
  });

  if (insertResult.error) {
    throw new Error(insertResult.error.message);
  }

  return {
    provider: "fake",
    providerIntentId: fakeProviderId,
    clientSecret: fakeClientSecret,
    currency,
    amount: amountCents,
    amountFormatted: new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(breakdown.grandTotal),
    breakdown,
  };
}

export async function updatePaymentIntentStatus(providerId: string, status: string, fields: Partial<{ client_secret: string; amount_total: number; currency: string }>) {
  const supabase = await createSupabaseServerClient();
  const updateResult = await supabase
    .from("payment_intents")
    .update({ status, ...fields })
    .eq("provider_id", providerId);

  if (updateResult.error) {
    throw new Error(updateResult.error.message);
  }
}

export async function refundPaymentIntent(providerIntentId: string) {
  const stripe = getStripeClient();
  const supabase = await createSupabaseServerClient();

  if (stripe) {
    await stripe.refunds.create({ payment_intent: providerIntentId });
    await updatePaymentIntentStatus(providerIntentId, "refunded", {});
    return;
  }

  await updatePaymentIntentStatus(providerIntentId, "refunded", {});
  await supabase
    .from("payment_intents")
    .update({ status: "refunded" })
    .eq("provider_id", providerIntentId);
}
