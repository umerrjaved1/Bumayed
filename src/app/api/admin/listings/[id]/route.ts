import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth-session";
import { adminErrorResponse, clientIp } from "@/modules/admin/http";
import { listingModerateSchema } from "@/modules/admin/schemas";
import { moderateListing } from "@/modules/admin/service";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireSessionUser();
    const { id } = await context.params;
    const body = await request.json();
    const parsed = listingModerateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION",
            message: parsed.error.issues[0]?.message ?? "Invalid action",
          },
        },
        { status: 400 },
      );
    }
    const result = await moderateListing(
      user,
      id,
      parsed.data,
      clientIp(request),
    );
    return NextResponse.json(result);
  } catch (err) {
    return adminErrorResponse(err, "Failed to moderate listing");
  }
}
