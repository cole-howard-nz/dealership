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
  const { fullName, email, phone, dateOfBirth, address, employmentStatus,
    employerName, monthlyIncome, timeInRoleMonths, vehicleId, desiredLoanAmount,
    depositAmount, termMonths, hasTradeIn, creditCheckConsent, termsAccepted,
    locationId } = b;

  if (!fullName || !email || !phone || !dateOfBirth || !address ||
      !employmentStatus || !monthlyIncome || !desiredLoanAmount ||
      !creditCheckConsent || !termsAccepted || !locationId) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const location = await prisma.location.findUnique({
    where: { id: String(locationId), isActive: true },
    select: { id: true },
  });
  if (!location) {
    return Response.json({ error: "Invalid location" }, { status: 400 });
  }

  const application = await prisma.financeApplication.create({
    data: {
      fullName: String(fullName),
      email: String(email),
      phone: String(phone),
      dateOfBirth: new Date(String(dateOfBirth)),
      address: String(address),
      employmentStatus: String(employmentStatus),
      employerName: employerName ? String(employerName) : null,
      monthlyIncome: Number(monthlyIncome),
      timeInRoleMonths: Number(timeInRoleMonths ?? 0),
      vehicleId: vehicleId ? String(vehicleId) : null,
      desiredLoanAmount: Number(desiredLoanAmount),
      depositAmount: Number(depositAmount ?? 0),
      termMonths: Number(termMonths ?? 60),
      hasTradeIn: Boolean(hasTradeIn),
      creditCheckConsent: Boolean(creditCheckConsent),
      termsAccepted: Boolean(termsAccepted),
      locationId: String(locationId),
    },
  });

  notifyNewRequest({
    type: "finance",
    requestId: application.id,
    locationId: String(locationId),
    submittedBy: String(fullName),
  }).catch(() => {});

  return Response.json({ success: true, id: application.id });
}
