import { NextResponse } from "next/server";
import { Role, UserStatus } from "@/generated/prisma/client";
import { requireSessionUser } from "@/lib/auth-session";
import { adminErrorResponse } from "@/modules/admin/http";
import { searchAdminUsers } from "@/modules/admin/service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await requireSessionUser();
    const sp = new URL(request.url).searchParams;
    const q = sp.get("q") ?? undefined;
    const roleRaw = sp.get("role");
    const statusRaw = sp.get("status");
    const role =
      roleRaw && Object.values(Role).includes(roleRaw as Role)
        ? (roleRaw as Role)
        : undefined;
    const status =
      statusRaw && Object.values(UserStatus).includes(statusRaw as UserStatus)
        ? (statusRaw as UserStatus)
        : undefined;
    const items = await searchAdminUsers(user, { q, role, status });
    return NextResponse.json({ items });
  } catch (err) {
    return adminErrorResponse(err, "Failed to load users");
  }
}
