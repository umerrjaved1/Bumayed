import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const HASH =
  "$2b$12$FbLIkgl4A4fDYSxB7fcVhucvXtS7HSI5HsAi.ON6Qo5M4p3p5TiUa"; // DevPassword123!

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  const result = await prisma.user.updateMany({
    data: {
      passwordHash: HASH,
      status: "ACTIVE",
      emailVerifiedAt: new Date(),
    },
  });
  console.log(`Updated ${result.count} users (DEV password: DevPassword123!)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
