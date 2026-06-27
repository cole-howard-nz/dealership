"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import { requirePermission, logAction } from "../../../lib/auth-helpers";
import { PERMISSIONS } from "../../../lib/permissions";

interface ActionResult {
  error: string | null;
  id?: string;
}

const ALL_PERMISSION_KEYS = Object.values(PERMISSIONS) as string[];

const roleSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  permissions: z.array(z.string()),
});

// ─── Create role ──────────────────────────────────────────────────────────────

export async function createRole(formData: FormData): Promise<ActionResult> {
  const session = await requirePermission("staff.roles");

  const permissions = formData.getAll("permissions").map(String).filter((p) => ALL_PERMISSION_KEYS.includes(p));
  const parsed = roleSchema.safeParse({ name: formData.get("name"), permissions });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const existing = await prisma.role.findUnique({ where: { name: parsed.data.name }, select: { id: true } });
  if (existing) return { error: "A role with this name already exists." };

  const role = await prisma.role.create({
    data: { name: parsed.data.name, permissions: parsed.data.permissions },
  });

  await logAction({
    actorId: session.user.id,
    action: "ROLE_CREATED",
    entityType: "Role",
    entityId: role.id,
    metadata: { name: role.name },
  });

  revalidatePath("/admin/roles");
  return { error: null, id: role.id };
}

// ─── Update role ──────────────────────────────────────────────────────────────

export async function updateRole(id: string, formData: FormData): Promise<ActionResult> {
  const session = await requirePermission("staff.roles");

  const role = await prisma.role.findUnique({ where: { id }, select: { isSystem: true, name: true } });
  if (!role) return { error: "Role not found." };
  if (role.isSystem) return { error: "The Owner role cannot be modified." };

  const permissions = formData.getAll("permissions").map(String).filter((p) => ALL_PERMISSION_KEYS.includes(p));
  const parsed = roleSchema.safeParse({ name: formData.get("name"), permissions });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  // Check name uniqueness if changed
  if (parsed.data.name !== role.name) {
    const conflict = await prisma.role.findUnique({ where: { name: parsed.data.name }, select: { id: true } });
    if (conflict && conflict.id !== id) return { error: "A role with this name already exists." };
  }

  await prisma.role.update({
    where: { id },
    data: { name: parsed.data.name, permissions: parsed.data.permissions },
  });

  await logAction({
    actorId: session.user.id,
    action: "ROLE_UPDATED",
    entityType: "Role",
    entityId: id,
    metadata: { name: parsed.data.name, permissionCount: parsed.data.permissions.length },
  });

  revalidatePath("/admin/roles");
  revalidatePath(`/admin/roles/${id}`);
  return { error: null };
}

// ─── Delete role ──────────────────────────────────────────────────────────────

export async function deleteRole(id: string): Promise<ActionResult> {
  const session = await requirePermission("staff.roles");

  const role = await prisma.role.findUnique({
    where: { id },
    select: { isSystem: true, name: true, _count: { select: { users: true } } },
  });
  if (!role) return { error: "Role not found." };
  if (role.isSystem) return { error: "The Owner role cannot be deleted." };
  if (role._count.users > 0) {
    return { error: `Cannot delete this role — ${role._count.users} user(s) are assigned to it.` };
  }

  await prisma.role.delete({ where: { id } });

  await logAction({
    actorId: session.user.id,
    action: "ROLE_DELETED",
    entityType: "Role",
    entityId: id,
    metadata: { name: role.name },
  });

  revalidatePath("/admin/roles");
  return { error: null };
}
