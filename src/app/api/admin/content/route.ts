import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth-session";
import { adminErrorResponse, clientIp } from "@/modules/admin/http";
import { contentUpsertSchema } from "@/modules/admin/schemas";
import { getContent, saveContentPage } from "@/modules/admin/service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireSessionUser();
    const data = await getContent(user);
    return NextResponse.json(data);
  } catch (err) {
    return adminErrorResponse(err, "Failed to load content");
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireSessionUser();
    const body = await request.json();
    const slug = typeof body.slug === "string" ? body.slug : null;
    if (!slug) {
      return NextResponse.json(
        { error: { code: "VALIDATION", message: "slug required" } },
        { status: 400 },
      );
    }
    const parsed = contentUpsertSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION",
            message: parsed.error.issues[0]?.message ?? "Invalid content",
          },
        },
        { status: 400 },
      );
    }
    const page = await saveContentPage(
      user,
      slug,
      parsed.data,
      clientIp(request),
    );
    return NextResponse.json({ page });
  } catch (err) {
    return adminErrorResponse(err, "Failed to save content");
  }
}
