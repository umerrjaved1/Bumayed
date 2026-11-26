import { NextResponse } from "next/server";
import { adminErrorResponse } from "@/modules/admin/http";
import { requireSessionUser } from "@/lib/auth-session";
import {
  listingActionSchema,
  listingWriteSchema,
} from "@/modules/listings/write-schemas";
import {
  getMyListing,
  runSellerAction,
  updateSellerListing,
} from "@/modules/listings/seller-service";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const user = await requireSessionUser();
    const { id } = await ctx.params;
    const { dto } = await getMyListing(user, id);
    return NextResponse.json({ listing: dto });
  } catch (err) {
    return mapErr(err, "GET listing");
  }
}

export async function PATCH(request: Request, ctx: Ctx) {
  try {
    const user = await requireSessionUser();
    const { id } = await ctx.params;
    const body = await request.json();

    if (body?.action) {
      const action = listingActionSchema.safeParse(body);
      if (!action.success) {
        return NextResponse.json(
          { error: { code: "VALIDATION", message: "Invalid action" } },
          { status: 400 },
        );
      }
      const listing = await runSellerAction({
        user,
        listingId: id,
        action: action.data.action,
      });
      return NextResponse.json({ listing });
    }

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
    const listing = await updateSellerListing({
      user,
      listingId: id,
      data: parsed.data,
    });
    return NextResponse.json({ listing });
  } catch (err) {
    return mapErr(err, "PATCH listing");
  }
}

function mapErr(err: unknown, label: string) {
  if (err instanceof Error) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Sign in required" } },
        { status: 401 },
      );
    }
    if (err.message === "NOT_FOUND") {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Listing not found" } },
        { status: 404 },
      );
    }
    if (err.message === "FORBIDDEN") {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Not allowed" } },
        { status: 403 },
      );
    }
    if (err.message.startsWith("Invalid listing transition")) {
      return NextResponse.json(
        { error: { code: "INVALID_TRANSITION", message: err.message } },
        { status: 400 },
      );
    }
  }
  // Maps NOT_EDITABLE, invalid fields, bad JSON and Prisma input errors to 4xx.
  return adminErrorResponse(err, `${label} failed`);
}
