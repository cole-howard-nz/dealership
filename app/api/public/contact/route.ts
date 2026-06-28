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

  const { name, email, phone, message, locationId } = body as Record<string, string>;

  if (!name || !email || !phone || !message || !locationId) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (name.length < 2 || name.length > 100) {
    return Response.json({ error: "Name must be 2–100 characters" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Invalid email address" }, { status: 400 });
  }
  if (message.length < 2) {
    return Response.json({ error: "Message is too short" }, { status: 400 });
  }

  const location = await prisma.location.findUnique({
    where: { id: locationId, isActive: true },
    select: { id: true },
  });
  if (!location) {
    return Response.json({ error: "Invalid location" }, { status: 400 });
  }

  const request = await prisma.contactRequest.create({
    data: { name, email, phone, message, locationId },
  });

  notifyNewRequest({
    type: "contact",
    requestId: request.id,
    locationId,
    submittedBy: name,
  }).catch(() => {});

  return Response.json({ success: true, id: request.id });
}
