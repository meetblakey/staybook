import { NextResponse } from "next/server";

import { createPaymentIntentForBooking } from "@/app/_features/payments/service";
import { createSupabaseServerClient } from "@/utils/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const payload = await request.json();

    const intent = await createPaymentIntentForBooking(payload, user.id);

    return NextResponse.json(intent);
  } catch (error) {
    console.error("create-intent error", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
