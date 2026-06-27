import type { Metadata } from "next";
import Link from "next/link";
import { requirePermission } from "../../../../lib/auth-helpers";
import { RoleFormSubmit } from "../../../../components/portal/RoleFormSubmit";
import { createRole } from "../actions";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Create Role — Northbridge Motors Staff Portal",
};

export default async function NewRolePage() {
  await requirePermission("staff.roles");

  return (
    <div className="max-w-3xl">
      <Link href="/admin/roles" className="inline-flex items-center gap-1.5 text-sm mb-5 hover:underline"
        style={{ color: "#5B5F6B" }}>
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Roles
      </Link>

      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold" style={{ color: "#13151A" }}>Create Role</h1>
        <p className="text-sm mt-1" style={{ color: "#5B5F6B" }}>
          Define a new role with a custom set of permissions.
        </p>
      </div>

      <RoleFormSubmit action={createRole} defaultName="" defaultPermissions={[]} cancelHref="/admin/roles" />
    </div>
  );
}
