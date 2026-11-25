import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  can,
  isAdminRole,
  type AdminCapability,
} from "@/modules/admin/policies";

export async function requireAdminPage(
  locale: string,
  capability?: AdminCapability,
) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/${locale}/auth/login?callbackUrl=/${locale}/admin`);
  }
  if (!isAdminRole(session.user.role)) {
    redirect(`/${locale}/dashboard`);
  }
  if (capability && !can({ id: session.user.id, role: session.user.role }, capability)) {
    redirect(`/${locale}/admin`);
  }
  return session;
}
