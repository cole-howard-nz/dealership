import { prisma } from "../lib/prisma";
import { mapPrismaVehicle } from "../lib/vehicleMapper";
import { HomePage } from "../pages/HomePage";
import { ShortlistProvider } from "../hooks/useShortlist";

export default async function Home() {
  const rawVehicles = await prisma.vehicle.findMany({
    where: { status: "AVAILABLE" },
    include: { location: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const vehicles = rawVehicles.map(mapPrismaVehicle);
  const jdmFeatured = vehicles.filter((v) => v.bodyType === "Performance").slice(0, 3);
  const allFeatured = vehicles.slice(0, 6);

  return (
    <ShortlistProvider>
      <HomePage jdmFeatured={jdmFeatured} allFeatured={allFeatured} />
    </ShortlistProvider>
  );
}
