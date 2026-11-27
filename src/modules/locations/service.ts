import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CATALOG_TAG } from "@/modules/listings/invalidate";
import { GCC_COUNTRIES, gccByCode, type GccCode } from "@/lib/gcc";

export type CountryDto = {
  code: GccCode;
  nameEn: string;
  nameAr: string;
  dialCode: string;
  currency: string;
};

export type RegionDto = {
  code: string;
  nameEn: string;
  nameAr: string;
  cities: { id: string; nameEn: string; nameAr: string }[];
};

/**
 * Countries that are switched on (Country.isActive). Visitors can only pick,
 * browse and post in these. Cached for five minutes: a country launch shows up
 * almost at once, and the page never waits on the database for it.
 */
export const getActiveCountries = unstable_cache(
  async (): Promise<CountryDto[]> => {
    const rows = await prisma.country.findMany({
      where: { isActive: true },
      orderBy: { code: "asc" },
    });
    // Same order as the GCC table (UAE, Saudi, Qatar, Kuwait, Bahrain, Oman).
    const order = GCC_COUNTRIES.map((c) => c.code as string);
    return rows
      .filter((r) => gccByCode(r.code))
      .sort((x, y) => order.indexOf(x.code) - order.indexOf(y.code))
      .map((r) => ({
        code: r.code as GccCode,
        nameEn: r.nameEn,
        nameAr: r.nameAr,
        dialCode: r.dialCode,
        currency: r.currency,
      }));
  },
  ["active-countries-v1"],
  { revalidate: 300, tags: [CATALOG_TAG] },
);

/** Regions (with their cities) of one active country, in English order. */
export const getRegionsWithCities = unstable_cache(
  async (countryCode: string): Promise<RegionDto[]> => {
    const rows = await prisma.emirate.findMany({
      where: { country: { code: countryCode, isActive: true } },
      orderBy: { nameEn: "asc" },
      include: { cities: { orderBy: { nameEn: "asc" } } },
    });
    return rows.map((r) => ({
      code: r.code,
      nameEn: r.nameEn,
      nameAr: r.nameAr,
      cities: r.cities.map((c) => ({
        id: c.id,
        nameEn: c.nameEn,
        nameAr: c.nameAr,
      })),
    }));
  },
  ["regions-with-cities-v1"],
  { revalidate: 300, tags: [CATALOG_TAG] },
);

export async function getActiveCountryCodes(): Promise<GccCode[]> {
  return (await getActiveCountries()).map((c) => c.code);
}
