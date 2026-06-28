import type { Metadata } from "next";
import Link from "next/link";
import { requirePermission } from "../../../lib/auth-helpers";
import { hasPermission } from "../../../lib/permissions";
import { prisma } from "../../../lib/prisma";
import { format, formatDistanceToNow } from "date-fns";
import { Clock } from "lucide-react";
import { AuditFilters } from "./AuditFilters";

export const metadata: Metadata = {
  title: "Audit Log — Northbridge Motors Staff Portal",
};

const PAGE_SIZE = 10;

const ACTION_LABELS: Record<string, string> = {
  STATUS_CHANGED: "Status changed",
  ASSIGNED: "Assigned",
  NOTE_ADDED: "Note added",
  ESTIMATE_SET: "Estimate set",
  VEHICLE_CREATED: "Vehicle created",
  VEHICLE_UPDATED: "Vehicle updated",
  VEHICLE_STATUS_CHANGED: "Vehicle status changed",
  USER_INVITED: "User invited",
  USER_ROLE_CHANGED: "Role changed",
  USER_LOCATIONS_UPDATED: "Locations updated",
  USER_DEACTIVATED: "User deactivated",
  USER_ACTIVATED: "User activated",
  INVITE_ACCEPTED: "Invite accepted",
  INVITE_RESENT: "Invite resent",
  ROLE_CREATED: "Role created",
  ROLE_UPDATED: "Role updated",
  ROLE_DELETED: "Role deleted",
  LOCATION_CREATED: "Location created",
  LOCATION_UPDATED: "Location updated",
  LOCATION_DEACTIVATED: "Location deactivated",
  LOCATION_ACTIVATED: "Location activated",
  LOGIN: "Login",
  LOGOUT: "Logout",
  LOGIN_FAILED: "Login failed",
  PASSWORD_RESET_REQUESTED: "Password reset requested",
  PASSWORD_RESET: "Password reset",
};

const ENTITY_LABELS: Record<string, string> = {
  ContactRequest: "Contact Request",
  TradeInRequest: "Trade-In Request",
  FinanceApplication: "Finance Application",
  Vehicle: "Vehicle",
  User: "User",
  Role: "Role",
  Location: "Location",
};

interface PageProps {
  searchParams: Promise<{
    q?: string;
    action?: string;
    entity?: string;
    page?: string;
    loc?: string;
  }>;
}

export default async function AuditPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const session = await requirePermission("audit.view");

  const permissions = session.user.role.permissions;
  const hasViewAll = hasPermission(permissions, "locations.viewall");
  const userLocationIds = session.user.locations.map((l) => l.id);

  const page = Math.max(1, parseInt(sp.page ?? "1", 10));
  const q = sp.q?.trim() ?? "";
  const activeLoc = sp.loc && sp.loc !== "all" ? sp.loc : undefined;

  const locationFilter = activeLoc
    ? { in: [activeLoc] }
    : hasViewAll
    ? undefined
    : { in: userLocationIds };

  const where = {
    ...(locationFilter ? { locationId: locationFilter } : {}),
    ...(sp.action ? { action: sp.action } : {}),
    ...(sp.entity ? { entityType: sp.entity } : {}),
    ...(q ? { actor: { name: { contains: q, mode: "insensitive" as const } } } : {}),
  };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        actor: { select: { name: true } },
        location: { select: { name: true } },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  function buildUrl(params: Record<string, string | undefined>) {
    const merged = { q: sp.q, action: sp.action, entity: sp.entity, loc: sp.loc, page: sp.page, ...params };
    const search = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) {
      if (v && v !== "") search.set(k, v);
    }
    return `/admin/audit?${search.toString()}`;
  }


  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold" style={{ color: "#13151A" }}>Audit Log</h1>
        <p className="text-sm mt-0.5" style={{ color: "#5B5F6B" }}>
          {total.toLocaleString()} event{total !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Filters */}
      <AuditFilters
        currentQ={q}
        currentAction={sp.action ?? ""}
        currentEntity={sp.entity ?? ""}
        actionLabels={ACTION_LABELS}
        entityLabels={ENTITY_LABELS}
      />

      {/* Log table */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden" style={{ borderColor: "#E4E5E8", maxHeight: "calc(100vh - 280px)" }}>
        {logs.length === 0 ? (
          <div className="py-16 text-center">
            <Clock className="h-10 w-10 mx-auto mb-3 opacity-20" style={{ color: "#5B5F6B" }} />
            <p className="text-sm" style={{ color: "#5B5F6B" }}>
              {q || sp.action || sp.entity ? "No events match your filters." : "No events recorded yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-auto" style={{ maxHeight: "calc(100vh - 320px)" }}>
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr style={{ borderBottom: "1px solid #E4E5E8", backgroundColor: "#F9FAFB" }}>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#5B5F6B" }}>Time</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#5B5F6B" }}>Actor</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#5B5F6B" }}>Action</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#5B5F6B" }}>Entity</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#5B5F6B" }}>Location</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#5B5F6B" }}>Detail</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: "1px solid #F3F4F6" }} className="hover:bg-gray-50">
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className="text-xs" style={{ color: "#13151A" }}
                        title={format(log.createdAt, "d MMM yyyy, h:mm:ss a")}>
                        {formatDistanceToNow(log.createdAt, { addSuffix: true })}
                      </span>
                      <span className="block text-xs" style={{ color: "#9CA3AF" }}>
                        {format(log.createdAt, "d MMM, h:mm a")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: "#13151A" }}>
                      {log.actor?.name ?? <span style={{ color: "#9CA3AF" }}>System</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                        style={{ backgroundColor: "#F3F4F6", color: "#374151" }}
                      >
                        {ACTION_LABELS[log.action] ?? log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "#5B5F6B" }}>
                      <span>{ENTITY_LABELS[log.entityType] ?? log.entityType}</span>
                      <span className="ml-1 font-mono" style={{ color: "#9CA3AF" }}>
                        /{log.entityId.slice(-6).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "#5B5F6B" }}>
                      {log.location?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono max-w-xs truncate" style={{ color: "#9CA3AF" }}>
                      {log.metadata ? JSON.stringify(log.metadata) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm" style={{ color: "#5B5F6B" }}>
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={buildUrl({ page: String(page - 1) })}
                className="px-3 py-1.5 rounded-lg border text-sm" style={{ borderColor: "#E4E5E8" }}>
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link href={buildUrl({ page: String(page + 1) })}
                className="px-3 py-1.5 rounded-lg border text-sm" style={{ borderColor: "#E4E5E8" }}>
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
