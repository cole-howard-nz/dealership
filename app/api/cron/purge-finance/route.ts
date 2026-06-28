/**
 * Finance application purge cron job.
 *
 * Call daily from an external cron service (cron-job.org, Upstash, Vercel Cron, etc.)
 *
 *   POST /api/cron/purge-finance
 *   Header: x-cron-secret: <value of CRON_SECRET env var>
 *
 * Records older than the configured retentionPeriodMonths are permanently deleted.
 * The purge is logged to the audit trail with a count but no personal data.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getSetting } from "../../../lib/settings";

export async function POST(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured." }, { status: 500 });
  }

  const provided = req.headers.get("x-cron-secret");
  if (provided !== cronSecret) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }

  const retentionStr = await getSetting("retentionPeriodMonths");
  const months = Math.max(1, Number(retentionStr) || 1);

  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);

  const { count } = await prisma.financeApplication.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });

  if (count > 0) {
    await prisma.auditLog.create({
      data: {
        action: "FINANCE_APPLICATIONS_PURGED",
        entityType: "FinanceApplication",
        entityId: "batch",
        metadata: { count, cutoff: cutoff.toISOString(), retentionMonths: months },
      },
    });
  }

  return NextResponse.json({ ok: true, deleted: count, cutoff: cutoff.toISOString() });
}
