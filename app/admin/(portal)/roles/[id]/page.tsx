import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "../../../../lib/auth-helpers";
import { prisma } from "../../../../lib/prisma";
import { RoleFormSubmit } from "../../../../components/portal/RoleFormSubmit";
import { updateRole } from "../actions";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Edit Role — Northbridge Motors Staff Portal",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RoleEditPage({ params }: PageProps) {
  const { id } = await params;
  await requirePermission("staff.roles");

  const role = await prisma.role.findUnique({
    where: { id },
    include: { _count: { select: { users: true } } },
  });

  if (!role) notFound();

  const updateAction = updateRole.bind(null, id);

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/admin/roles" className="inline-flex items-center gap-1.5 text-sm mb-5 hover:underline"
        style={{ color: "#5B5F6B" }}>
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Roles
      </Link>

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div>
          <h1 className="font-heading text-2xl font-bold" style={{ color: "#13151A" }}>
            {role.isSystem ? role.name : `Edit: ${role.name}`}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#5B5F6B" }}>
            {role._count.users} user{role._count.users !== 1 ? "s" : ""} assigned
          </p>
        </div>
        {role.isSystem && (
          <span className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ backgroundColor: "#EFF6FF", color: "#1D4ED8" }}>
            <Shield className="h-3.5 w-3.5" aria-hidden="true" />
            System Role — Read Only
          </span>
        )}
      </div>

      {role.isSystem ? (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#E4E5E8" }}>
          <div className="px-5 py-3 border-b" style={{ borderColor: "#E4E5E8", backgroundColor: "#F9FAFB" }}>
            <h2 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#5B5F6B" }}>
              Permissions (Owner has all)
            </h2>
          </div>
          <div className="px-5 py-4">
            <RoleFormSubmit
              action={updateAction}
              defaultName={role.name}
              defaultPermissions={role.permissions}
              cancelHref="/admin/roles"
              disabled={true}
            />
          </div>
        </div>
      ) : (
        <RoleFormSubmit
          action={updateAction}
          defaultName={role.name}
          defaultPermissions={role.permissions}
          cancelHref="/admin/roles"
        />
      )}
    </div>
  );
}
