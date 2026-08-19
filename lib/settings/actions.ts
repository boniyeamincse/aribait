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
    defaultTimeZone: formData.get("defaultTimeZone"),
    currency: formData.get("currency"),
    seatHoldMinutes: formData.get("seatHoldMinutes"),
    joinWindowBeforeMinutes: formData.get("joinWindowBeforeMinutes"),
    joinWindowAfterMinutes: formData.get("joinWindowAfterMinutes"),
    bkashNagadReceivingMsisdn: formData.get("bkashNagadReceivingMsisdn"),
    maintenanceMode: formData.get("maintenanceMode"),
    contactEmail: formData.get("contactEmail") ?? "",
    contactPhone: formData.get("contactPhone") ?? "",
    facebookUrl: formData.get("facebookUrl") ?? "",
    linkedinUrl: formData.get("linkedinUrl") ?? "",
    emailFromName: formData.get("emailFromName") ?? "",
    emailFromAddress: formData.get("emailFromAddress") ?? "",
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
  return { ok: true };
}
