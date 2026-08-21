import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";

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

/**
 * Instructor shell gate — any active INSTRUCTOR can see their own
 * dashboard. Eligibility to create/submit an Event (verified, not
 * suspended, profile complete) is a separate, narrower check performed
 * inline where it matters, not here.
 */
export async function requireInstructor() {
  const user = await requireUser();
  if (user.role !== "INSTRUCTOR") {
    redirect("/dashboard");
  }
  const instructor = await prisma.instructor.findUnique({ where: { userId: user.id } });
  if (!instructor) {
    redirect("/dashboard");
  }
  return { user, instructor };
}
