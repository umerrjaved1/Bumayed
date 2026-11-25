import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** GET /api/health — liveness probe for local dev and future uptime checks. */
export function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "bumayed",
      timestamp: new Date().toISOString(),
    },
    { status: 200 },
  );
}
