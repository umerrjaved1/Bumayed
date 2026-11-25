import { NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/modules/auth/schemas";
import { requestPasswordReset } from "@/modules/auth/service";
import { clientIp } from "@/modules/auth/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      // Still return generic OK — no enumeration
      return NextResponse.json({
        ok: true,
        message:
          "If an account exists for those details, you will receive further instructions shortly.",
      });
    }

    const result = await requestPasswordReset(parsed.data.email, clientIp(request));
    return NextResponse.json(result);
  } catch (err) {
    console.error("POST /api/auth/forgot-password", err);
    return NextResponse.json(
      { error: { code: "INTERNAL", message: "Request failed" } },
      { status: 500 },
    );
  }
}
