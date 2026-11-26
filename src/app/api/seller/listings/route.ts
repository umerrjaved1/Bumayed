import { NextResponse } from "next/server";
import { adminErrorResponse } from "@/modules/admin/http";
import { ListingStatus } from "@/generated/prisma/client";
import { requireSessionUser } from "@/lib/auth-session";
import { listingWriteSchema } from "@/modules/listings/write-schemas";
import {
  createSellerListing,
  listMyListings,
} from "@/modules/listings/seller-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await requireSessionUser();
    const status = new URL(request.url).searchParams.get("status");
    const parsed =
      status && Object.values(ListingStatus).includes(status as ListingStatus)
        ? (status as ListingStatus)
        : undefined;
    const items = await listMyListings(user, parsed);
    return NextResponse.json({ items });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Sign in required" } },
        { status: 401 },
      );
    }
    console.error("GET /api/seller/listings", err);
    return NextResponse.json(
      { error: { code: "INTERNAL", message: "Failed to load listings" } },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser();
    const body = await request.json();
    const parsed = listingWriteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION",
            message: parsed.error.issues[0]?.message ?? "Invalid listing",
          },
        },
        { status: 400 },
      );
    }
    const listing = await createSellerListing({ user, data: parsed.data });
    return NextResponse.json({ listing }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Sign in required" } },
        { status: 401 },
      );
    }
    if (err instanceof Error && err.message === "INVALID_VIDEO_URL") {
      return NextResponse.json(
        { error: { code: "INVALID_VIDEO_URL", message: "Unsupported video URL" } },
        { status: 400 },
      );
    }
    if (err instanceof Error && err.message === "PROHIBITED_CONTENT") {
      return NextResponse.json(
        {
          error: {
            code: "PROHIBITED_CONTENT",
            message: "Listing text matches the prohibited-content policy",
          },
        },
        { status: 400 },
      );
    }
    // Maps quota, invalid category/emirate, bad JSON and Prisma input errors to 4xx.
    return adminErrorResponse(err, "Failed to create listing");
  }
}
