"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/client";
import { requireAdmin } from "@/lib/permissions";
import { writeAuditLog } from "@/lib/audit/log";
import { settingsSchema } from "@/lib/validations/settings";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function updateSettings(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();

  const parsed = settingsSchema.safeParse({
    siteName: formData.get("siteName"),
    siteLogoUrl: formData.get("siteLogoUrl") ?? "",
    defaultTimeZone: formData.get("defaultTimeZone"),
    currency: formData.get("currency"),
    seatHoldMinutes: formData.get("seatHoldMinutes"),
    joinWindowBeforeMinutes: formData.get("joinWindowBeforeMinutes"),
    joinWindowAfterMinutes: formData.get("joinWindowAfterMinutes"),
    bkashNagadReceivingMsisdn: formData.get("bkashNagadReceivingMsisdn"),
    maintenanceMode: formData.get("maintenanceMode"),
    contactEmail: formData.get("contactEmail") ?? "",
    contactPhone: formData.get("contactPhone") ?? "",
    contactAddress: formData.get("contactAddress") ?? "",
    whatsappUrl: formData.get("whatsappUrl") ?? "",
    facebookUrl: formData.get("facebookUrl") ?? "",
    linkedinUrl: formData.get("linkedinUrl") ?? "",
    youtubeUrl: formData.get("youtubeUrl") ?? "",
    emailFromName: formData.get("emailFromName") ?? "",
    emailFromAddress: formData.get("emailFromAddress") ?? "",
    smtpHost: formData.get("smtpHost") ?? "",
    smtpPort: formData.get("smtpPort") ?? "",
    smtpUser: formData.get("smtpUser") ?? "",
    smtpPassword: formData.get("smtpPassword") ?? "",
    registrationEmailTemplate: formData.get("registrationEmailTemplate") ?? "",
    certificateEmailTemplate: formData.get("certificateEmailTemplate") ?? "",
    certificateSignatoryName: formData.get("certificateSignatoryName") ?? "",
    certificateSignatoryDesignation: formData.get("certificateSignatoryDesignation") ?? "",
    termsContent: formData.get("termsContent") ?? "",
    privacyContent: formData.get("privacyContent") ?? "",
    refundContent: formData.get("refundContent") ?? "",
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid settings." };
  }

  const current = await prisma.settings.findUnique({ where: { id: 1 } });

  await prisma.settings.upsert({
    where: { id: 1 },
    update: parsed.data,
    create: { id: 1, ...parsed.data },
  });

  const changes: string[] = [];
  if (current) {
    for (const key of Object.keys(parsed.data) as (keyof typeof parsed.data)[]) {
      if (current[key] !== parsed.data[key]) {
        changes.push(key);
      }
    }
  }

  if (changes.length > 0) {
    await writeAuditLog({
      actorId: admin.id,
      action: "settings.update",
      targetType: "Settings",
      targetId: "1",
      summary: `Updated platform settings: ${changes.join(", ")}`,
    });
  }

  revalidatePath("/admin/settings");
  revalidatePath("/terms");
  revalidatePath("/privacy");
  revalidatePath("/refund-policy");
  revalidatePath("/contact");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function promoteToAdmin(formData: FormData): Promise<ActionResult> {
  const currentAdmin = await requireAdmin();
  const email = formData.get("email") as string;
  
  if (!email || typeof email !== "string") {
    return { ok: false, error: "Email is required." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { ok: false, error: "No user found with this email address." };
  }

  if (user.role === "ADMIN") {
    return { ok: false, error: "User is already an admin." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: "ADMIN" },
  });

  await writeAuditLog({
    actorId: currentAdmin.id,
    action: "admin.promoted",
    targetType: "User",
    targetId: user.id,
    summary: `Promoted ${user.email} to ADMIN`,
  });

  revalidatePath("/admin/settings");
  return { ok: true };
}

export async function revokeAdmin(formData: FormData): Promise<ActionResult> {
  const currentAdmin = await requireAdmin();
  const userId = formData.get("userId") as string;
  
  if (!userId || typeof userId !== "string") {
    return { ok: false, error: "User ID is required." };
  }

  if (currentAdmin.id === userId) {
    return { ok: false, error: "You cannot revoke your own admin access." };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return { ok: false, error: "User not found." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: "STUDENT" },
  });

  await writeAuditLog({
    actorId: currentAdmin.id,
    action: "admin.revoked",
    targetType: "User",
    targetId: user.id,
    summary: `Revoked ADMIN role from ${user.email}`,
  });

  revalidatePath("/admin/settings");
  return { ok: true };
}
