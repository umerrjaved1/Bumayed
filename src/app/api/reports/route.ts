import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { adminErrorResponse } from "@/modules/admin/http";
import { reportCreateSchema } from "@/modules/admin/schemas";
import { createPublicReport } from "@/modules/admin/service";

export const dynamic = "force-dynamic";

/** POST /api/reports — public report create (guest contact required when anonymous). */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = reportCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION",
            message: parsed.error.issues[0]?.message ?? "Invalid report",
          },
        },
        { status: 400 },
      );
    }
    const session = await auth();
    const reporterId = session?.user?.id ?? null;
    if (!reporterId && !parsed.data.guestContact?.trim()) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION",
            message: "Contact required for guest reports",
          },
        },
        { status: 400 },
      );
    }
    const report = await createPublicReport(parsed.data, reporterId);
    return NextResponse.json({ report }, { status: 201 });
  } catch (err) {
    return adminErrorResponse(err, "Failed to create report");
  }
}
