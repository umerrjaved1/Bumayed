import { cookies } from "next/headers";
import { gccByCode, type GccCode } from "@/lib/gcc";
import { visitorCountryCode } from "@/lib/geo";
import { getActiveCountryCodes } from "@/modules/locations/service";

/** Remembers the country (or "all") a visitor chose with the country selector. */
export const COUNTRY_COOKIE = "bumayed_country";
export const ALL_GCC = "all";

/**
 * The country whose ads a visitor browses by default:
 *  1. the one they picked with the selector (or "all" for the whole GCC),
 *  2. otherwise the country they are visiting from,
 *  3. otherwise the UAE.
 * Only countries that are switched on count, so while only the UAE is live
 * this is always "AE" and the site behaves exactly as before.
 * Returns undefined for "browse the whole GCC".
 */
export async function selectedCountry(): Promise<GccCode | undefined> {
  const active = await getActiveCountryCodes();
  const jar = await cookies();
  const saved = jar.get(COUNTRY_COOKIE)?.value;

  if (saved === ALL_GCC) return active.length > 1 ? undefined : active[0];
  const chosen = gccByCode(saved)?.code;
  if (chosen && active.includes(chosen)) return chosen;

  const visiting = gccByCode(await visitorCountryCode())?.code;
  if (visiting && active.includes(visiting)) return visiting;

  return active.includes("AE") ? "AE" : active[0];
}
