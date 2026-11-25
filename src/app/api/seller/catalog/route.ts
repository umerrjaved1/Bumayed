import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth-session";
import {
  getCitiesForEmirateCode,
  getWizardCatalog,
} from "@/modules/listings/seller-service";
import type { VehicleCategoryCode } from "@/modules/listings/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireSessionUser();
    const url = new URL(request.url);
    const category = (url.searchParams.get("category") ??
      "cars") as VehicleCategoryCode;
    const emirate = url.searchParams.get("emirate");

    if (emirate) {
      const cities = await getCitiesForEmirateCode(emirate);
      return NextResponse.json({ cities });
    }

    const makes = await getWizardCatalog(category);
    return NextResponse.json({ makes });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Sign in required" } },
        { status: 401 },
      );
    }
    console.error("GET catalog", err);
    return NextResponse.json(
      { error: { code: "INTERNAL", message: "Catalog failed" } },
      { status: 500 },
    );
  }
}
