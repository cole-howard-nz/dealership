"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import { requirePermission } from "../../../lib/auth-helpers";
import { setSetting } from "../../../lib/settings";

interface ActionResult {
  error: string | null;
  success: boolean;
}

// ─── Business details ─────────────────────────────────────────────────────────

const businessSchema = z.object({
  businessName: z.string().min(1, "Business name is required").max(200),
  businessPhone: z.string().max(50).optional(),
  businessAddress: z.string().max(500).optional(),
  publicSiteUrl: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.string().url("Must be a valid URL").optional()
  ),
});

export async function updateBusinessDetails(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  await requirePermission("settings.manage");

  const parsed = businessSchema.safeParse({
    businessName: formData.get("businessName"),
    businessPhone: formData.get("businessPhone") || undefined,
    businessAddress: formData.get("businessAddress") || undefined,
    publicSiteUrl: formData.get("publicSiteUrl") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message, success: false };

  await setSetting("businessName", parsed.data.businessName);
  await setSetting("businessPhone", parsed.data.businessPhone ?? "");
  await setSetting("businessAddress", parsed.data.businessAddress ?? "");
  await setSetting("publicSiteUrl", parsed.data.publicSiteUrl ?? "");

  revalidatePath("/admin/settings");
  return { error: null, success: true };
}

// ─── Data retention ───────────────────────────────────────────────────────────

const retentionSchema = z.object({
  months: z.coerce.number().int().min(1).max(60),
});

export async function updateRetentionPeriod(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  await requirePermission("settings.manage");

  const parsed = retentionSchema.safeParse({ months: formData.get("months") });
  if (!parsed.success) return { error: "Invalid retention period.", success: false };

  await setSetting("retentionPeriodMonths", String(parsed.data.months));

  revalidatePath("/admin/settings");
  return { error: null, success: true };
}

// ─── Location notification toggle ─────────────────────────────────────────────

export async function toggleLocationNotification(
  locationId: string,
  enabled: boolean
): Promise<ActionResult> {
  await requirePermission("settings.manage");

  const location = await prisma.location.findUnique({
    where: { id: locationId },
    select: { id: true },
  });
  if (!location) return { error: "Location not found.", success: false };

  await prisma.location.update({
    where: { id: locationId },
    data: { notifyOnNewRequest: enabled },
  });

  revalidatePath("/admin/settings");
  return { error: null, success: true };
}
