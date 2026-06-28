import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "../../../../../lib/auth-helpers";
import { hasPermission } from "../../../../../lib/permissions";
import { prisma } from "../../../../../lib/prisma";
import { StatusBadge } from "../../../../../components/portal/StatusBadge";
import { StatusSelect } from "../../../../../components/portal/StatusSelect";
import { AssigneeSelect } from "../../../../../components/portal/AssigneeSelect";
import { AddNoteForm } from "../../../../../components/portal/AddNoteForm";
import { NotesList } from "../../../../../components/portal/NotesList";
import { updateRequestStatus, assignRequest, addNote, editNote, deleteNote } from "../../actions";
import { formatDistanceToNow, format } from "date-fns";
import { ArrowLeft, MapPin, AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Finance Application — Northbridge Motors Staff Portal",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function FinanceApplicationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await requirePermission("finance.view");

  const permissions = session.user.role.permissions;
  const canUpdate = hasPermission(permissions, "finance.update");
  const hasViewAll = hasPermission(permissions, "locations.viewall");
  const userLocationIds = session.user.locations.map((l) => l.id);

  const application = await prisma.financeApplication.findUnique({
    where: { id },
    include: {
      location: { select: { id: true, name: true } },
      assignedTo: { select: { id: true, name: true } },
      notes: {
        orderBy: { createdAt: "desc" },
        select: { id: true, body: true, authorId: true, createdAt: true, author: { select: { name: true } } },
      },
    },
  });

  if (!application) notFound();
  if (!hasViewAll && !userLocationIds.includes(application.locationId)) notFound();

  const staffOptions = await prisma.user.findMany({
    where: {
      isActive: true,
      locations: { some: { locationId: application.locationId } },
    },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  // Serviceability calculation (indicative only)
  const loanNet = Math.max(0, application.desiredLoanAmount - application.depositAmount);
  const monthlyRate = 0.0999 / 12; // assume ~9.99% p.a. indicative rate
  const n = application.termMonths;
  const monthlyRepayment =
    n > 0 && monthlyRate > 0
      ? (loanNet * (monthlyRate * Math.pow(1 + monthlyRate, n))) /
        (Math.pow(1 + monthlyRate, n) - 1)
      : loanNet / (n || 1);
  const incomeRatio =
    application.monthlyIncome > 0
      ? (monthlyRepayment / application.monthlyIncome) * 100
      : 0;

  const shortId = id.slice(-6).toUpperCase();

  return (
    <div>
      <Link
        href="/admin/requests/finance"
        className="inline-flex items-center gap-1.5 text-sm mb-5 hover:underline"
        style={{ color: "#5B5F6B" }}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Finance Applications
      </Link>

      <div className="mb-6">
        <div className="flex items-start gap-3 flex-wrap">
          <div>
            <h1 className="font-heading text-2xl font-bold" style={{ color: "#13151A" }}>
              FA-{shortId} · {application.fullName}
            </h1>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="flex items-center gap-1 text-sm" style={{ color: "#5B5F6B" }}>
                <MapPin className="h-3.5 w-3.5" style={{ color: "#E15A2C" }} aria-hidden="true" />
                {application.location.name}
              </span>
              <span className="text-sm" style={{ color: "#9CA3AF" }}>
                Received {formatDistanceToNow(application.createdAt, { addSuffix: true })}
              </span>
            </div>
          </div>
          <div className="ml-auto">
            <StatusBadge status={application.status} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: application data */}
        <div className="lg:col-span-2 space-y-5">
          <Section title="Personal Details">
            <Field label="Full name" value={application.fullName} />
            <Field label="Email">
              <a href={`mailto:${application.email}`} className="hover:underline" style={{ color: "#E15A2C" }}>
                {application.email}
              </a>
            </Field>
            <Field label="Phone">
              <a href={`tel:${application.phone}`} className="hover:underline" style={{ color: "#E15A2C" }}>
                {application.phone}
              </a>
            </Field>
            <Field label="Date of birth" value={format(application.dateOfBirth, "d MMM yyyy")} />
            <Field label="Address" value={application.address} />
          </Section>

          <Section title="Employment">
            <Field label="Employment status" value={application.employmentStatus} />
            {application.employerName && (
              <Field label="Employer" value={application.employerName} />
            )}
            <Field label="Monthly income" value={`$${application.monthlyIncome.toLocaleString()}`} />
            <Field label="Time in role" value={`${application.timeInRoleMonths} months`} />
          </Section>

          <Section title="Loan Details">
            <Field label="Loan amount" value={`$${application.desiredLoanAmount.toLocaleString()}`} />
            <Field label="Deposit" value={`$${application.depositAmount.toLocaleString()}`} />
            <Field label="Net loan" value={`$${loanNet.toLocaleString()}`} />
            <Field label="Term" value={`${application.termMonths} months`} />
            <Field label="Has trade-in" value={application.hasTradeIn ? "Yes" : "No"} />
          </Section>

          {/* Quick Serviceability Indicator */}
          <div
            className="rounded-xl border overflow-hidden"
            style={{ borderColor: "#E4E5E8", backgroundColor: "#FFFBEB" }}
          >
            <div
              className="px-5 py-3 border-b flex items-center gap-2"
              style={{ borderColor: "#FDE68A", backgroundColor: "#FEF3C7" }}
            >
              <AlertTriangle className="h-4 w-4 shrink-0" style={{ color: "#92400E" }} aria-hidden="true" />
              <h2 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#92400E" }}>
                Quick Serviceability (Indicative Only)
              </h2>
            </div>
            <div className="px-5 py-4 space-y-1">
              <ServiceRow label="Monthly income" value={`$${application.monthlyIncome.toLocaleString()}`} />
              <ServiceRow label="Loan amount" value={`$${application.desiredLoanAmount.toLocaleString()}`} />
              <ServiceRow label="Term" value={`${application.termMonths} months`} />
              <ServiceRow
                label="Est. repayment"
                value={`~$${Math.round(monthlyRepayment).toLocaleString()}/mo`}
                highlight
              />
              <ServiceRow
                label="Income ratio"
                value={`${incomeRatio.toFixed(1)}%`}
                highlight={incomeRatio > 30}
                highlightColor={incomeRatio > 30 ? "#DC2626" : "#1F9D55"}
              />
              <p className="pt-3 text-xs border-t" style={{ borderColor: "#FDE68A", color: "#92400E" }}>
                This is indicative only. A qualified finance assessment is required before any approval.
              </p>
            </div>
          </div>

          <Section title="Consents">
            <Field
              label="Credit check"
              value={application.creditCheckConsent ? "Consented" : "Not consented"}
            />
            <Field
              label="Terms accepted"
              value={application.termsAccepted ? "Yes" : "No"}
            />
          </Section>

          <Section title="Timeline">
            <Field label="Received" value={format(application.createdAt, "d MMM yyyy, h:mm a")} />
            <Field label="Last updated" value={format(application.updatedAt, "d MMM yyyy, h:mm a")} />
          </Section>
        </div>

        {/* Right: action panel */}
        <div className="space-y-4">
          <Panel title="Status">
            <StatusSelect
              currentStatus={application.status}
              requestId={application.id}
              entityType="FinanceApplication"
              updateAction={updateRequestStatus}
              canUpdate={canUpdate}
            />
          </Panel>

          <Panel title="Assigned To">
            <AssigneeSelect
              currentAssigneeId={application.assignedToId}
              requestId={application.id}
              entityType="FinanceApplication"
              staffOptions={staffOptions}
              updateAction={assignRequest}
              canUpdate={canUpdate}
            />
          </Panel>

          <Panel title="Internal Notes">
            {canUpdate && (
              <div className="mb-4">
                <AddNoteForm
                  requestId={application.id}
                  entityType="FinanceApplication"
                  addNoteAction={addNote}
                />
              </div>
            )}
            <NotesList
                notes={application.notes}
                currentUserId={session.user.id}
                canUpdate={canUpdate}
                editNoteAction={editNote}
                deleteNoteAction={deleteNote}
              />
          </Panel>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden" style={{ borderColor: "#E4E5E8" }}>
      <div className="px-5 py-3 border-b" style={{ borderColor: "#E4E5E8", backgroundColor: "#F9FAFB" }}>
        <h2 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#5B5F6B" }}>{title}</h2>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function Field({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-4 py-1.5 border-b last:border-b-0 text-sm" style={{ borderColor: "#F3F4F6" }}>
      <span className="w-40 shrink-0 font-medium" style={{ color: "#9CA3AF" }}>{label}</span>
      <span style={{ color: "#13151A" }}>{children ?? value ?? "—"}</span>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden" style={{ borderColor: "#E4E5E8" }}>
      <div className="px-4 py-3 border-b" style={{ borderColor: "#E4E5E8", backgroundColor: "#F9FAFB" }}>
        <h2 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#5B5F6B" }}>{title}</h2>
      </div>
      <div className="px-4 py-4">{children}</div>
    </div>
  );
}

function ServiceRow({
  label,
  value,
  highlight = false,
  highlightColor = "#13151A",
}: {
  label: string;
  value: string;
  highlight?: boolean;
  highlightColor?: string;
}) {
  return (
    <div className="flex items-center justify-between text-sm py-0.5">
      <span style={{ color: "#92400E" }}>{label}</span>
      <span
        className={highlight ? "font-semibold" : ""}
        style={{ color: highlight ? highlightColor : "#13151A" }}
      >
        {value}
      </span>
    </div>
  );
}
