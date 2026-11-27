import { NextResponse } from "next/server";
import { resendVerificationSchema } from "@/modules/auth/schemas";
import { resendVerification } from "@/modules/auth/service";
import { clientIp } from "@/modules/auth/rate-limit";

export const dynamic = "force-dynamic";

/** "Send me a new verification link". Same answer whether or not the account exists. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = resendVerificationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION", message: "Invalid request" } },
        { status: 400 },
      );
    }

    const result = await resendVerification({
      ...parsed.data,
      ip: clientIp(request),
    });
    if (!result.ok) {
      const status = result.code === "RATE_LIMITED" ? 429 : 503;
      return NextResponse.json(
        { error: { code: result.code, message: "Could not send the email" } },
        { status },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/auth/resend-verification", err);
    return NextResponse.json(
      { error: { code: "INTERNAL", message: "Request failed" } },
      { status: 500 },
    );
  }
}
