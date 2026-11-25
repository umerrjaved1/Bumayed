import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth-session";
import { adminErrorResponse, clientIp } from "@/modules/admin/http";
import { reportResolveSchema } from "@/modules/admin/schemas";
import { resolveReport } from "@/modules/admin/service";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireSessionUser();
    const { id } = await context.params;
    const body = await request.json();
    const parsed = reportResolveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION",
            message: parsed.error.issues[0]?.message ?? "Invalid payload",
          },
        },
        { status: 400 },
      );
    }
    const report = await resolveReport(
      user,
      id,
      parsed.data,
      clientIp(request),
    );
    return NextResponse.json({ report });
  } catch (err) {
    return adminErrorResponse(err, "Failed to resolve report");
  }
}
