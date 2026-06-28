import { NextRequest } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const { name, email, phone, vehicleId, locationId,
    preferredDate, preferredTime, licenceConfirmed } = b;

  if (!name || !email || !phone || !locationId || !preferredDate || !preferredTime) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!licenceConfirmed) {
    return Response.json({ error: "Licence confirmation is required" }, { status: 400 });
  }

  const location = await prisma.location.findUnique({
    where: { id: String(locationId), isActive: true },
    select: { id: true },
  });
  if (!location) {
    return Response.json({ error: "Invalid location" }, { status: 400 });
  }

  const booking = await prisma.testDriveBooking.create({
    data: {
      name: String(name),
      email: String(email),
      phone: String(phone),
      vehicleId: vehicleId ? String(vehicleId) : null,
      locationId: String(locationId),
      preferredDate: String(preferredDate),
      preferredTime: String(preferredTime),
      licenceConfirmed: Boolean(licenceConfirmed),
    },
  });

  return Response.json({ success: true, id: booking.id });
}
