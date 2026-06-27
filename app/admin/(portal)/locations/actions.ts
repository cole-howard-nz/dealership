"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import { requirePermission, logAction } from "../../../lib/auth-helpers";

interface ActionResult {
  error: string | null;
}

const locationSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  address: z.preprocess((v) => (v === "" ? null : v), z.string().max(500).nullable()),
  phone: z.preprocess((v) => (v === "" ? null : v), z.string().max(50).nullable()),
  email: z.preprocess(
    (v) => (v === "" ? null : v),
    z.string().email("Invalid email").nullable().optional()
  ),
});

// ─── Create location ──────────────────────────────────────────────────────────

export async function createLocation(formData: FormData): Promise<{ error: string }> {
  const session = await requirePermission("locations.manage");

  const parsed = locationSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const existing = await prisma.location.findFirst({
    where: { name: { equals: parsed.data.name, mode: "insensitive" } },
    select: { id: true },
  });
  if (existing) return { error: "A location with this name already exists." };

  const location = await prisma.location.create({
    data: {
      name: parsed.data.name,
      address: parsed.data.address ?? null,
      phone: parsed.data.phone ?? null,
      email: parsed.data.email ?? null,
    },
  });

  await logAction({
    actorId: session.user.id,
    action: "LOCATION_CREATED",
    entityType: "Location",
    entityId: location.id,
    locationId: location.id,
    metadata: { name: location.name },
  });

  revalidatePath("/admin/locations");
  redirect(`/admin/locations/${location.id}`);
}

// ─── Update location ──────────────────────────────────────────────────────────

export async function updateLocation(id: string, formData: FormData): Promise<ActionResult> {
  const session = await requirePermission("locations.manage");

  const location = await prisma.location.findUnique({ where: { id }, select: { name: true } });
  if (!location) return { error: "Location not found." };

  const parsed = locationSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  if (parsed.data.name !== location.name) {
    const conflict = await prisma.location.findFirst({
      where: { name: { equals: parsed.data.name, mode: "insensitive" }, id: { not: id } },
      select: { id: true },
    });
    if (conflict) return { error: "A location with this name already exists." };
  }

  await prisma.location.update({
    where: { id },
    data: {
      name: parsed.data.name,
      address: parsed.data.address ?? null,
      phone: parsed.data.phone ?? null,
      email: parsed.data.email ?? null,
    },
  });

  await logAction({
    actorId: session.user.id,
    action: "LOCATION_UPDATED",
    entityType: "Location",
    entityId: id,
    locationId: id,
    metadata: { name: parsed.data.name },
  });

  revalidatePath("/admin/locations");
  revalidatePath(`/admin/locations/${id}`);
  return { error: null };
}

// ─── Deactivate location ──────────────────────────────────────────────────────

export async function deactivateLocation(id: string): Promise<ActionResult> {
  const session = await requirePermission("locations.manage");

  const location = await prisma.location.findUnique({
    where: { id },
    select: { isActive: true, name: true },
  });
  if (!location) return { error: "Location not found." };
  if (!location.isActive) return { error: "Location is already deactivated." };

  await prisma.location.update({ where: { id }, data: { isActive: false } });

  await logAction({
    actorId: session.user.id,
    action: "LOCATION_DEACTIVATED",
    entityType: "Location",
    entityId: id,
    locationId: id,
    metadata: { name: location.name },
  });

  revalidatePath("/admin/locations");
  revalidatePath(`/admin/locations/${id}`);
  return { error: null };
}

// ─── Activate location ────────────────────────────────────────────────────────

export async function activateLocation(id: string): Promise<ActionResult> {
  const session = await requirePermission("locations.manage");

  const location = await prisma.location.findUnique({
    where: { id },
    select: { isActive: true, name: true },
  });
  if (!location) return { error: "Location not found." };
  if (location.isActive) return { error: "Location is already active." };

  await prisma.location.update({ where: { id }, data: { isActive: true } });

  await logAction({
    actorId: session.user.id,
    action: "LOCATION_ACTIVATED",
    entityType: "Location",
    entityId: id,
    locationId: id,
    metadata: { name: location.name },
  });

  revalidatePath("/admin/locations");
  revalidatePath(`/admin/locations/${id}`);
  return { error: null };
}
