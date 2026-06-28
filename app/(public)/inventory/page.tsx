import { prisma } from "../../lib/prisma";
import { mapPrismaVehicle } from "../../lib/vehicleMapper";
import { InventoryContent } from "./InventoryContent";

export default async function InventoryPage() {
  const raw = await prisma.vehicle.findMany({
    where: { status: { in: ["AVAILABLE", "PENDING"] } },
    include: { location: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const vehicles = raw.map(mapPrismaVehicle);
  const makes = [...new Set(vehicles.map((v) => v.make))].sort();

  return <InventoryContent vehicles={vehicles} makes={makes} />;
}
