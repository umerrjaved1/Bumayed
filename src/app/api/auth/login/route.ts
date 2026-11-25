import { NextResponse } from "next/server";
import { signIn } from "@/auth";
import { loginSchema } from "@/modules/auth/schemas";
import { clientIp } from "@/modules/auth/rate-limit";

export const dynamic = "force-dynamic";

const MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: "Invalid email/phone or password.",
  EMAIL_NOT_VERIFIED: "Verify your email before signing in.",
  ACCOUNT_DISABLED: "This account is suspended or blocked.",
  RATE_LIMITED: "Too many attempts. Try again later.",
  CredentialsSignin: "Invalid email/phone or password.",
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION", message: "Invalid credentials" } },
        { status: 400 },
      );
    }

    const result = await signIn("credentials", {
      identifier: parsed.data.identifier,
      password: parsed.data.password,
      ip: clientIp(request),
      redirect: false,
    });

    // Auth.js returns { error, code, ok, … } when redirect:false
    if (result && typeof result === "object" && "error" in result && result.error) {
      const code =
        ("code" in result && typeof result.code === "string" && result.code) ||
        "INVALID_CREDENTIALS";
      const status = code === "RATE_LIMITED" ? 429 : 401;
      return NextResponse.json(
        {
          error: {
            code,
            message: MESSAGES[code] ?? MESSAGES.INVALID_CREDENTIALS,
          },
        },
        { status },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) {
      return NextResponse.json({ ok: true });
    }
    console.error("POST /api/auth/login", err);
    return NextResponse.json(
      { error: { code: "INTERNAL", message: "Sign in failed" } },
      { status: 500 },
    );
  }
}
