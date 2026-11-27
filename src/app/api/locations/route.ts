import { NextResponse } from "next/server";
import { gccByCode } from "@/lib/gcc";
import {
  getActiveCountries,
  getRegionsWithCities,
} from "@/modules/locations/service";

export const dynamic = "force-dynamic";

/**
 * Public location data for the filters and the ad wizard.
 *  GET /api/locations              → countries that are switched on
 *  GET /api/locations?country=SA   → that country's regions and cities
 * Nothing here is personal, so it is safe to cache at the edge for a few minutes.
 */
export async function GET(request: Request) {
  const cache = { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" };
  try {
    const code = new URL(request.url).searchParams.get("country");
    if (!code) {
      return NextResponse.json({ countries: await getActiveCountries() }, { headers: cache });
    }
    const country = gccByCode(code);
    const active = (await getActiveCountries()).find((c) => c.code === country?.code);
    if (!country || !active) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Country not available" } },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { country: active, regions: await getRegionsWithCities(country.code) },
      { headers: cache },
    );
  } catch (err) {
    console.error("GET /api/locations", err);
    return NextResponse.json(
      { error: { code: "INTERNAL", message: "Failed to load locations" } },
      { status: 500 },
    );
  }
}
