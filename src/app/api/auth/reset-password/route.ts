import { NextResponse } from "next/server";
import { resetPasswordSchema } from "@/modules/auth/schemas";
import { resetPassword } from "@/modules/auth/service";
import { clientIp } from "@/modules/auth/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION",
            message: parsed.error.issues[0]?.message ?? "Invalid input",
          },
        },
        { status: 400 },
      );
    }

    const result = await resetPassword({
      ...parsed.data,
      ip: clientIp(request),
    });
    if (!result.ok) {
      const status = result.code === "RATE_LIMITED" ? 429 : 400;
      return NextResponse.json(
        { error: { code: result.code, message: result.message } },
        { status },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/auth/reset-password", err);
    return NextResponse.json(
      { error: { code: "INTERNAL", message: "Reset failed" } },
      { status: 500 },
    );
  }
}
