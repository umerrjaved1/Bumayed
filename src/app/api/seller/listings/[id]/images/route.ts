import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { requireSessionUser } from "@/lib/auth-session";
import { deleteListingImage, saveListingImage } from "@/lib/storage/local";
import * as repo from "@/modules/listings/repository";
import { resolveOwnedListing } from "@/modules/listings/seller-service";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, ctx: Ctx) {
  try {
    const user = await requireSessionUser();
    const { id } = await ctx.params;
    const listing = await resolveOwnedListing(user, id);

    const count = await repo.countListingImages(listing.id);
    if (count >= env.MAX_IMAGES_PER_LISTING) {
      return NextResponse.json(
        { error: { code: "IMAGE_LIMIT", message: "Image limit reached" } },
        { status: 400 },
      );
    }

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: { code: "VALIDATION", message: "file required" } },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const saved = await saveListingImage({
      listingId: listing.id,
      file: buffer,
      claimedMime: file.type,
    });

    const image = await repo.addListingImage({
      listingId: listing.id,
      objectKey: saved.objectKey,
      mime: saved.mime,
      sizeBytes: saved.sizeBytes,
      sortOrder: count,
      isPrimary: count === 0,
    });

    return NextResponse.json(
      {
        image: {
          id: image.id,
          url: `/uploads/${saved.objectKey}`,
          sortOrder: image.sortOrder,
          isPrimary: image.isPrimary,
        },
      },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "UNAUTHORIZED") {
        return NextResponse.json(
          { error: { code: "UNAUTHORIZED", message: "Sign in required" } },
          { status: 401 },
        );
      }
      if (err.message === "FILE_TOO_LARGE" || err.message === "UNSUPPORTED_TYPE") {
        return NextResponse.json(
          { error: { code: err.message, message: err.message } },
          { status: 400 },
        );
      }
    }
    console.error("POST images", err);
    return NextResponse.json(
      { error: { code: "INTERNAL", message: "Upload failed" } },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, ctx: Ctx) {
  try {
    const user = await requireSessionUser();
    const { id } = await ctx.params;
    const listing = await resolveOwnedListing(user, id);
    const imageId = new URL(request.url).searchParams.get("imageId");
    if (!imageId) {
      return NextResponse.json(
        { error: { code: "VALIDATION", message: "imageId required" } },
        { status: 400 },
      );
    }
    const images = await repo.listListingImages(listing.id);
    const target = images.find((i) => i.id === imageId);
    if (!target) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Image not found" } },
        { status: 404 },
      );
    }
    await repo.deleteListingImageRow(target.id);
    await deleteListingImage(target.objectKey);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Sign in required" } },
        { status: 401 },
      );
    }
    console.error("DELETE image", err);
    return NextResponse.json(
      { error: { code: "INTERNAL", message: "Delete failed" } },
      { status: 500 },
    );
  }
}
