import { NextResponse } from "next/server";
import { parseListingQuery } from "@/modules/listings/query";
import { searchPublicListings } from "@/modules/listings/service";
import type { VehicleCategoryCode } from "@/modules/listings/types";

export const dynamic = "force-dynamic";

const CATEGORIES: VehicleCategoryCode[] = [
  "cars",
  "motorcycles",
  "boats",
  "plates",
];

/**
 * GET /api/listings?category=cars&keyword=&…&page=1
 * Public, server-side filtered/sorted/paginated listing search.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());
    const category = (params.category ?? "cars") as VehicleCategoryCode;
    if (!CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: { code: "INVALID_CATEGORY", message: "Invalid category" } },
        { status: 400 },
      );
    }

    const query = parseListingQuery(params, category);
    const result = await searchPublicListings(query);
    return NextResponse.json(result);
  } catch (err) {
    console.error("GET /api/listings", err);
    return NextResponse.json(
      { error: { code: "INTERNAL", message: "Search failed" } },
      { status: 500 },
    );
  }
}
