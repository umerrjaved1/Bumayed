import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth-session";
import { adminErrorResponse, clientIp } from "@/modules/admin/http";
import { packageUpsertSchema } from "@/modules/admin/schemas";
import { getCommercial, savePackage } from "@/modules/admin/service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireSessionUser();
    const data = await getCommercial(user);
    return NextResponse.json(data);
  } catch (err) {
    return adminErrorResponse(err, "Failed to load commercial data");
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser();
    const body = await request.json();
    const id = typeof body.id === "string" ? body.id : null;
    const parsed = packageUpsertSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION",
            message: parsed.error.issues[0]?.message ?? "Invalid package",
          },
        },
        { status: 400 },
      );
    }
    const d = parsed.data;
    const pkg = await savePackage(
      user,
      id,
      {
        name: d.name,
        nameAr: d.nameAr ?? null,
        priceAed: d.priceAed,
        validityDays: d.validityDays,
        monthlyListingQuota: d.monthlyListingQuota ?? null,
        featuredSlots: d.featuredSlots,
        isActive: d.isActive ?? true,
        sortOrder: d.sortOrder ?? 0,
      },
      clientIp(request),
    );
    return NextResponse.json({ package: pkg }, { status: id ? 200 : 201 });
  } catch (err) {
    return adminErrorResponse(err, "Failed to save package");
  }
}
