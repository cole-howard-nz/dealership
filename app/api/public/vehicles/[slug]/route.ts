import { prisma } from "../../../../lib/prisma";
import { mapPrismaVehicle } from "../../../../lib/vehicleMapper";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const vehicle = await prisma.vehicle.findUnique({
    where: { slug },
    include: { location: { select: { name: true } } },
  });
  if (!vehicle || vehicle.status === "ARCHIVED") {
    return new Response("Not found", { status: 404 });
  }
  return Response.json(mapPrismaVehicle(vehicle));
}
