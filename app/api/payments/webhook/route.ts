import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { updatePaymentIntentStatus } from "@/app/_features/payments/service";
import { STRIPE_WEBHOOK_SECRET, getStripeClient } from "@/app/_features/payments/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const stripe = getStripeClient();
  if (!stripe || !STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ received: true, ignored: true });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error("Stripe webhook signature verification failed", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const intent = event.data.object as Stripe.PaymentIntent;
        await updatePaymentIntentStatus(intent.id, "succeeded", {
          client_secret: intent.client_secret ?? undefined,
          amount_total: intent.amount_received ?? intent.amount ?? undefined,
          currency: intent.currency?.toUpperCase(),
        });
        break;
      }
      case "payment_intent.payment_failed": {
        const intent = event.data.object as Stripe.PaymentIntent;
        await updatePaymentIntentStatus(intent.id, "payment_failed", {
          client_secret: intent.client_secret ?? undefined,
          amount_total: intent.amount ?? undefined,
          currency: intent.currency?.toUpperCase(),
        });
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        if (charge.payment_intent) {
          await updatePaymentIntentStatus(String(charge.payment_intent), "refunded", {
            amount_total: charge.amount_refunded,
            currency: charge.currency?.toUpperCase(),
          });
        }
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error("Stripe webhook handler error", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
