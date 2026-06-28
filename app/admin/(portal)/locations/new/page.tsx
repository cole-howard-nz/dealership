import type { Metadata } from "next";
import Link from "next/link";
import { requirePermission } from "../../../../lib/auth-helpers";
import { LocationForm } from "../../../../components/portal/LocationForm";
import { createLocation } from "../actions";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Add Location — Northbridge Motors Staff Portal",
};

export default async function NewLocationPage() {
  await requirePermission("locations.manage");

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/admin/locations" className="inline-flex items-center gap-1.5 text-sm mb-5 hover:underline"
        style={{ color: "#5B5F6B" }}>
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Locations
      </Link>

      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold" style={{ color: "#13151A" }}>Add Location</h1>
        <p className="text-sm mt-1" style={{ color: "#5B5F6B" }}>
          Add a new dealership location.
        </p>
      </div>

      <LocationForm action={createLocation} cancelHref="/admin/locations" mode="create" />
    </div>
  );
}
