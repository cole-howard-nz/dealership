import type { Metadata } from "next";
import Link from "next/link";
import { requirePermission } from "../../../lib/auth-helpers";
import { prisma } from "../../../lib/prisma";
import { Plus, Shield } from "lucide-react";
import { DeleteRoleButton } from "../../../components/portal/DeleteRoleButton";
import { deleteRole } from "./actions";

export const metadata: Metadata = {
  title: "Roles — Northbridge Motors Staff Portal",
};

export default async function RolesPage() {
  await requirePermission("staff.roles");

  const roles = await prisma.role.findMany({
    orderBy: [{ isSystem: "desc" }, { name: "asc" }],
    include: { _count: { select: { users: true } } },
  });

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold" style={{ color: "#13151A" }}>Roles</h1>
          <p className="text-sm mt-0.5" style={{ color: "#5B5F6B" }}>
            {roles.length} role{roles.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/roles/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white"
          style={{ backgroundColor: "#142036" }}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Create Role
        </Link>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden" style={{ borderColor: "#E4E5E8" }}>
        {roles.length === 0 ? (
          <div className="py-16 text-center">
            <Shield className="h-10 w-10 mx-auto mb-3 opacity-20" style={{ color: "#5B5F6B" }} />
            <p className="text-sm" style={{ color: "#5B5F6B" }}>No roles yet.</p>
          </div>
        ) : (
          <div>
            {roles.map((role, i) => (
              <div
                key={role.id}
                className="flex items-center gap-4 px-5 py-4"
                style={{ borderBottom: i < roles.length - 1 ? "1px solid #F3F4F6" : "none" }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={role.isSystem ? "#" : `/admin/roles/${role.id}`}
                      className={`font-semibold text-sm ${role.isSystem ? "cursor-default" : "hover:underline"}`}
                      style={{ color: "#13151A" }}
                    >
                      {role.name}
                    </Link>
                    {role.isSystem && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ backgroundColor: "#EFF6FF", color: "#1D4ED8" }}>
                        <Shield className="h-3 w-3" aria-hidden="true" />
                        System
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>
                    {role._count.users} user{role._count.users !== 1 ? "s" : ""} ·{" "}
                    {role.permissions.length} permission{role.permissions.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!role.isSystem && (
                    <>
                      <Link
                        href={`/admin/roles/${role.id}`}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium border hover:bg-gray-50"
                        style={{ borderColor: "#E4E5E8", color: "#5B5F6B" }}
                      >
                        Edit
                      </Link>
                      <DeleteRoleButton
                        roleId={role.id}
                        roleName={role.name}
                        userCount={role._count.users}
                        deleteAction={deleteRole}
                      />
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
