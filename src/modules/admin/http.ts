import { NextResponse } from "next/server";

const STATUS: Record<string, number> = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION: 400,
  REASON_REQUIRED: 400,
  CANNOT_SELF: 400,
  LAST_SUPER_ADMIN: 400,
  INVALID_TRANSITION: 400,
  INVALID_SIGNATURE: 401,
  WEBHOOK_SECRET_MISSING: 500,
  LISTING_NOT_ACTIVE: 400,
  PRICE_UNAVAILABLE: 400,
  PACKAGE_UNAVAILABLE: 400,
  QUOTA_EXCEEDED: 403,
};

export function adminErrorResponse(err: unknown, fallbackMessage: string) {
  if (err instanceof Error) {
    const code = err.message;
    const status = STATUS[code];
    if (status) {
      return NextResponse.json(
        { error: { code, message: code.replaceAll("_", " ").toLowerCase() } },
        { status },
      );
    }
    // Listing transition failures
    if (code.startsWith("Invalid listing transition")) {
      return NextResponse.json(
        { error: { code: "INVALID_TRANSITION", message: code } },
        { status: 400 },
      );
    }
  }
  console.error(fallbackMessage, err);
  return NextResponse.json(
    { error: { code: "INTERNAL", message: fallbackMessage } },
    { status: 500 },
  );
}

export function clientIp(request: Request): string | null {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    null
  );
}
