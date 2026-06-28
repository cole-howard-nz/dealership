/**
 * Notification dispatcher for new inbound requests.
 *
 * Called after a request record is created (by Phase 5 public API routes).
 * Sends to:
 *   1. Location inbox — if Location.notifyOnNewRequest && Location.email
 *   2. Individual staff — active users at the location with the relevant
 *      view permission who have not opted out
 */

import { prisma } from "./prisma";
import { sendNewRequestNotification, type RequestType } from "./email";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const VIEW_PERMISSION: Record<RequestType, string> = {
  contact: "contact.view",
  tradein: "tradein.view",
  finance: "finance.view",
};

const DETAIL_PATH: Record<RequestType, string> = {
  contact: "/admin/requests/contact",
  tradein: "/admin/requests/trade-in",
  finance: "/admin/requests/finance",
};

const NOTIF_KEY: Record<RequestType, string> = {
  contact: "contact.new",
  tradein: "tradein.new",
  finance: "finance.new",
};

interface NotifyNewRequestParams {
  type: RequestType;
  requestId: string;
  locationId: string;
  submittedBy: string; // customer name
}

export async function notifyNewRequest({
  type,
  requestId,
  locationId,
  submittedBy,
}: NotifyNewRequestParams): Promise<void> {
  const location = await prisma.location.findUnique({
    where: { id: locationId },
    select: { name: true, email: true, notifyOnNewRequest: true },
  });
  if (!location) return;

  const detailUrl = `${APP_URL}${DETAIL_PATH[type]}/${requestId}`;
  const notifKey = NOTIF_KEY[type];

  const sendOpts = {
    type,
    locationName: location.name,
    submittedBy,
    requestId,
    detailUrl,
  };

  const sends: Promise<unknown>[] = [];

  // 1. Location inbox
  if (location.notifyOnNewRequest && location.email) {
    sends.push(sendNewRequestNotification({ to: location.email, ...sendOpts }));
  }

  // 2. Individual staff at this location
  const viewPerm = VIEW_PERMISSION[type];
  const staff = await prisma.user.findMany({
    where: {
      isActive: true,
      locations: { some: { locationId } },
      role: { permissions: { has: viewPerm } },
    },
    select: { email: true, notificationPreferences: true },
  });

  for (const user of staff) {
    const prefs = (user.notificationPreferences ?? {}) as Record<string, boolean>;
    if (prefs[notifKey] === false) continue;
    sends.push(sendNewRequestNotification({ to: user.email, ...sendOpts }));
  }

  await Promise.allSettled(sends);
}
