import { NextResponse } from "next/server";

import { searchListings } from "@/app/_features/listings/queries";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const listings = await searchListings(url.searchParams);

  return NextResponse.json({
    count: listings.length,
    listings,
  });
}
