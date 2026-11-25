import { auth } from "@/auth";
import type { SessionUser } from "@/modules/listings/policies";

export async function requireSessionUser(): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }
  return {
    id: session.user.id,
    role: session.user.role,
  };
}
