"use server";

import { randomBytes } from "crypto";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import { sendPasswordResetEmail } from "../../../lib/email";

interface ActionResult {
  error: string | null;
  success: boolean;
}

const emailSchema = z.string().email("Invalid email address");

export async function requestPasswordReset(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "");
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) return { error: "Please enter a valid email address.", success: false };

  const user = await prisma.user.findUnique({
    where: { email: parsed.data },
    select: { id: true, name: true, email: true, isActive: true, passwordHash: true },
  });

  // Always return success to avoid leaking which emails exist
  if (!user || !user.isActive || !user.passwordHash) {
    return { error: null, success: true };
  }

  // Invalidate any previous reset tokens for this user
  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, used: false },
    data: { used: true },
  });

  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.create({
    data: { userId: user.id, token, expires },
  });

  await sendPasswordResetEmail(user.email, user.name, token);

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "PASSWORD_RESET_REQUESTED",
      entityType: "User",
      entityId: user.id,
    },
  });

  return { error: null, success: true };
}
