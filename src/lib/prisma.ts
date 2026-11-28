import { PrismaClient } from "@/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { env } from "@/lib/env";

const connectionString = env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required from Phase 3 onward — see .env.example");
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaMariaDb(connectionString),
  });

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
