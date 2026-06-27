import type { Metadata } from "next";
import Link from "next/link";
import { requirePermission } from "../../../../lib/auth-helpers";
import { prisma } from "../../../../lib/prisma";
import { StaffInviteForm } from "../../../../components/portal/StaffInviteForm";
import { inviteStaff } from "../actions";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Invite Staff — Northbridge Motors Staff Portal",
};

export default async function StaffInvitePage() {
  const session = await requirePermission("staff.invite");

  const [roles, locations] = await Promise.all([
    prisma.role.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, isSystem: true } }),
    prisma.location.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  // Non-owners can't assign the Owner (system) role
  const canAssignOwner = session.user.role.isSystem;
  const availableRoles = canAssignOwner ? roles : roles.filter((r) => !r.isSystem);

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/staff"
        className="inline-flex items-center gap-1.5 text-sm mb-5 hover:underline"
        style={{ color: "#5B5F6B" }}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Staff
      </Link>

      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold" style={{ color: "#13151A" }}>
          Invite Staff Member
        </h1>
        <p className="text-sm mt-1" style={{ color: "#5B5F6B" }}>
          An invite link will be generated that the new team member can use to set their password and access the portal.
        </p>
      </div>

      <StaffInviteForm action={inviteStaff} roles={availableRoles} locations={locations} />
    </div>
  );
}
