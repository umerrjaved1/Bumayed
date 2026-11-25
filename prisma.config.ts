import { defineConfig } from "prisma/config";

// Node 24 native .env loading (no dotenv dependency)
process.loadEnvFile();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
});
