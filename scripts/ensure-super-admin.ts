/**
 * Creates the dev super-admin on the database in DATABASE_URL if it is missing,
 * and resets that one account's password to the seed password.
 * Does not create sample ads or any other user.
 *
 * Run: npx tsx scripts/ensure-super-admin.ts
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role, UserStatus } from "../src/generated/prisma/client";

const EMAIL = "admin.dev@bumayed.local";
const PHONE = "+971500000001";
// Same hash as prisma/seed.ts — password DevPassword123!
const PASSWORD_HASH =
  "$2b$12$FbLIkgl4A4fDYSxB7fcVhucvXtS7HSI5HsAi.ON6Qo5M4p3p5TiUa";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  const url = process.env.DATABASE_URL ?? "";
  let host = "unknown";
  try {
    host = new URL(url).hostname;
  } catch {
    throw new Error("DATABASE_URL is missing or invalid");
  }

  const dubai =
    (await prisma.emirate.findFirst({
      where: { code: "DXB" },
      include: { cities: { where: { nameEn: "Dubai" }, take: 1 } },
    })) ??
    (await prisma.emirate.findFirst({ include: { cities: { take: 1 } } }));
  if (!dubai) throw new Error("No emirates in this database");

  const phoneOwner = await prisma.user.findUnique({ where: { phone: PHONE } });
  if (phoneOwner && phoneOwner.email !== EMAIL) {
    throw new Error("Seed admin phone is already used by another account");
  }

  const user = await prisma.user.upsert({
    where: { email: EMAIL },
    update: {
      phone: PHONE,
      passwordHash: PASSWORD_HASH,
      role: Role.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
    },
    create: {
      email: EMAIL,
      phone: PHONE,
      passwordHash: PASSWORD_HASH,
      role: Role.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          displayName: "Super Admin",
          emirateId: dubai.id,
          cityId: dubai.cities[0]?.id,
        },
      },
    },
  });

  console.log(`Super admin ready on ${host} (${user.role}, ${user.status})`);
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
