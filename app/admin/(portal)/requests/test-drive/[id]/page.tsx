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
import { ArrowLeft, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Test Drive Booking — Northbridge Motors Staff Portal",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TestDriveDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await requirePermission("testdrive.view");

  const permissions = session.user.role.permissions;
  const canUpdate = hasPermission(permissions, "testdrive.update");
  const hasViewAll = hasPermission(permissions, "locations.viewall");
  const userLocationIds = session.user.locations.map((l) => l.id);

  const booking = await prisma.testDriveBooking.findUnique({
    where: { id },
    include: {
      location: { select: { id: true, name: true } },
      vehicle: { select: { id: true, slug: true, year: true, make: true, model: true } },
      assignedTo: { select: { id: true, name: true } },
      notes: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          body: true,
          authorId: true,
          createdAt: true,
          author: { select: { name: true } },
        },
      },
    },
  });

  if (!booking) notFound();
  if (!hasViewAll && !userLocationIds.includes(booking.locationId)) notFound();

  const staffOptions = await prisma.user.findMany({
    where: {
      isActive: true,
      locations: { some: { locationId: booking.locationId } },
    },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const shortId = id.slice(-6).toUpperCase();

  return (
    <div>
      <Link
        href="/admin/requests/test-drive"
        className="inline-flex items-center gap-1.5 text-sm mb-5 hover:underline"
        style={{ color: "#5B5F6B" }}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Test Drive Bookings
      </Link>

      <div className="mb-6">
        <div className="flex items-start gap-3 flex-wrap">
          <div>
            <h1 className="font-heading text-2xl font-bold" style={{ color: "#13151A" }}>
              TD-{shortId} · {booking.name}
            </h1>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="flex items-center gap-1 text-sm" style={{ color: "#5B5F6B" }}>
                <MapPin className="h-3.5 w-3.5" style={{ color: "#E15A2C" }} aria-hidden="true" />
                {booking.location.name}
              </span>
              <span className="text-sm" style={{ color: "#9CA3AF" }}>
                Received {formatDistanceToNow(booking.createdAt, { addSuffix: true })}
              </span>
            </div>
          </div>
          <div className="ml-auto">
            <StatusBadge status={booking.status} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <Section title="Contact Details">
            <Field label="Name" value={booking.name} />
            <Field label="Email">
              <a href={`mailto:${booking.email}`} className="hover:underline" style={{ color: "#E15A2C" }}>
                {booking.email}
              </a>
            </Field>
            <Field label="Phone">
              <a href={`tel:${booking.phone}`} className="hover:underline" style={{ color: "#E15A2C" }}>
                {booking.phone}
              </a>
            </Field>
          </Section>

          <Section title="Booking Details">
            <Field
              label="Vehicle"
              value={
                booking.vehicle
                  ? `${booking.vehicle.year} ${booking.vehicle.make} ${booking.vehicle.model}`
                  : "Not specified"
              }
            >
              {booking.vehicle && (
                <Link
                  href={`/admin/inventory/${booking.vehicle.id}`}
                  className="hover:underline"
                  style={{ color: "#E15A2C" }}
                >
                  {booking.vehicle.year} {booking.vehicle.make} {booking.vehicle.model}
                </Link>
              )}
            </Field>
            <Field label="Preferred Date" value={booking.preferredDate} />
            <Field label="Preferred Time" value={booking.preferredTime} />
            <Field label="Licence Confirmed" value={booking.licenceConfirmed ? "Yes" : "No"} />
          </Section>

          <Section title="Timeline">
            <Field label="Received" value={format(booking.createdAt, "d MMM yyyy, h:mm a")} />
            <Field label="Last updated" value={format(booking.updatedAt, "d MMM yyyy, h:mm a")} />
          </Section>
        </div>

        <div className="space-y-4">
          <Panel title="Status">
            <StatusSelect
              currentStatus={booking.status}
              requestId={booking.id}
              entityType="TestDriveBooking"
              updateAction={updateRequestStatus}
              canUpdate={canUpdate}
            />
          </Panel>

          <Panel title="Assigned To">
            <AssigneeSelect
              currentAssigneeId={booking.assignedToId}
              requestId={booking.id}
              entityType="TestDriveBooking"
              staffOptions={staffOptions}
              updateAction={assignRequest}
              canUpdate={canUpdate}
            />
          </Panel>

          <Panel title="Internal Notes">
            {canUpdate && (
              <div className="mb-4">
                <AddNoteForm
                  requestId={booking.id}
                  entityType="TestDriveBooking"
                  addNoteAction={addNote}
                />
              </div>
            )}
            <NotesList
              notes={booking.notes}
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
    <div
      className="flex items-baseline gap-4 py-1.5 border-b last:border-b-0 text-sm"
      style={{ borderColor: "#F3F4F6" }}
    >
      <span className="w-36 shrink-0 font-medium" style={{ color: "#9CA3AF" }}>{label}</span>
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
