import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSessionUser } from "@/lib/auth-session";
import { adminErrorResponse } from "@/modules/admin/http";
import { updateDealerProfile } from "@/modules/dealer/service";

export const dynamic = "force-dynamic";

const schema = z.object({
  businessName: z.string().trim().min(2).max(120).optional(),
  businessPhone: z.string().trim().min(8).max(20).optional(),
  businessEmail: z.string().trim().email().nullable().optional(),
  whatsappNumber: z.string().trim().max(20).nullable().optional(),
  address: z.string().trim().max(300).nullable().optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  workingHours: z.string().trim().max(200).nullable().optional(),
});

export async function PATCH(request: Request) {
  try {
    const user = await requireSessionUser();
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION",
            message: parsed.error.issues[0]?.message ?? "Invalid profile",
          },
        },
        { status: 400 },
      );
    }
    const profile = await updateDealerProfile(user, parsed.data);
    return NextResponse.json({ profile });
  } catch (err) {
    return adminErrorResponse(err, "Failed to update dealer profile");
  }
}
