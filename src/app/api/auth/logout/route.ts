import { NextResponse } from "next/server";
import { signOut } from "@/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await signOut({ redirect: false });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) {
      return NextResponse.json({ ok: true });
    }
    console.error("POST /api/auth/logout", err);
    return NextResponse.json(
      { error: { code: "INTERNAL", message: "Sign out failed" } },
      { status: 500 },
    );
  }
}
