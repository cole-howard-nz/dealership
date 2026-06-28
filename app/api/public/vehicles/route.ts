import { prisma } from "../../../lib/prisma";
import { mapPrismaVehicle } from "../../../lib/vehicleMapper";

export async function GET() {
  const raw = await prisma.vehicle.findMany({
    where: { status: { in: ["AVAILABLE", "PENDING"] } },
    include: { location: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(raw.map(mapPrismaVehicle));
}
