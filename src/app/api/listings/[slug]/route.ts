import { NextResponse } from "next/server";
import { getPublicListingBySlug } from "@/modules/listings/service";

export const dynamic = "force-dynamic";

/** GET /api/listings/[slug] — public active listing detail. */
export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const listing = await getPublicListingBySlug(slug);
    if (!listing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Listing not found" } },
        { status: 404 },
      );
    }
    return NextResponse.json({ listing });
  } catch (err) {
    console.error("GET /api/listings/[slug]", err);
    return NextResponse.json(
      { error: { code: "INTERNAL", message: "Failed to load listing" } },
      { status: 500 },
    );
  }
}
