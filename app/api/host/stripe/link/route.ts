import { NextResponse } from "next/server";

import { getStripeClient, STRIPE_CONNECT_CLIENT_ID } from "@/app/_features/payments/stripe";
import { createSupabaseServerClient } from "@/utils/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const stripe = getStripeClient();
  if (!stripe || !STRIPE_CONNECT_CLIENT_ID) {
    return NextResponse.json({ error: "Stripe Connect is not enabled" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const payoutAccountRes = await supabase
    .from("payout_accounts")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (payoutAccountRes.error) {
    return NextResponse.json({ error: payoutAccountRes.error.message }, { status: 400 });
  }

  let accountId = payoutAccountRes.data?.stripe_account_id ?? null;

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      email: user.email ?? undefined,
    });
    accountId = account.id;

    const upsert = await supabase
      .from("payout_accounts")
      .upsert({
        user_id: user.id,
        stripe_account_id: accountId,
        status: "pending",
      });

    if (upsert.error) {
      return NextResponse.json({ error: upsert.error.message }, { status: 400 });
    }
  }

  const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${origin}/dashboard/settings/payments`,
    return_url: `${origin}/dashboard/settings/payments?status=success`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: link.url });
}
