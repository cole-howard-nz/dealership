import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "../../../../lib/auth-helpers";
import { hasPermission } from "../../../../lib/permissions";
import { prisma } from "../../../../lib/prisma";
import { VehicleForm } from "../../../../components/portal/VehicleForm";
import { VehicleStatusWidget } from "../../../../components/portal/VehicleStatusWidget";
import { updateVehicle, updateVehicleStatus } from "../actions";
import { format, formatDistanceToNow } from "date-fns";
import { ArrowLeft, MapPin, ExternalLink } from "lucide-react";
import type { VehicleStatus } from "@prisma/client";

export const metadata: Metadata = {
  title: "Vehicle Detail — Northbridge Motors Staff Portal",
};

const STATUS_CONFIG: Record<VehicleStatus, { label: string; bg: string; text: string; border: string }> = {
  AVAILABLE: { label: "Available", bg: "#DCFCE7", text: "#15803D", border: "#86EFAC" },
  PENDING:   { label: "Pending",   bg: "#FEF9C3", text: "#854D0E", border: "#FDE047" },
  SOLD:      { label: "Sold",      bg: "#F3F4F6", text: "#374151", border: "#D1D5DB" },
  ARCHIVED:  { label: "Archived",  bg: "#F3F4F6", text: "#9CA3AF", border: "#E5E7EB" },
};

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}

export default async function VehicleDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { edit } = await searchParams;
  const session = await requirePermission("inventory.view");

  const permissions = session.user.role.permissions;
  const canEdit = hasPermission(permissions, "inventory.edit");
  const hasViewAll = hasPermission(permissions, "locations.viewall");
  const userLocationIds = session.user.locations.map((l) => l.id);

  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: { location: { select: { id: true, name: true } } },
  });

  if (!vehicle) notFound();
  if (!hasViewAll && !userLocationIds.includes(vehicle.locationId)) notFound();

  const isEditing = edit === "1" && canEdit;

  const locations = isEditing
    ? await prisma.location.findMany({
        where: { isActive: true, ...(hasViewAll ? {} : { id: { in: userLocationIds } }) },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      })
    : [];

  const images = Array.isArray(vehicle.images)
    ? (vehicle.images as Array<{ url: string; alt: string; order: number }>)
    : [];

  const sc = STATUS_CONFIG[vehicle.status];
  const updateAction = updateVehicle.bind(null, id);

  return (
    <div>
      <Link
        href="/admin/inventory"
        className="inline-flex items-center gap-1.5 text-sm mb-5 hover:underline"
        style={{ color: "#5B5F6B" }}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Inventory
      </Link>

      <div className="flex items-start gap-3 flex-wrap mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold" style={{ color: "#13151A" }}>
            {vehicle.year} {vehicle.make} {vehicle.model}
            {vehicle.variant && (
              <span className="ml-2 font-normal text-xl" style={{ color: "#5B5F6B" }}>{vehicle.variant}</span>
            )}
          </h1>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="flex items-center gap-1 text-sm" style={{ color: "#5B5F6B" }}>
              <MapPin className="h-3.5 w-3.5" style={{ color: "#E15A2C" }} aria-hidden="true" />
              {vehicle.location.name}
            </span>
            <span className="text-xs font-mono" style={{ color: "#9CA3AF" }}>VIN: {vehicle.vin}</span>
            <span className="text-sm" style={{ color: "#9CA3AF" }}>
              Added {formatDistanceToNow(vehicle.createdAt, { addSuffix: true })}
            </span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border"
            style={{ backgroundColor: sc.bg, color: sc.text, borderColor: sc.border }}
          >
            {sc.label}
          </span>
          {canEdit && !isEditing && (
            <Link
              href={`/admin/inventory/${id}?edit=1`}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ backgroundColor: "#142036" }}
            >
              Edit
            </Link>
          )}
        </div>
      </div>

      {isEditing ? (
        <VehicleForm
          action={updateAction}
          defaultValues={{
            make: vehicle.make,
            model: vehicle.model,
            variant: vehicle.variant ?? undefined,
            year: vehicle.year,
            bodyType: vehicle.bodyType,
            price: vehicle.price,
            priceNote: vehicle.priceNote ?? undefined,
            odometerKm: vehicle.odometerKm,
            transmission: vehicle.transmission,
            fuelType: vehicle.fuelType,
            engineSizeCc: vehicle.engineSizeCc,
            driveType: vehicle.driveType,
            colour: vehicle.colour,
            doors: vehicle.doors,
            seats: vehicle.seats,
            vin: vehicle.vin,
            importStatus: vehicle.importStatus,
            condition: vehicle.condition,
            features: vehicle.features,
            images,
            description: vehicle.description,
            status: vehicle.status,
            financeEligible: vehicle.financeEligible,
            inspectionReportUrl: vehicle.inspectionReportUrl,
            locationId: vehicle.locationId,
          }}
          locations={locations}
          mode="edit"
          cancelHref={`/admin/inventory/${id}`}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: details */}
          <div className="lg:col-span-2 space-y-5">
            {/* Images */}
            {images.length > 0 && (
              <div className="rounded-xl border bg-white shadow-sm overflow-hidden" style={{ borderColor: "#E4E5E8" }}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 p-1">
                  {images.slice(0, 6).map((img) => (
                    <div key={img.order} className="aspect-[4/3] bg-gray-100 rounded overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Section title="Vehicle Details">
              <Field label="Make / Model" value={`${vehicle.make} ${vehicle.model}${vehicle.variant ? ` ${vehicle.variant}` : ""}`} />
              <Field label="Year" value={String(vehicle.year)} />
              <Field label="Body Type" value={vehicle.bodyType} />
              <Field label="Colour" value={vehicle.colour} />
              <Field label="Condition" value={vehicle.condition} />
              <Field label="Import Status" value={vehicle.importStatus} />
              {vehicle.doors && <Field label="Doors" value={String(vehicle.doors)} />}
              {vehicle.seats && <Field label="Seats" value={String(vehicle.seats)} />}
            </Section>

            <Section title="Drivetrain">
              <Field label="Transmission" value={vehicle.transmission} />
              <Field label="Fuel Type" value={vehicle.fuelType} />
              <Field label="Drive Type" value={vehicle.driveType} />
              {vehicle.engineSizeCc && (
                <Field label="Engine Size" value={`${vehicle.engineSizeCc.toLocaleString()} cc`} />
              )}
              <Field label="Odometer" value={`${vehicle.odometerKm.toLocaleString()} km`} />
            </Section>

            {vehicle.features.length > 0 && (
              <Section title="Features">
                <div className="flex flex-wrap gap-2 py-2">
                  {vehicle.features.map((f) => (
                    <span
                      key={f}
                      className="px-2.5 py-1 rounded-full text-xs font-medium border"
                      style={{ borderColor: "#E4E5E8", color: "#5B5F6B", backgroundColor: "#F9FAFB" }}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            <Section title="Description">
              <p className="text-sm whitespace-pre-wrap leading-relaxed py-2" style={{ color: "#5B5F6B" }}>
                {vehicle.description}
              </p>
            </Section>

            <Section title="Timeline">
              <Field label="Added" value={format(vehicle.createdAt, "d MMM yyyy, h:mm a")} />
              <Field label="Last updated" value={format(vehicle.updatedAt, "d MMM yyyy, h:mm a")} />
            </Section>
          </div>

          {/* Right: actions */}
          <div className="space-y-4">
            <Panel title="Pricing">
              <div className="text-2xl font-bold font-heading mb-1" style={{ color: "#13151A" }}>
                ${vehicle.price.toLocaleString()}
              </div>
              {vehicle.priceNote && (
                <p className="text-sm" style={{ color: "#5B5F6B" }}>{vehicle.priceNote}</p>
              )}
              <p className="text-sm mt-1" style={{ color: vehicle.financeEligible ? "#15803D" : "#9CA3AF" }}>
                {vehicle.financeEligible ? "Finance eligible" : "Not finance eligible"}
              </p>
            </Panel>

            <Panel title="Status">
              <VehicleStatusWidget
                vehicleId={id}
                currentStatus={vehicle.status}
                canEdit={canEdit}
                canSold={hasPermission(permissions, "inventory.sold")}
                canArchive={hasPermission(permissions, "inventory.archive")}
                updateAction={updateVehicleStatus}
              />
            </Panel>

            {vehicle.inspectionReportUrl && (
              <Panel title="Inspection Report">
                <a
                  href={vehicle.inspectionReportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
                  style={{ color: "#E15A2C" }}
                >
                  View Report
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </Panel>
            )}

            <Panel title="Location">
              <p className="text-sm flex items-center gap-1.5" style={{ color: "#13151A" }}>
                <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color: "#E15A2C" }} aria-hidden="true" />
                {vehicle.location.name}
              </p>
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden" style={{ borderColor: "#E4E5E8" }}>
      <div className="px-5 py-3 border-b" style={{ borderColor: "#E4E5E8", backgroundColor: "#F9FAFB" }}>
        <h2 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#5B5F6B" }}>{title}</h2>
      </div>
      <div className="px-5 py-4">{children}</div>
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

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden" style={{ borderColor: "#E4E5E8" }}>
      <div className="px-4 py-3 border-b" style={{ borderColor: "#E4E5E8", backgroundColor: "#F9FAFB" }}>
        <h2 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#5B5F6B" }}>{title}</h2>
      </div>
      <div className="px-4 py-4">{children}</div>
    </div>
  );
}
