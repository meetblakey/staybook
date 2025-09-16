import { NextResponse } from "next/server";

import { uploadPhoto } from "@/app/_features/listings/actions";

export async function POST(request: Request) {
  const formData = await request.formData();
  const listingId = formData.get("listingId");
  const file = formData.get("file");

  if (typeof listingId !== "string" || !(file instanceof File)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    const { path } = await uploadPhoto({ listingId, file });
    return NextResponse.json({ path });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
