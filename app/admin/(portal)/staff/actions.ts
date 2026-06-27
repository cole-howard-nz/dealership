"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { randomBytes } from "crypto";
import { prisma } from "../../../lib/prisma";
import { requirePermission, logAction } from "../../../lib/auth-helpers";
import { hasPermission } from "../../../lib/permissions";

interface ActionResult {
  error: string | null;
  inviteToken?: string;
}

// ─── Invite staff ─────────────────────────────────────────────────────────────

const inviteSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Invalid email address"),
  roleId: z.string().min(1, "Role is required"),
  locationIds: z.array(z.string()).min(1, "At least one location is required"),
});

export async function inviteStaff(formData: FormData): Promise<ActionResult & { inviteToken?: string }> {
  const session = await requirePermission("staff.invite");

  const locationIds = formData.getAll("locationIds").map(String);
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    roleId: formData.get("roleId"),
    locationIds,
  };

  const parsed = inviteSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  // Prevent inviting to Owner role unless current user is Owner (system role)
  const targetRole = await prisma.role.findUnique({
    where: { id: parsed.data.roleId },
    select: { isSystem: true, name: true },
  });
  if (!targetRole) return { error: "Role not found." };
  if (targetRole.isSystem && !hasPermission(session.user.role.permissions, "settings.manage")) {
    return { error: "Only Owners can invite users to the Owner role." };
  }

  // Check email not already in use
  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });
  if (existing) return { error: "A user with this email already exists." };

  // Generate invite token
  const inviteToken = randomBytes(32).toString("hex");
  const inviteTokenExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

  const newUser = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      roleId: parsed.data.roleId,
      isActive: false,
      inviteToken,
      inviteTokenExpiry,
      inviteAccepted: false,
      invitedById: session.user.id,
      locations: {
        create: parsed.data.locationIds.map((locationId) => ({ locationId })),
      },
    },
  });

  await logAction({
    actorId: session.user.id,
    action: "USER_INVITED",
    entityType: "User",
    entityId: newUser.id,
    metadata: { email: newUser.email, roleId: parsed.data.roleId },
  });

  revalidatePath("/admin/staff");
  return { error: null, inviteToken };
}

// ─── Update staff role ────────────────────────────────────────────────────────

export async function updateStaffRole(
  userId: string,
  roleId: string
): Promise<ActionResult> {
  const session = await requirePermission("staff.edit");

  if (userId === session.user.id) return { error: "You cannot change your own role." };

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: { select: { isSystem: true } } },
  });
  if (!targetUser) return { error: "User not found." };

  // Can't strip the last Owner
  if (targetUser.role.isSystem) {
    const ownerCount = await prisma.user.count({
      where: { role: { isSystem: true }, isActive: true },
    });
    if (ownerCount <= 1) return { error: "Cannot change the role of the last active Owner." };
  }

  const newRole = await prisma.role.findUnique({ where: { id: roleId }, select: { isSystem: true } });
  if (!newRole) return { error: "Role not found." };
  if (newRole.isSystem && !hasPermission(session.user.role.permissions, "settings.manage")) {
    return { error: "Only Owners can assign the Owner role." };
  }

  const prevRoleId = targetUser.roleId;
  await prisma.user.update({ where: { id: userId }, data: { roleId } });

  await logAction({
    actorId: session.user.id,
    action: "USER_ROLE_CHANGED",
    entityType: "User",
    entityId: userId,
    metadata: { from: prevRoleId, to: roleId },
  });

  revalidatePath("/admin/staff");
  revalidatePath(`/admin/staff/${userId}`);
  return { error: null };
}

// ─── Update staff locations ───────────────────────────────────────────────────

export async function updateStaffLocations(
  userId: string,
  locationIds: string[]
): Promise<ActionResult> {
  await requirePermission("staff.edit");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!user) return { error: "User not found." };

  if (locationIds.length === 0) return { error: "At least one location is required." };

  // Replace all location assignments
  await prisma.$transaction([
    prisma.userLocation.deleteMany({ where: { userId } }),
    prisma.userLocation.createMany({
      data: locationIds.map((locationId) => ({ userId, locationId })),
    }),
  ]);

  await logAction({
    actorId: userId,
    action: "USER_LOCATIONS_UPDATED",
    entityType: "User",
    entityId: userId,
    metadata: { locationIds },
  });

  revalidatePath("/admin/staff");
  revalidatePath(`/admin/staff/${userId}`);
  return { error: null };
}

// ─── Deactivate staff ─────────────────────────────────────────────────────────

export async function deactivateStaff(userId: string): Promise<ActionResult> {
  const session = await requirePermission("staff.deactivate");

  if (userId === session.user.id) return { error: "You cannot deactivate your own account." };

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: { select: { isSystem: true } } },
  });
  if (!targetUser) return { error: "User not found." };
  if (!targetUser.isActive) return { error: "User is already deactivated." };

  // Can't deactivate the last Owner
  if (targetUser.role.isSystem) {
    const ownerCount = await prisma.user.count({
      where: { role: { isSystem: true }, isActive: true },
    });
    if (ownerCount <= 1) return { error: "Cannot deactivate the last active Owner." };
  }

  await prisma.user.update({ where: { id: userId }, data: { isActive: false } });

  await logAction({
    actorId: session.user.id,
    action: "USER_DEACTIVATED",
    entityType: "User",
    entityId: userId,
  });

  revalidatePath("/admin/staff");
  revalidatePath(`/admin/staff/${userId}`);
  return { error: null };
}

// ─── Activate staff ───────────────────────────────────────────────────────────

export async function activateStaff(userId: string): Promise<ActionResult> {
  const session = await requirePermission("staff.deactivate");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, isActive: true, inviteAccepted: true },
  });
  if (!user) return { error: "User not found." };
  if (user.isActive) return { error: "User is already active." };
  if (!user.inviteAccepted) return { error: "User has not yet accepted their invite." };

  await prisma.user.update({ where: { id: userId }, data: { isActive: true } });

  await logAction({
    actorId: session.user.id,
    action: "USER_ACTIVATED",
    entityType: "User",
    entityId: userId,
  });

  revalidatePath("/admin/staff");
  revalidatePath(`/admin/staff/${userId}`);
  return { error: null };
}

// ─── Resend invite ────────────────────────────────────────────────────────────

export async function resendInvite(userId: string): Promise<ActionResult & { inviteToken?: string }> {
  const session = await requirePermission("staff.invite");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, inviteAccepted: true, email: true },
  });
  if (!user) return { error: "User not found." };
  if (user.inviteAccepted) return { error: "User has already accepted their invite." };

  const inviteToken = randomBytes(32).toString("hex");
  const inviteTokenExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: userId },
    data: { inviteToken, inviteTokenExpiry },
  });

  await logAction({
    actorId: session.user.id,
    action: "INVITE_RESENT",
    entityType: "User",
    entityId: userId,
  });

  revalidatePath(`/admin/staff/${userId}`);
  return { error: null, inviteToken };
}

// ─── Accept invite (public — no auth required) ────────────────────────────────

const acceptSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export async function acceptInvite(
  token: string,
  formData: FormData
): Promise<{ error: string | null }> {
  const parsed = acceptSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const user = await prisma.user.findFirst({
    where: {
      inviteToken: token,
      inviteAccepted: false,
      inviteTokenExpiry: { gt: new Date() },
    },
    select: { id: true },
  });
  if (!user) return { error: "This invite link is invalid or has expired." };

  const { hash } = await import("bcryptjs");
  const passwordHash = await hash(parsed.data.password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      isActive: true,
      inviteAccepted: true,
      inviteToken: null,
      inviteTokenExpiry: null,
    },
  });

  await logAction({
    actorId: user.id,
    action: "INVITE_ACCEPTED",
    entityType: "User",
    entityId: user.id,
  });

  return { error: null };
}
