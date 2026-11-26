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
  PROHIBITED_CONTENT: 400,
  INVALID_LINK: 400,
  INVALID_BANNER_SIZE: 400,
  QUOTA_EXCEEDED: 403,
  INVALID_CATEGORY: 400,
  INVALID_EMIRATE: 400,
  INVALID_CITY: 400,
  INVALID_VIDEO_URL: 400,
  NOT_EDITABLE: 409,
  PAYMENTS_UNAVAILABLE: 503,
};

/** Prisma error codes that mean bad input, not a server fault. */
const PRISMA_STATUS: Record<string, [number, string]> = {
  P2025: [404, "NOT_FOUND"],
  P2003: [400, "VALIDATION"],
  P2023: [400, "VALIDATION"],
  P2007: [400, "VALIDATION"],
  P2002: [409, "CONFLICT"],
};

export function adminErrorResponse(err: unknown, fallbackMessage: string) {
  // request.json() on a malformed body
  if (err instanceof SyntaxError) {
    return NextResponse.json(
      { error: { code: "VALIDATION", message: "Invalid JSON body" } },
      { status: 400 },
    );
  }
  const prismaCode =
    err && typeof err === "object" && "code" in err
      ? String((err as { code: unknown }).code)
      : null;
  if (prismaCode && PRISMA_STATUS[prismaCode]) {
    const [status, code] = PRISMA_STATUS[prismaCode];
    return NextResponse.json(
      { error: { code, message: code.replaceAll("_", " ").toLowerCase() } },
      { status },
    );
  }
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
