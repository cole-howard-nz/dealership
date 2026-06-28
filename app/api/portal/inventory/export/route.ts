import { NextRequest } from "next/server";
import { auth } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { hasPermission } from "../../../../lib/permissions";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      role: { select: { permissions: true } },
      locations: { select: { locationId: true } },
    },
  });

  if (!user || !hasPermission(user.role.permissions, "inventory.view")) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const loc = searchParams.get("loc");

  const canViewAll = hasPermission(user.role.permissions, "locations.viewall");
  const assignedIds = user.locations.map((l) => l.locationId);

  let locationFilter: { locationId?: string | { in: string[] } } = {};
  if (loc && loc !== "all") {
    if (canViewAll || assignedIds.includes(loc)) {
      locationFilter = { locationId: loc };
    } else {
      locationFilter = { locationId: { in: assignedIds } };
    }
  } else if (!canViewAll) {
    locationFilter = { locationId: { in: assignedIds } };
  }

  const vehicles = await prisma.vehicle.findMany({
    where: {
      status: { in: ["AVAILABLE", "PENDING"] },
      ...locationFilter,
    },
    include: { location: { select: { name: true } } },
    orderBy: [{ make: "asc" }, { model: "asc" }],
  });

  // Build CSV
  const headers = [
    "Title",
    "Year",
    "Make",
    "Model",
    "Variant",
    "Body Type",
    "Price",
    "Price Note",
    "Odometer (km)",
    "Transmission",
    "Fuel Type",
    "Engine (cc)",
    "Drive Type",
    "Colour",
    "Doors",
    "Seats",
    "VIN",
    "Import Status",
    "Condition",
    "Status",
    "Finance Eligible",
    "Location",
    "Features",
    "Description",
  ];

  function esc(v: string | number | boolean | null | undefined): string {
    if (v == null) return "";
    const s = String(v);
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  }

  const rows = vehicles.map((v) => [
    esc(`${v.year} ${v.make} ${v.model}${v.variant ? ` ${v.variant}` : ""}`),
    esc(v.year),
    esc(v.make),
    esc(v.model),
    esc(v.variant),
    esc(v.bodyType),
    esc(v.price),
    esc(v.priceNote),
    esc(v.odometerKm),
    esc(v.transmission),
    esc(v.fuelType),
    esc(v.engineSizeCc),
    esc(v.driveType),
    esc(v.colour),
    esc(v.doors),
    esc(v.seats),
    esc(v.vin),
    esc(v.importStatus),
    esc(v.condition),
    esc(v.status),
    esc(v.financeEligible),
    esc(v.location.name),
    esc(v.features.join("; ")),
    esc(v.description),
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="inventory-${date}.csv"`,
    },
  });
}
