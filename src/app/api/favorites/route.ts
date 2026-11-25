import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth-session";
import { toPublicDto } from "@/modules/listings/mappers";
import * as repo from "@/modules/listings/repository";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireSessionUser();
    const rows = await repo.listFavorites(user.id);
    return NextResponse.json({
      items: rows.map((r) => toPublicDto(r.listing)),
    });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Sign in required" } },
        { status: 401 },
      );
    }
    return NextResponse.json(
      { error: { code: "INTERNAL", message: "Failed" } },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser();
    const body = await request.json();
    const listingId = String(body.listingId ?? "");
    if (!listingId) {
      return NextResponse.json(
        { error: { code: "VALIDATION", message: "listingId required" } },
        { status: 400 },
      );
    }
    const listing =
      (await repo.findListingById(listingId)) ??
      (await repo.findActiveBySlug(listingId));
    if (!listing || listing.status !== "ACTIVE") {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Listing not found" } },
        { status: 404 },
      );
    }
    await repo.addFavorite(user.id, listing.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Sign in required" } },
        { status: 401 },
      );
    }
    return NextResponse.json(
      { error: { code: "INTERNAL", message: "Failed" } },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireSessionUser();
    const listingId = new URL(request.url).searchParams.get("listingId");
    if (!listingId) {
      return NextResponse.json(
        { error: { code: "VALIDATION", message: "listingId required" } },
        { status: 400 },
      );
    }
    const listing =
      (await repo.findListingById(listingId)) ?? (await repo.findBySlug(listingId));
    if (listing) await repo.removeFavorite(user.id, listing.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Sign in required" } },
        { status: 401 },
      );
    }
    return NextResponse.json(
      { error: { code: "INTERNAL", message: "Failed" } },
      { status: 500 },
    );
  }
}
