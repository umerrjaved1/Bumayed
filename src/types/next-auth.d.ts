import type { Role, UserStatus } from "@/generated/prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      status: UserStatus;
      phone?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    status: UserStatus;
    phone?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    status: UserStatus;
    phone?: string | null;
  }
}
