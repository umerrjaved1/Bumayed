import { NextResponse } from "next/server";
import { verifyEmailSchema } from "@/modules/auth/schemas";
import { verifyEmail } from "@/modules/auth/service";
import { clientIp } from "@/modules/auth/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = verifyEmailSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION",
            message: "Invalid verification request",
          },
        },
        { status: 400 },
      );
    }

    const result = await verifyEmail({
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
    console.error("POST /api/auth/verify-email", err);
    return NextResponse.json(
      { error: { code: "INTERNAL", message: "Verification failed" } },
      { status: 500 },
    );
  }
}
