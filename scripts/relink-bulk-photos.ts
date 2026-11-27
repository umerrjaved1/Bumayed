/** Point each bulk listing at its own seed photo. */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  const listings = await prisma.listing.findMany({
    where: { slug: { startsWith: "bulk-" } },
    select: { id: true, slug: true },
  });
  for (const listing of listings) {
    await prisma.listingImage.updateMany({
      where: { listingId: listing.id, isPrimary: true },
      data: { objectKey: `seed/${listing.slug}/1.jpg` },
    });
  }
  console.log(`Updated ${listings.length} listing photos.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
