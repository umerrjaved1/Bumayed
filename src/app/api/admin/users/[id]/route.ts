import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth-session";
import { adminErrorResponse, clientIp } from "@/modules/admin/http";
import { adminRoleSchema, userStatusSchema } from "@/modules/admin/schemas";
import { setAdminRole, setUserStatus } from "@/modules/admin/service";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireSessionUser();
    const { id } = await context.params;
    const body = await request.json();

    if ("status" in body) {
      const parsed = userStatusSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          {
            error: {
              code: "VALIDATION",
              message: parsed.error.issues[0]?.message ?? "Invalid status",
            },
          },
          { status: 400 },
        );
      }
      const updated = await setUserStatus(
        user,
        id,
        parsed.data,
        clientIp(request),
      );
      return NextResponse.json({ user: updated });
    }

    if ("role" in body) {
      const parsed = adminRoleSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          {
            error: {
              code: "VALIDATION",
              message: parsed.error.issues[0]?.message ?? "Invalid role",
            },
          },
          { status: 400 },
        );
      }
      const updated = await setAdminRole(
        user,
        id,
        parsed.data.role,
        clientIp(request),
      );
      return NextResponse.json({ user: updated });
    }

    return NextResponse.json(
      { error: { code: "VALIDATION", message: "Provide status or role" } },
      { status: 400 },
    );
  } catch (err) {
    return adminErrorResponse(err, "Failed to update user");
  }
}
