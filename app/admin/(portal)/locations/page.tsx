import type { Metadata } from "next";
import Link from "next/link";
import { requirePermission } from "../../../lib/auth-helpers";
import { prisma } from "../../../lib/prisma";
import { Plus, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Locations — Northbridge Motors Staff Portal",
};

export default async function LocationsPage() {
  await requirePermission("locations.manage");

  const locations = await prisma.location.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    include: {
      _count: { select: { users: true, vehicles: true, contactRequests: true } },
    },
  });

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold" style={{ color: "#13151A" }}>Locations</h1>
          <p className="text-sm mt-0.5" style={{ color: "#5B5F6B" }}>
            {locations.length} location{locations.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/locations/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white"
          style={{ backgroundColor: "#142036" }}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Location
        </Link>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden" style={{ borderColor: "#E4E5E8" }}>
        {locations.length === 0 ? (
          <div className="py-16 text-center">
            <MapPin className="h-10 w-10 mx-auto mb-3 opacity-20" style={{ color: "#5B5F6B" }} />
            <p className="text-sm" style={{ color: "#5B5F6B" }}>No locations yet.</p>
          </div>
        ) : (
          <div>
            {locations.map((loc, i) => (
              <div
                key={loc.id}
                className="flex items-center gap-4 px-5 py-4"
                style={{ borderBottom: i < locations.length - 1 ? "1px solid #F3F4F6" : "none" }}
              >
                <div
                  className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: loc.isActive ? "#E15A2C15" : "#F3F4F6" }}
                >
                  <MapPin className="h-4 w-4" style={{ color: loc.isActive ? "#E15A2C" : "#9CA3AF" }} aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/locations/${loc.id}`}
                      className="font-semibold text-sm hover:underline"
                      style={{ color: "#13151A" }}
                    >
                      {loc.name}
                    </Link>
                    {!loc.isActive && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ backgroundColor: "#F3F4F6", color: "#9CA3AF" }}>
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>
                    {loc.address ?? "No address"} ·{" "}
                    {loc._count.users} staff · {loc._count.vehicles} vehicles
                  </p>
                </div>
                <Link
                  href={`/admin/locations/${loc.id}`}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border hover:bg-gray-50 shrink-0"
                  style={{ borderColor: "#E4E5E8", color: "#5B5F6B" }}
                >
                  Edit
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
