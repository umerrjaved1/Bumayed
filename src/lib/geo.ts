import { headers } from "next/headers";
import { gccOrDefault, type GccCountry } from "@/modules/auth/phone";

export { GCC_ISO_CODES, isGccCountry } from "@/lib/geo-codes";

/**
 * Country the visitor is in, as worked out by Vercel from their IP address
 * (empty on a local computer). Used to pre-select the right country code so
 * a visitor from Riyadh does not have to hunt for +966.
 */
export async function visitorCountryCode(): Promise<string | null> {
  const h = await headers();
  return h.get("x-vercel-ip-country");
}

/** The visitor's GCC country, or the UAE when they are elsewhere / unknown. */
export async function visitorGccCountry(): Promise<GccCountry> {
  return gccOrDefault(await visitorCountryCode());
}
