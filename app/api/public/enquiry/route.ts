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
  const { vehicleId, name, email, phone, message, enquiryType,
    preferredContactMethod } = b;

  if (!name || !email || !phone) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Determine locationId from vehicle, or fall back to first active location
  let locationId: string | null = null;
  if (vehicleId) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: String(vehicleId) },
      select: { locationId: true },
    });
    locationId = vehicle?.locationId ?? null;
  }
  if (!locationId) {
    const fallback = await prisma.location.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });
    locationId = fallback?.id ?? null;
  }
  if (!locationId) {
    return Response.json({ error: "No active location found" }, { status: 500 });
  }

  // Build message body including vehicle and enquiry type context
  const vehicleLabel = vehicleId
    ? await prisma.vehicle.findUnique({ where: { id: String(vehicleId) }, select: { make: true, model: true, year: true } })
        .then((v) => v ? `${v.year} ${v.make} ${v.model}` : null)
    : null;
  const messageBody = [
    enquiryType ? `Enquiry type: ${enquiryType}` : null,
    vehicleLabel ? `Vehicle: ${vehicleLabel}` : null,
    preferredContactMethod ? `Preferred contact: ${preferredContactMethod}` : null,
    message ? String(message) : null,
  ].filter(Boolean).join("\n");

  const request = await prisma.contactRequest.create({
    data: {
      name: String(name),
      email: String(email),
      phone: String(phone),
      message: messageBody || "Vehicle enquiry",
      locationId,
    },
  });

  notifyNewRequest({
    type: "contact",
    requestId: request.id,
    locationId,
    submittedBy: String(name),
  }).catch(() => {});

  return Response.json({ success: true, id: request.id });
}
