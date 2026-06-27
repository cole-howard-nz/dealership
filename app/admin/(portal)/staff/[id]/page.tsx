import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "../../../../lib/auth-helpers";
import { hasPermission } from "../../../../lib/permissions";
import { prisma } from "../../../../lib/prisma";
import { StaffDetailActions } from "../../../../components/portal/StaffDetailActions";
import {
  updateStaffRole,
  updateStaffLocations,
  deactivateStaff,
  activateStaff,
  resendInvite,
} from "../actions";
import { format, formatDistanceToNow } from "date-fns";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Staff Member — Northbridge Motors Staff Portal",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StaffDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await requirePermission("staff.view");

  const permissions = session.user.role.permissions;
  const canEdit = hasPermission(permissions, "staff.edit");
  const canDeactivate = hasPermission(permissions, "staff.deactivate");
  const canInvite = hasPermission(permissions, "staff.invite");
  const isSelf = session.user.id === id;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      role: { select: { id: true, name: true, isSystem: true } },
      locations: { include: { location: { select: { id: true, name: true } } } },
      invitedBy: { select: { name: true } },
    },
  });

  if (!user) notFound();

  const [allRoles, allLocations] = await Promise.all([
    prisma.role.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, isSystem: true } }),
    prisma.location.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  // Non-owners can't assign the Owner role
  const canAssignOwner = session.user.role.isSystem;
  const availableRoles = canAssignOwner ? allRoles : allRoles.filter((r) => !r.isSystem);

  const assignedLocationIds = user.locations.map((l) => l.locationId);

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/staff"
        className="inline-flex items-center gap-1.5 text-sm mb-5 hover:underline"
        style={{ color: "#5B5F6B" }}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Staff
      </Link>

      <div className="flex items-start gap-3 flex-wrap mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold" style={{ color: "#13151A" }}>
            {user.name}
          </h1>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <a href={`mailto:${user.email}`} className="text-sm hover:underline" style={{ color: "#5B5F6B" }}>
              {user.email}
            </a>
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: user.role.isSystem ? "#EFF6FF" : "#F3F4F6",
                color: user.role.isSystem ? "#1D4ED8" : "#374151",
              }}
            >
              {user.role.name}
            </span>
          </div>
        </div>
        <div className="ml-auto">
          {user.isActive ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
              style={{ backgroundColor: "#DCFCE7", color: "#15803D" }}>Active</span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
              style={{ backgroundColor: "#F3F4F6", color: "#9CA3AF" }}>
              {user.inviteAccepted ? "Deactivated" : "Invite pending"}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-5">
        {/* Account info */}
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden" style={{ borderColor: "#E4E5E8" }}>
          <div className="px-5 py-3 border-b" style={{ borderColor: "#E4E5E8", backgroundColor: "#F9FAFB" }}>
            <h2 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#5B5F6B" }}>Account</h2>
          </div>
          <div className="px-5 py-4">
            <Field label="Name" value={user.name} />
            <Field label="Email" value={user.email} />
            <Field label="Role" value={user.role.name} />
            <Field
              label="Locations"
              value={user.locations.length === 0 ? "None" : user.locations.map((l) => l.location.name).join(", ")}
            />
            <Field
              label="Member since"
              value={format(user.createdAt, "d MMM yyyy")}
            />
            <Field
              label="Last login"
              value={user.lastLoginAt
                ? formatDistanceToNow(user.lastLoginAt, { addSuffix: true })
                : user.inviteAccepted ? "Never logged in" : "Invite not yet accepted"}
            />
            {user.invitedBy && (
              <Field label="Invited by" value={user.invitedBy.name} />
            )}
            {isSelf && (
              <p className="mt-3 text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: "#FEF9C3", color: "#854D0E" }}>
                This is your own account. Some actions are disabled.
              </p>
            )}
          </div>
        </div>

        {/* Actions panel */}
        {(canEdit || canDeactivate || canInvite) && (
          <StaffDetailActions
            userId={user.id}
            isSelf={isSelf}
            isActive={user.isActive}
            inviteAccepted={user.inviteAccepted}
            currentRoleId={user.role.id}
            isSystemRole={user.role.isSystem}
            assignedLocationIds={assignedLocationIds}
            roles={availableRoles}
            allLocations={allLocations}
            canEdit={canEdit}
            canDeactivate={canDeactivate}
            canInvite={canInvite}
            updateRoleAction={updateStaffRole}
            updateLocationsAction={updateStaffLocations}
            deactivateAction={deactivateStaff}
            activateAction={activateStaff}
            resendInviteAction={resendInvite}
          />
        )}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-4 py-1.5 border-b last:border-b-0 text-sm" style={{ borderColor: "#F3F4F6" }}>
      <span className="w-36 shrink-0 font-medium" style={{ color: "#9CA3AF" }}>{label}</span>
      <span style={{ color: "#13151A" }}>{value}</span>
    </div>
  );
}
