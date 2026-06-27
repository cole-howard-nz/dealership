/**
 * Northbridge Motors — Email via Resend
 *
 * Env vars required:
 *   RESEND_API_KEY       — from resend.com dashboard
 *   RESEND_FROM_EMAIL    — verified sender, e.g. "Northbridge Motors <noreply@northbridgemotors.co.nz>"
 *                          For local testing: use onboarding@resend.dev (Resend's shared sandbox domain)
 *   NEXT_PUBLIC_APP_URL  — base URL for links in emails, e.g. https://staff.northbridgemotors.co.nz
 */

import { Resend } from "resend";

let _client: Resend | null = null;

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_client) _client = new Resend(process.env.RESEND_API_KEY);
  return _client;
}

const FROM = process.env.RESEND_FROM_EMAIL ?? "Northbridge Motors <onboarding@resend.dev>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// ─── Invite email ─────────────────────────────────────────────────────────────

export async function sendInviteEmail(
  to: string,
  name: string,
  inviteToken: string
): Promise<{ sent: boolean }> {
  const resend = getResendClient();
  if (!resend) return { sent: false };

  const inviteUrl = `${APP_URL}/admin/login/invite/${inviteToken}`;

  await resend.emails.send({
    from: FROM,
    to,
    subject: "You've been invited to Northbridge Motors Staff Portal",
    html: inviteEmailHtml(name, inviteUrl),
  });

  return { sent: true };
}

// ─── Password reset email ─────────────────────────────────────────────────────

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetToken: string
): Promise<{ sent: boolean }> {
  const resend = getResendClient();
  if (!resend) return { sent: false };

  const resetUrl = `${APP_URL}/admin/login/reset-password/${resetToken}`;

  await resend.emails.send({
    from: FROM,
    to,
    subject: "Reset your Northbridge Motors staff portal password",
    html: passwordResetEmailHtml(name, resetUrl),
  });

  return { sent: true };
}

// ─── New request notification ─────────────────────────────────────────────────

export type RequestType = "contact" | "tradein" | "finance";

interface NewRequestEmailOptions {
  to: string;
  type: RequestType;
  locationName: string;
  submittedBy: string;
  requestId: string;
  detailUrl: string;
}

export async function sendNewRequestNotification(
  opts: NewRequestEmailOptions
): Promise<{ sent: boolean }> {
  const resend = getResendClient();
  if (!resend) return { sent: false };

  const { to, type, locationName, submittedBy, requestId, detailUrl } = opts;

  const typeLabel =
    type === "contact" ? "Contact Request"
    : type === "tradein" ? "Trade-In Request"
    : "Finance Application";

  await resend.emails.send({
    from: FROM,
    to,
    subject: `New ${typeLabel} — ${locationName}`,
    html: newRequestEmailHtml(typeLabel, locationName, submittedBy, requestId, detailUrl),
  });

  return { sent: true };
}

// ─── Templates ────────────────────────────────────────────────────────────────

const baseStyle = `font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #13151A;`;

function emailWrapper(body: string): string {
  return `<!DOCTYPE html><html><body style="${baseStyle} max-width:600px; margin:0 auto; padding:32px 16px;">
    <div style="margin-bottom:24px;">
      <span style="font-size:13px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#142036;">Northbridge Motors</span>
      <span style="font-size:13px; color:#9CA3AF;"> · Staff Portal</span>
    </div>
    <div style="background:#fff; border:1px solid #E4E5E8; border-radius:12px; padding:32px;">
      ${body}
    </div>
    <p style="font-size:12px; color:#9CA3AF; margin-top:24px; text-align:center;">
      This email was sent by the Northbridge Motors Staff Portal. Do not share it with anyone.
    </p>
  </body></html>`;
}

function primaryButton(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block; margin-top:20px; padding:12px 24px; background:#E15A2C; color:#fff; font-weight:600; font-size:14px; text-decoration:none; border-radius:8px;">${label}</a>`;
}

function inviteEmailHtml(name: string, inviteUrl: string): string {
  return emailWrapper(`
    <h1 style="font-size:22px; font-weight:700; margin:0 0 8px;">You're invited</h1>
    <p style="color:#5B5F6B; margin:0 0 20px;">Hi ${escapeHtml(name)}, you've been invited to join the Northbridge Motors Staff Portal.</p>
    <p style="color:#5B5F6B; margin:0 0 4px;">Click the button below to set your password and activate your account. This link expires in 48 hours.</p>
    ${primaryButton(inviteUrl, "Accept Invite & Set Password")}
    <hr style="border:none; border-top:1px solid #E4E5E8; margin:28px 0 16px;">
    <p style="font-size:12px; color:#9CA3AF; margin:0;">If the button doesn't work, copy and paste this link into your browser:<br>
    <span style="color:#5B5F6B; word-break:break-all;">${escapeHtml(inviteUrl)}</span></p>
  `);
}

function passwordResetEmailHtml(name: string, resetUrl: string): string {
  return emailWrapper(`
    <h1 style="font-size:22px; font-weight:700; margin:0 0 8px;">Reset your password</h1>
    <p style="color:#5B5F6B; margin:0 0 20px;">Hi ${escapeHtml(name)}, we received a request to reset your staff portal password.</p>
    <p style="color:#5B5F6B; margin:0 0 4px;">Click the button below to choose a new password. This link expires in 1 hour.</p>
    ${primaryButton(resetUrl, "Reset Password")}
    <hr style="border:none; border-top:1px solid #E4E5E8; margin:28px 0 16px;">
    <p style="font-size:12px; color:#9CA3AF; margin:0;">If you didn't request this, you can safely ignore this email. Your password won't change.<br><br>
    If the button doesn't work, copy and paste this link into your browser:<br>
    <span style="color:#5B5F6B; word-break:break-all;">${escapeHtml(resetUrl)}</span></p>
  `);
}

function newRequestEmailHtml(
  typeLabel: string,
  locationName: string,
  submittedBy: string,
  requestId: string,
  detailUrl: string
): string {
  return emailWrapper(`
    <h1 style="font-size:22px; font-weight:700; margin:0 0 4px;">New ${escapeHtml(typeLabel)}</h1>
    <p style="color:#5B5F6B; margin:0 0 20px; font-size:14px;">📍 ${escapeHtml(locationName)}</p>
    <table style="width:100%; border-collapse:collapse; font-size:14px;">
      <tr>
        <td style="padding:8px 0; border-bottom:1px solid #F3F4F6; color:#9CA3AF; width:130px;">Submitted by</td>
        <td style="padding:8px 0; border-bottom:1px solid #F3F4F6;">${escapeHtml(submittedBy)}</td>
      </tr>
      <tr>
        <td style="padding:8px 0; color:#9CA3AF;">Reference</td>
        <td style="padding:8px 0; font-family:monospace;">${escapeHtml(requestId.slice(0, 12))}</td>
      </tr>
    </table>
    ${primaryButton(detailUrl, "View in Portal")}
    <p style="font-size:12px; color:#9CA3AF; margin:20px 0 0;">You received this because you are assigned to ${escapeHtml(locationName)} and have notification emails enabled. You can adjust this in your account settings.</p>
  `);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
