import { NextResponse } from "next/server";
import { registerSchema } from "@/modules/auth/schemas";
import { registerUser } from "@/modules/auth/service";
import { clientIp } from "@/modules/auth/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
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

    const result = await registerUser(parsed.data, clientIp(request));
    if (!result.ok) {
      const status = result.code === "RATE_LIMITED" ? 429 : 400;
      return NextResponse.json(
        { error: { code: result.code, message: result.message } },
        { status },
      );
    }

    return NextResponse.json({
      ok: true,
      message:
        "Account created. If you registered with email, check your inbox to verify before signing in.",
    });
  } catch (err) {
    console.error("POST /api/auth/register", err);
    return NextResponse.json(
      { error: { code: "INTERNAL", message: "Registration failed" } },
      { status: 500 },
    );
  }
}
