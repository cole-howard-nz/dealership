import { NextRequest } from "next/server";
import { auth } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const loc = searchParams.get("loc"); // specific locationId or "all"

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      role: { select: { permissions: true } },
      locations: { select: { locationId: true } },
    },
  });

  if (!user) {
    return Response.json({ contact: 0, tradein: 0, finance: 0 });
  }

  const canViewAll = user.role.permissions.includes("locations.viewall");
  const assignedIds = user.locations.map((l) => l.locationId);

  // Determine which locations to count for
  let locationFilter: { locationId?: string | { in: string[] } } = {};
  if (loc && loc !== "all") {
    // Specific location — allow if user is assigned or has viewall
    if (canViewAll || assignedIds.includes(loc)) {
      locationFilter = { locationId: loc };
    } else {
      locationFilter = { locationId: { in: assignedIds } };
    }
  } else if (!canViewAll) {
    locationFilter = { locationId: { in: assignedIds } };
  }
  // canViewAll + loc "all" → no filter = see everything

  const [contact, tradein, finance, testdrive] = await Promise.all([
    prisma.contactRequest.count({ where: { ...locationFilter, status: "NEW" } }),
    prisma.tradeInRequest.count({ where: { ...locationFilter, status: "NEW" } }),
    prisma.financeApplication.count({ where: { ...locationFilter, status: "NEW" } }),
    prisma.testDriveBooking.count({ where: { ...locationFilter, status: "NEW" } }),
  ]);

  return Response.json({ contact, tradein, finance, testdrive });
}
