/**
 * Adds the regions and cities of the five non-UAE GCC countries.
 * Safe to run on any database, any number of times: it only upserts reference
 * data, never creates ads or accounts, and never changes whether a country is
 * switched on (Country.isActive).
 *
 * Run: npx tsx scripts/seed-gcc-locations.ts   (uses DATABASE_URL)
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { GCC_COUNTRIES } from "../src/lib/gcc";
import { GCC_REGIONS } from "../src/lib/gcc-locations";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  let regions = 0;
  let cities = 0;
  for (const c of GCC_COUNTRIES) {
    // Countries are inserted by the migration; make sure they exist, but keep
    // whatever isActive they already have (new ones start switched off).
    const country = await prisma.country.upsert({
      where: { code: c.code },
      update: {},
      create: {
        code: c.code,
        nameEn: c.nameEn,
        nameAr: c.nameAr,
        dialCode: c.dial,
        currency: c.currency,
        isActive: false,
      },
    });
    if (c.code === "AE") continue; // the UAE's emirates already exist

    for (const r of GCC_REGIONS[c.code]) {
      const region = await prisma.emirate.upsert({
        where: { code: r.code },
        update: { nameEn: r.nameEn, nameAr: r.nameAr, countryId: country.id },
        create: {
          code: r.code,
          nameEn: r.nameEn,
          nameAr: r.nameAr,
          countryId: country.id,
        },
      });
      regions++;
      for (const city of r.cities) {
        await prisma.city.upsert({
          where: { emirateId_nameEn: { emirateId: region.id, nameEn: city.nameEn } },
          update: { nameAr: city.nameAr },
          create: { emirateId: region.id, ...city },
        });
        cities++;
      }
    }
  }
  console.log(`Regions upserted: ${regions}, cities upserted: ${cities}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
