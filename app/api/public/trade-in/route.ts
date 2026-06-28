import { NextRequest } from "next/server";
import { prisma } from "../../../lib/prisma";
import { notifyNewRequest } from "../../../lib/notifications";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const { name, email, phone, preferredContact, vehicleMake, vehicleModel,
    vehicleYear, plateNumber, odometerKm, condition, isModified,
    modifications, vehicleDescription, outstandingFinance, locationId } = b;

  if (!name || !email || !phone || !vehicleMake || !vehicleModel ||
      !vehicleYear || !odometerKm || !condition || !locationId) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const location = await prisma.location.findUnique({
    where: { id: String(locationId), isActive: true },
    select: { id: true },
  });
  if (!location) {
    return Response.json({ error: "Invalid location" }, { status: 400 });
  }

  const request = await prisma.tradeInRequest.create({
    data: {
      name: String(name),
      email: String(email),
      phone: String(phone),
      preferredContact: String(preferredContact ?? "Phone"),
      vehicleMake: String(vehicleMake),
      vehicleModel: String(vehicleModel),
      vehicleYear: Number(vehicleYear),
      plateNumber: plateNumber ? String(plateNumber) : null,
      odometerKm: Number(odometerKm),
      condition: String(condition),
      isModified: Boolean(isModified),
      modifications: Array.isArray(modifications) ? (modifications as string[]) : [],
      vehicleDescription: vehicleDescription ? String(vehicleDescription) : null,
      outstandingFinance: Boolean(outstandingFinance),
      locationId: String(locationId),
    },
  });

  notifyNewRequest({
    type: "tradein",
    requestId: request.id,
    locationId: String(locationId),
    submittedBy: String(name),
  }).catch(() => {});

  return Response.json({ success: true, id: request.id });
}
