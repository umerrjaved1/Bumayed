import "dotenv/config";
import { authenticateCredentials } from "../src/modules/auth/service";
import { prisma } from "../src/lib/prisma";
import { verifyPassword } from "../src/modules/auth/password";

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "dealer.dev@bumayed.local" },
  });
  console.log({
    found: !!user,
    hashPrefix: user?.passwordHash?.slice(0, 10),
    status: user?.status,
    verified: user?.emailVerifiedAt,
  });
  if (user?.passwordHash) {
    console.log(
      "verify",
      await verifyPassword("DevPassword123!", user.passwordHash),
    );
  }
  const result = await authenticateCredentials({
    identifier: "dealer.dev@bumayed.local",
    password: "DevPassword123!",
    ip: "debug",
  });
  console.log(result);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
