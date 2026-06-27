import type { Metadata } from "next";
import { requirePermission } from "../../../lib/auth-helpers";
import { prisma } from "../../../lib/prisma";
import { getAllSettings } from "../../../lib/settings";
import { SettingsBusinessForm } from "../../../components/portal/SettingsBusinessForm";
import { SettingsRetentionForm } from "../../../components/portal/SettingsRetentionForm";
import { SettingsNotificationsSection } from "../../../components/portal/SettingsNotificationsSection";
import { updateBusinessDetails, updateRetentionPeriod, toggleLocationNotification } from "./actions";

export const metadata: Metadata = {
  title: "Settings — Northbridge Motors Staff Portal",
};

function SectionCard({ title, description, children }: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden" style={{ borderColor: "#E4E5E8" }}>
      <div className="px-5 py-4 border-b" style={{ borderColor: "#E4E5E8", backgroundColor: "#F9FAFB" }}>
        <h2 className="text-sm font-semibold" style={{ color: "#13151A" }}>{title}</h2>
        {description && <p className="text-xs mt-0.5" style={{ color: "#5B5F6B" }}>{description}</p>}
      </div>
      {children}
    </div>
  );
}

export default async function SettingsPage() {
  await requirePermission("settings.manage");

  const [settings, locations] = await Promise.all([
    getAllSettings(),
    prisma.location.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true, notifyOnNewRequest: true },
    }),
  ]);

  const retentionMonths = Number(settings.retentionPeriodMonths) || 1;

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold" style={{ color: "#13151A" }}>Settings</h1>
        <p className="text-sm mt-0.5" style={{ color: "#5B5F6B" }}>
          System-wide configuration for Northbridge Motors Staff Portal.
        </p>
      </div>

      <div className="space-y-5">
        {/* Business details */}
        <SectionCard title="Business Details" description="Used in emails and portal display.">
          <SettingsBusinessForm
            action={updateBusinessDetails}
            defaultValues={{
              businessName: settings.businessName,
              businessPhone: settings.businessPhone,
              businessAddress: settings.businessAddress,
            }}
          />
        </SectionCard>

        {/* Email notifications */}
        <SectionCard
          title="Email Notifications"
          description="Control which location inboxes receive emails when new requests arrive."
        >
          <SettingsNotificationsSection
            locations={locations}
            toggleAction={toggleLocationNotification}
          />
        </SectionCard>

        {/* Data retention */}
        <SectionCard
          title="Finance Application Retention"
          description="Applications older than this are automatically purged. Reduces GDPR/Privacy Act exposure."
        >
          <SettingsRetentionForm
            action={updateRetentionPeriod}
            currentMonths={retentionMonths}
          />
        </SectionCard>

        {/* Cron setup info */}
        <SectionCard title="Scheduled Jobs">
          <div className="px-5 py-4 text-sm space-y-2" style={{ color: "#5B5F6B" }}>
            <p>
              The finance application purge runs via a protected API route at{" "}
              <code className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: "#F3F4F6", color: "#374151" }}>
                POST /api/cron/purge-finance
              </code>
            </p>
            <p>
              Set up an external cron service (e.g.{" "}
              <a href="https://cron-job.org" target="_blank" rel="noopener noreferrer" className="underline">cron-job.org</a>,{" "}
              Upstash, or Vercel Cron) to call this endpoint daily with the{" "}
              <code className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: "#F3F4F6", color: "#374151" }}>
                x-cron-secret
              </code>{" "}
              header matching the <code className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: "#F3F4F6", color: "#374151" }}>CRON_SECRET</code> env var.
            </p>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
