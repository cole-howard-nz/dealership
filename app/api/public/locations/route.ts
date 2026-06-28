import { prisma } from "../../../lib/prisma";

export async function GET() {
  const locations = await prisma.location.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return Response.json(locations);
}
