import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "../../../lib/prisma";
import { mapPrismaVehicle } from "../../../lib/vehicleMapper";
import { VehicleDetailClient } from "./VehicleDetailClient";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = await prisma.vehicle.findUnique({
    where: { slug },
    select: { make: true, model: true, year: true },
  });
  if (!vehicle) return { title: "Vehicle not found" };
  return { title: `${vehicle.year} ${vehicle.make} ${vehicle.model} — Northbridge Motors` };
}

export default async function VehicleDetailPage({ params }: Props) {
  const { slug } = await params;

  const raw = await prisma.vehicle.findUnique({
    where: { slug },
    include: { location: { select: { name: true } } },
  });

  if (!raw || raw.status === "ARCHIVED") {
    notFound();
  }

  const similar = await prisma.vehicle.findMany({
    where: {
      status: { in: ["AVAILABLE", "PENDING"] },
      bodyType: raw.bodyType,
      id: { not: raw.id },
    },
    include: { location: { select: { name: true } } },
    take: 2,
  });

  return (
    <VehicleDetailClient
      vehicle={mapPrismaVehicle(raw)}
      similar={similar.map(mapPrismaVehicle)}
      locationId={raw.locationId}
    />
  );
}
