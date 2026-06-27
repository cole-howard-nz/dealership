import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "../../../../lib/auth-helpers";
import { prisma } from "../../../../lib/prisma";
import { LocationForm } from "../../../../components/portal/LocationForm";
import { LocationToggleButton } from "../../../../components/portal/LocationToggleButton";
import { updateLocation, deactivateLocation, activateLocation } from "../actions";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Edit Location — Northbridge Motors Staff Portal",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LocationEditPage({ params }: PageProps) {
  const { id } = await params;
  await requirePermission("locations.manage");

  const location = await prisma.location.findUnique({
    where: { id },
    include: {
      _count: { select: { users: true, vehicles: true, contactRequests: true } },
    },
  });

  if (!location) notFound();

  const updateAction = updateLocation.bind(null, id);

  return (
    <div className="max-w-2xl">
      <Link href="/admin/locations" className="inline-flex items-center gap-1.5 text-sm mb-5 hover:underline"
        style={{ color: "#5B5F6B" }}>
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Locations
      </Link>

      <div className="flex items-start gap-3 mb-6 flex-wrap">
        <div>
          <h1 className="font-heading text-2xl font-bold" style={{ color: "#13151A" }}>{location.name}</h1>
          <p className="text-sm mt-0.5" style={{ color: "#5B5F6B" }}>
            {location._count.users} staff · {location._count.vehicles} vehicles
          </p>
        </div>
        {!location.isActive && (
          <span className="ml-auto inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: "#F3F4F6", color: "#9CA3AF" }}>
            Inactive
          </span>
        )}
      </div>

      <div className="space-y-5">
        <LocationForm
          action={updateAction}
          defaultValues={{
            name: location.name,
            address: location.address,
            phone: location.phone,
            email: location.email,
          }}
          cancelHref="/admin/locations"
          mode="edit"
        />

        {/* Activate / Deactivate */}
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden" style={{ borderColor: "#E4E5E8" }}>
          <div className="px-5 py-3 border-b" style={{ borderColor: "#E4E5E8", backgroundColor: "#F9FAFB" }}>
            <h2 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#5B5F6B" }}>
              {location.isActive ? "Deactivate Location" : "Activate Location"}
            </h2>
          </div>
          <div className="px-5 py-4">
            <p className="text-sm mb-4" style={{ color: "#5B5F6B" }}>
              {location.isActive
                ? "Deactivating hides this location from new location selectors. Existing data is preserved."
                : "Reactivate this location to make it available for staff and inventory assignments."}
            </p>
            <LocationToggleButton
              locationId={id}
              isActive={location.isActive}
              deactivateAction={deactivateLocation}
              activateAction={activateLocation}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
