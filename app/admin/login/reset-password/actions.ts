"use server";

import { z } from "zod";
import { prisma } from "../../../lib/prisma";

interface ActionResult {
  error: string | null;
  success: boolean;
}

const resetSchema = z
  .object({
    password: z.string().min(12, "Password must be at least 12 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function resetPassword(
  token: string,
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = resetSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message, success: false };

  const resetRecord = await prisma.passwordResetToken.findFirst({
    where: {
      token,
      used: false,
      expires: { gt: new Date() },
    },
    include: {
      user: { select: { id: true, isActive: true, passwordHash: true } },
    },
  });

  if (!resetRecord || !resetRecord.user.isActive || !resetRecord.user.passwordHash) {
    return { error: "This reset link is invalid or has expired.", success: false };
  }

  const { hash } = await import("bcryptjs");
  const passwordHash = await hash(parsed.data.password, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetRecord.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetRecord.id },
      data: { used: true },
    }),
  ]);

  await prisma.auditLog.create({
    data: {
      actorId: resetRecord.userId,
      action: "PASSWORD_RESET",
      entityType: "User",
      entityId: resetRecord.userId,
    },
  });

  return { error: null, success: true };
}
