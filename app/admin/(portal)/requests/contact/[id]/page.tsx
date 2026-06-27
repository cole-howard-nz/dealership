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
import { updateRequestStatus, assignRequest, addNote } from "../../actions";
import { formatDistanceToNow, format } from "date-fns";
import { ArrowLeft, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Request — Northbridge Motors Staff Portal",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ContactRequestDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await requirePermission("contact.view");

  const permissions = session.user.role.permissions;
  const canUpdate = hasPermission(permissions, "contact.update");
  const hasViewAll = hasPermission(permissions, "locations.viewall");
  const userLocationIds = session.user.locations.map((l) => l.id);

  const request = await prisma.contactRequest.findUnique({
    where: { id },
    include: {
      location: { select: { id: true, name: true } },
      assignedTo: { select: { id: true, name: true } },
      notes: {
        orderBy: { createdAt: "desc" },
        include: { author: { select: { name: true } } },
      },
    },
  });

  if (!request) notFound();

  // Location scoping check
  if (!hasViewAll && !userLocationIds.includes(request.locationId)) notFound();

  // Staff list for the same location (for assignee dropdown)
  const staffOptions = await prisma.user.findMany({
    where: {
      isActive: true,
      locations: { some: { locationId: request.locationId } },
    },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const shortId = id.slice(-6).toUpperCase();

  return (
    <div className="max-w-screen-xl">
      {/* Back link */}
      <Link
        href="/admin/requests/contact"
        className="inline-flex items-center gap-1.5 text-sm mb-5 hover:underline"
        style={{ color: "#5B5F6B" }}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Contact Requests
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start gap-3 flex-wrap">
          <div>
            <h1 className="font-heading text-2xl font-bold" style={{ color: "#13151A" }}>
              CR-{shortId} · {request.name}
            </h1>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="flex items-center gap-1 text-sm" style={{ color: "#5B5F6B" }}>
                <MapPin className="h-3.5 w-3.5" style={{ color: "#E15A2C" }} aria-hidden="true" />
                {request.location.name}
              </span>
              <span className="text-sm" style={{ color: "#9CA3AF" }}>
                Received {formatDistanceToNow(request.createdAt, { addSuffix: true })}
              </span>
            </div>
          </div>
          <div className="ml-auto">
            <StatusBadge status={request.status} />
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: request data */}
        <div className="lg:col-span-2 space-y-5">
          <Section title="Contact Details">
            <Field label="Name" value={request.name} />
            <Field label="Email">
              <a
                href={`mailto:${request.email}`}
                className="hover:underline"
                style={{ color: "#E15A2C" }}
              >
                {request.email}
              </a>
            </Field>
            <Field label="Phone">
              <a
                href={`tel:${request.phone}`}
                className="hover:underline"
                style={{ color: "#E15A2C" }}
              >
                {request.phone}
              </a>
            </Field>
          </Section>

          <Section title="Message">
            <p
              className="text-sm whitespace-pre-wrap leading-relaxed"
              style={{ color: "#5B5F6B" }}
            >
              {request.message}
            </p>
          </Section>

          <Section title="Timeline">
            <Field
              label="Received"
              value={format(request.createdAt, "d MMM yyyy, h:mm a")}
            />
            <Field
              label="Last updated"
              value={format(request.updatedAt, "d MMM yyyy, h:mm a")}
            />
          </Section>
        </div>

        {/* Right: action panel */}
        <div className="space-y-4">
          {/* Status */}
          <Panel title="Status">
            <StatusSelect
              currentStatus={request.status}
              requestId={request.id}
              entityType="ContactRequest"
              updateAction={updateRequestStatus}
              canUpdate={canUpdate}
            />
          </Panel>

          {/* Assigned to */}
          <Panel title="Assigned To">
            <AssigneeSelect
              currentAssigneeId={request.assignedToId}
              requestId={request.id}
              entityType="ContactRequest"
              staffOptions={staffOptions}
              updateAction={assignRequest}
              canUpdate={canUpdate}
            />
          </Panel>

          {/* Notes */}
          <Panel title="Internal Notes">
            {canUpdate && (
              <div className="mb-4">
                <AddNoteForm
                  requestId={request.id}
                  entityType="ContactRequest"
                  addNoteAction={addNote}
                />
              </div>
            )}
            <NotesList notes={request.notes} />
          </Panel>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl border bg-white shadow-sm overflow-hidden"
      style={{ borderColor: "#E4E5E8" }}
    >
      <div
        className="px-5 py-3 border-b"
        style={{ borderColor: "#E4E5E8", backgroundColor: "#F9FAFB" }}
      >
        <h2
          className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: "#5B5F6B" }}
        >
          {title}
        </h2>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline gap-4 py-1.5 border-b last:border-b-0 text-sm"
      style={{ borderColor: "#F3F4F6" }}
    >
      <span
        className="w-32 shrink-0 font-medium"
        style={{ color: "#9CA3AF" }}
      >
        {label}
      </span>
      <span style={{ color: "#13151A" }}>{children ?? value ?? "—"}</span>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl border bg-white shadow-sm overflow-hidden"
      style={{ borderColor: "#E4E5E8" }}
    >
      <div
        className="px-4 py-3 border-b"
        style={{ borderColor: "#E4E5E8", backgroundColor: "#F9FAFB" }}
      >
        <h2
          className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: "#5B5F6B" }}
        >
          {title}
        </h2>
      </div>
      <div className="px-4 py-4">{children}</div>
    </div>
  );
}
