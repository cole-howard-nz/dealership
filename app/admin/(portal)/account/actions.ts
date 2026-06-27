"use server";

import { prisma } from "../../../lib/prisma";
import { requireAuth, logAction } from "../../../lib/auth-helpers";
import bcrypt from "bcryptjs";
import { z } from "zod";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(12, "Password must be at least 12 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

interface ActionState {
  success: boolean;
  error: string | null;
}

export async function changePasswordAction(
  userId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireAuth();

  // Ensure users can only change their own password
  if (session.user.id !== userId) {
    return { success: false, error: "Unauthorised." };
  }

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    const firstError = parsed.error.errors[0];
    return { success: false, error: firstError.message };
  }

  const { currentPassword, newPassword } = parsed.data;

  // Fetch current hash
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });

  if (!user?.passwordHash) {
    return { success: false, error: "Cannot change password for this account type." };
  }

  // Verify current password
  const match = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!match) {
    return { success: false, error: "Current password is incorrect." };
  }

  // Hash new password
  const newHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newHash },
  });

  // Log the action (no password data in metadata)
  await logAction({
    actorId: userId,
    action: "PASSWORD_CHANGED",
    entityType: "User",
    entityId: userId,
  });

  return { success: true, error: null };
}
