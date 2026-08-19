import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

/**
 * Real (non-optimistic) authorization boundary. `proxy.ts` only checks
 * cookie presence; every protected layout/action must call one of these
 * so a hidden UI element is never mistaken for authorization.
 */
export async function requireUser() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  if (session.user.status === "SUSPENDED" || session.user.status === "DEACTIVATED") {
    redirect("/login?error=AccountSuspended");
  }
  return session.user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }
  return user;
}
