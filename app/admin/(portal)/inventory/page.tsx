import type { Metadata } from "next";
import Link from "next/link";
import { requirePermission } from "../../../lib/auth-helpers";
import { hasPermission } from "../../../lib/permissions";
import { prisma } from "../../../lib/prisma";
import { format } from "date-fns";
import { Package, Plus, MapPin } from "lucide-react";
import type { VehicleStatus } from "@prisma/client";

export const metadata: Metadata = {
  title: "Inventory — Northbridge Motors Staff Portal",
};

const STATUS_CONFIG: Record<VehicleStatus, { label: string; bg: string; text: string; border: string }> = {
  AVAILABLE: { label: "Available", bg: "#DCFCE7", text: "#15803D", border: "#86EFAC" },
  PENDING:   { label: "Pending",   bg: "#FEF9C3", text: "#854D0E", border: "#FDE047" },
  SOLD:      { label: "Sold",      bg: "#F3F4F6", text: "#374151", border: "#D1D5DB" },
  ARCHIVED:  { label: "Archived",  bg: "#F3F4F6", text: "#9CA3AF", border: "#E5E7EB" },
};

const PAGE_SIZE = 25;

interface PageProps {
  searchParams: Promise<{
    loc?: string;
    page?: string;
    q?: string;
    status?: string;
  }>;
}

export default async function InventoryPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const session = await requirePermission("inventory.view");

  const permissions = session.user.role.permissions;
  const hasViewAll = hasPermission(permissions, "locations.viewall");
  const userLocationIds = session.user.locations.map((l) => l.id);

  const activeLoc = sp.loc && sp.loc !== "all" ? sp.loc : undefined;
  const locationFilter = activeLoc
    ? { in: [activeLoc] }
    : hasViewAll
    ? undefined
    : { in: userLocationIds };

  const page = Math.max(1, parseInt(sp.page ?? "1", 10));
  const q = sp.q?.trim() ?? "";
  const statusFilter = sp.status as VehicleStatus | undefined;

  const where = {
    ...(locationFilter ? { locationId: locationFilter } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(q
      ? {
          OR: [
            { make: { contains: q, mode: "insensitive" as const } },
            { model: { contains: q, mode: "insensitive" as const } },
            { variant: { contains: q, mode: "insensitive" as const } },
            { vin: { contains: q, mode: "insensitive" as const } },
            { colour: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [vehicles, total] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      include: { location: { select: { name: true } } },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.vehicle.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const showLocationColumn = !activeLoc;
  const canCreate = hasPermission(permissions, "inventory.create");

  function buildUrl(params: Record<string, string | undefined>) {
    const merged = { loc: sp.loc, q: sp.q, status: sp.status, page: sp.page, ...params };
    const search = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) {
      if (v && v !== "") search.set(k, v);
    }
    return `/admin/inventory?${search.toString()}`;
  }

  return (
    <div className="max-w-screen-xl">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold" style={{ color: "#13151A" }}>
            Inventory
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#5B5F6B" }}>
            {total} vehicle{total !== 1 ? "s" : ""}
          </p>
        </div>
        {canCreate && (
          <Link
            href="/admin/inventory/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white"
            style={{ backgroundColor: "#142036" }}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Vehicle
          </Link>
        )}
      </div>

      {/* Filters */}
      <form method="GET" action="/admin/inventory" className="flex flex-wrap gap-2 mb-5">
        {sp.loc && <input type="hidden" name="loc" value={sp.loc} />}
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search make, model, VIN…"
          className="rounded-lg border px-3 py-2 text-sm focus:outline-none flex-1 min-w-[200px]"
          style={{ borderColor: "#E4E5E8", color: "#13151A" }}
        />
        <select
          name="status"
          defaultValue={statusFilter ?? ""}
          className="rounded-lg border px-3 py-2 text-sm focus:outline-none"
          style={{ borderColor: "#E4E5E8", color: "#13151A" }}
        >
          <option value="">All statuses</option>
          <option value="AVAILABLE">Available</option>
          <option value="PENDING">Pending</option>
          <option value="SOLD">Sold</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{ backgroundColor: "#142036", color: "#fff" }}
        >
          Filter
        </button>
        {(q || statusFilter) && (
          <Link
            href={buildUrl({ q: undefined, status: undefined, page: undefined })}
            className="px-4 py-2 rounded-lg text-sm font-medium border"
            style={{ borderColor: "#E4E5E8", color: "#5B5F6B" }}
          >
            Clear
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden" style={{ borderColor: "#E4E5E8" }}>
        {vehicles.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="h-10 w-10 mx-auto mb-3 opacity-20" style={{ color: "#5B5F6B" }} />
            <p className="text-sm" style={{ color: "#5B5F6B" }}>
              {q || statusFilter ? "No vehicles match your filters." : "No vehicles yet. Add your first vehicle to get started."}
            </p>
            {canCreate && !q && !statusFilter && (
              <Link
                href="/admin/inventory/new"
                className="mt-3 inline-block text-sm font-medium hover:underline"
                style={{ color: "#E15A2C" }}
              >
                Add Vehicle
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid #E4E5E8", backgroundColor: "#F9FAFB" }}>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#5B5F6B" }}>Vehicle</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#5B5F6B" }}>Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#5B5F6B" }}>Odometer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#5B5F6B" }}>Status</th>
                  {showLocationColumn && (
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#5B5F6B" }}>Location</th>
                  )}
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#5B5F6B" }}>Added</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => {
                  const sc = STATUS_CONFIG[v.status];
                  return (
                    <tr
                      key={v.id}
                      style={{ borderBottom: "1px solid #F3F4F6" }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <Link href={`/admin/inventory/${v.id}`} className="block hover:underline">
                          <span className="font-semibold" style={{ color: "#13151A" }}>
                            {v.year} {v.make} {v.model}
                          </span>
                          {v.variant && (
                            <span className="ml-1" style={{ color: "#5B5F6B" }}>{v.variant}</span>
                          )}
                          <span className="block text-xs mt-0.5 font-mono" style={{ color: "#9CA3AF" }}>
                            VIN: {v.vin}
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-semibold" style={{ color: "#13151A" }}>
                        ${v.price.toLocaleString()}
                        {v.priceNote && (
                          <span className="block text-xs font-normal" style={{ color: "#9CA3AF" }}>{v.priceNote}</span>
                        )}
                      </td>
                      <td className="px-4 py-3" style={{ color: "#5B5F6B" }}>
                        {v.odometerKm.toLocaleString()} km
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border"
                          style={{ backgroundColor: sc.bg, color: sc.text, borderColor: sc.border }}
                        >
                          {sc.label}
                        </span>
                      </td>
                      {showLocationColumn && (
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1 text-xs" style={{ color: "#5B5F6B" }}>
                            <MapPin className="h-3 w-3 shrink-0" style={{ color: "#E15A2C" }} aria-hidden="true" />
                            {v.location.name}
                          </span>
                        </td>
                      )}
                      <td className="px-4 py-3 text-xs" style={{ color: "#9CA3AF" }}>
                        {format(v.createdAt, "d MMM yyyy")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm" style={{ color: "#5B5F6B" }}>
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={buildUrl({ page: String(page - 1) })}
                className="px-3 py-1.5 rounded-lg border text-sm"
                style={{ borderColor: "#E4E5E8" }}
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={buildUrl({ page: String(page + 1) })}
                className="px-3 py-1.5 rounded-lg border text-sm"
                style={{ borderColor: "#E4E5E8" }}
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
