import { NextResponse } from "next/server";
import { z } from "zod";
import { NotificationType } from "@/generated/prisma/client";
import { requireSessionUser } from "@/lib/auth-session";
import { adminErrorResponse } from "@/modules/admin/http";
import {
  getPreferences,
  listInbox,
  markRead,
  savePreferences,
} from "@/modules/notifications/service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireSessionUser();
    const [items, preferences] = await Promise.all([
      listInbox(user.id),
      getPreferences(user.id),
    ]);
    return NextResponse.json({ items, preferences });
  } catch (err) {
    return adminErrorResponse(err, "Failed to load notifications");
  }
}

const prefsSchema = z.record(
  z.nativeEnum(NotificationType),
  z.object({ email: z.boolean().optional(), inApp: z.boolean().optional() }),
);

export async function PATCH(request: Request) {
  try {
    const user = await requireSessionUser();
    const body = await request.json();
    if (typeof body.id === "string") {
      await markRead(user.id, body.id);
      return NextResponse.json({ ok: true });
    }
    const parsed = prefsSchema.safeParse(body.toggles);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION", message: "Invalid preferences" } },
        { status: 400 },
      );
    }
    await savePreferences(user.id, parsed.data);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return adminErrorResponse(err, "Failed to update notifications");
  }
}
