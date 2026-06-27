import type { Metadata } from "next";
import Link from "next/link";
import { requirePermission } from "../../../../lib/auth-helpers";
import { hasPermission } from "../../../../lib/permissions";
import { prisma } from "../../../../lib/prisma";
import { VehicleForm } from "../../../../components/portal/VehicleForm";
import { createVehicle } from "../actions";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Add Vehicle — Northbridge Motors Staff Portal",
};

export default async function NewVehiclePage() {
  const session = await requirePermission("inventory.create");

  const hasViewAll = hasPermission(session.user.role.permissions, "locations.viewall");
  const userLocationIds = session.user.locations.map((l) => l.id);

  const locations = await prisma.location.findMany({
    where: {
      isActive: true,
      ...(hasViewAll ? {} : { id: { in: userLocationIds } }),
    },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const defaultLocationId = userLocationIds[0] ?? locations[0]?.id ?? "";

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/inventory"
        className="inline-flex items-center gap-1.5 text-sm mb-5 hover:underline"
        style={{ color: "#5B5F6B" }}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Inventory
      </Link>

      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold" style={{ color: "#13151A" }}>
          Add Vehicle
        </h1>
        <p className="text-sm mt-1" style={{ color: "#5B5F6B" }}>
          Add a new vehicle to the inventory.
        </p>
      </div>

      <VehicleForm
        action={createVehicle}
        defaultValues={{ locationId: defaultLocationId, status: "AVAILABLE", financeEligible: true }}
        locations={locations}
        mode="create"
        cancelHref="/admin/inventory"
      />
    </div>
  );
}
