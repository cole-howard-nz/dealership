import type { Metadata } from "next";
import { requireAuth } from "../../../lib/auth-helpers";
import { prisma } from "../../../lib/prisma";
import { hasPermission } from "../../../lib/permissions";
import {
  MessageSquare,
  Car,
  CreditCard,
  Package,
  Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const metadata: Metadata = {
  title: "Dashboard — Northbridge Motors Staff Portal",
};

// ─── Summary card ─────────────────────────────────────────────────────────────

function SummaryCard({
  title,
  icon: Icon,
  newCount,
  openCount,
  extraLabel,
  extraValue,
  color,
}: {
  title: string;
  icon: React.ElementType;
  newCount: number;
  openCount: number;
  extraLabel: string;
  extraValue: string;
  color: string;
}) {
  return (
    <div
      className="rounded-xl border bg-white p-5 shadow-sm"
      style={{ borderColor: "#E4E5E8" }}
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-semibold" style={{ color: "#5B5F6B" }}>
          {title}
        </p>
        <div
          className="h-8 w-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="h-4 w-4" style={{ color }} aria-hidden="true" />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span
            className="text-2xl font-bold font-heading"
            style={{ color: newCount > 0 ? "#E15A2C" : "#13151A" }}
          >
            {newCount}
          </span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: newCount > 0 ? "#E15A2C15" : "#E4E5E8",
              color: newCount > 0 ? "#E15A2C" : "#5B5F6B",
            }}
          >
            new
          </span>
        </div>
        <div className="flex items-baseline justify-between text-sm">
          <span style={{ color: "#5B5F6B" }}>Open</span>
          <span className="font-semibold" style={{ color: "#13151A" }}>{openCount}</span>
        </div>
        <div className="pt-1 border-t flex items-baseline justify-between text-xs"
          style={{ borderColor: "#E4E5E8", color: "#5B5F6B" }}
        >
          <span>{extraLabel}</span>
          <span className="font-medium" style={{ color: "#13151A" }}>{extraValue}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Activity feed item ───────────────────────────────────────────────────────

function ActivityItem({
  actor,
  action,
  entityType,
  entityId,
  createdAt,
}: {
  actor: string | null;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: Date;
}) {
  const actionLabel = action
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());

  const entityShort = entityId.slice(-6).toUpperCase();

  return (
    <div
      className="flex items-start gap-3 py-3 border-b last:border-b-0"
      style={{ borderColor: "#E4E5E8" }}
    >
      <div
        className="mt-0.5 h-6 w-6 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: "#142036" }}
      >
        <Clock className="h-3 w-3 text-white" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm" style={{ color: "#13151A" }}>
          <span className="font-medium">{actor ?? "System"}</span>{" "}
          <span style={{ color: "#5B5F6B" }}>
            {actionLabel} ·{" "}
            <span className="font-mono text-xs">{entityType}/{entityShort}</span>
          </span>
        </p>
        <p className="text-xs mt-0.5" style={{ color: "#5B5F6B" }}>
          {formatDistanceToNow(createdAt, { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const session = await requireAuth();
  const permissions = session.user.role.permissions;
  const locationIds = session.user.locations.map((l) => l.id);
  const hasViewAll = hasPermission(permissions, "locations.viewall");
  const locationFilter = hasViewAll ? undefined : { in: locationIds };

  // Phase 2 models (contactRequest, tradeInRequest, financeApplication, vehicle)
  // don't exist in the Phase 1 schema yet. Cast to any so TypeScript doesn't
  // complain — the optional chaining + .catch() already handles runtime absence.
  const db = prisma as any; // eslint-disable-line @typescript-eslint/no-explicit-any

  // Fetch counts in parallel for each permitted section
  const [contactNew, contactOpen, tradeInNew, tradeInOpen, financeNew, financeOpen, vehicleCounts, recentActivity] =
    await Promise.all([
      // Contact
      hasPermission(permissions, "contact.view")
        ? db.contactRequest?.count({ where: { status: "NEW", locationId: locationFilter } }).catch(() => 0) ?? Promise.resolve(0)
        : Promise.resolve(0),
      hasPermission(permissions, "contact.view")
        ? db.contactRequest?.count({ where: { status: { in: ["NEW", "IN_PROGRESS", "AWAITING_RESPONSE"] }, locationId: locationFilter } }).catch(() => 0) ?? Promise.resolve(0)
        : Promise.resolve(0),
      // Trade-in
      hasPermission(permissions, "tradein.view")
        ? db.tradeInRequest?.count({ where: { status: "NEW", locationId: locationFilter } }).catch(() => 0) ?? Promise.resolve(0)
        : Promise.resolve(0),
      hasPermission(permissions, "tradein.view")
        ? db.tradeInRequest?.count({ where: { status: { in: ["NEW", "IN_PROGRESS", "AWAITING_RESPONSE"] }, locationId: locationFilter } }).catch(() => 0) ?? Promise.resolve(0)
        : Promise.resolve(0),
      // Finance
      hasPermission(permissions, "finance.view")
        ? db.financeApplication?.count({ where: { status: "NEW", locationId: locationFilter } }).catch(() => 0) ?? Promise.resolve(0)
        : Promise.resolve(0),
      hasPermission(permissions, "finance.view")
        ? db.financeApplication?.count({ where: { status: { in: ["NEW", "IN_PROGRESS", "AWAITING_RESPONSE"] }, locationId: locationFilter } }).catch(() => 0) ?? Promise.resolve(0)
        : Promise.resolve(0),
      // Vehicles
      hasPermission(permissions, "inventory.view")
        ? db.vehicle?.groupBy({ by: ["status"], where: { locationId: locationFilter }, _count: { _all: true } }).catch(() => []) ?? Promise.resolve([])
        : Promise.resolve([]),
      // Audit log (recent activity) — AuditLog exists in Phase 1 schema
      prisma.auditLog.findMany({
        where: hasViewAll ? undefined : { locationId: { in: locationIds } },
        orderBy: { createdAt: "desc" },
        take: 15,
        include: { actor: { select: { name: true } } },
      }).catch(() => []),
    ]);

  // Vehicle stat helpers
  const vehicleGrouped = vehicleCounts as Array<{ status: string; _count: { _all: number } }>;
  const listedCount = vehicleGrouped.filter((g) => g.status === "AVAILABLE").reduce((acc, g) => acc + g._count._all, 0);
  const soldCount = vehicleGrouped.filter((g) => g.status === "SOLD").reduce((acc, g) => acc + g._count._all, 0);
  const pendingCount = vehicleGrouped.filter((g) => g.status === "PENDING").reduce((acc, g) => acc + g._count._all, 0);

  const hasAnyCard =
    hasPermission(permissions, "contact.view") ||
    hasPermission(permissions, "tradein.view") ||
    hasPermission(permissions, "finance.view") ||
    hasPermission(permissions, "inventory.view");

  return (
    <div className="max-w-screen-xl">
      {/* Page heading */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold" style={{ color: "#13151A" }}>
          Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: "#5B5F6B" }}>
          Welcome back, {session.user.name}
        </p>
      </div>

      {/* Summary cards */}
      {hasAnyCard && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {hasPermission(permissions, "contact.view") && (
            <SummaryCard
              title="Contact Requests"
              icon={MessageSquare}
              newCount={contactNew as number}
              openCount={contactOpen as number}
              extraLabel="This week"
              extraValue="—"
              color="#E15A2C"
            />
          )}
          {hasPermission(permissions, "tradein.view") && (
            <SummaryCard
              title="Trade-In Requests"
              icon={Car}
              newCount={tradeInNew as number}
              openCount={tradeInOpen as number}
              extraLabel="Est. value"
              extraValue="—"
              color="#142036"
            />
          )}
          {hasPermission(permissions, "finance.view") && (
            <SummaryCard
              title="Finance Applications"
              icon={CreditCard}
              newCount={financeNew as number}
              openCount={financeOpen as number}
              extraLabel="In review"
              extraValue="—"
              color="#1F9D55"
            />
          )}
          {hasPermission(permissions, "inventory.view") && (
            <SummaryCard
              title="Inventory"
              icon={Package}
              newCount={0}
              openCount={listedCount}
              extraLabel={`Sold · Pending`}
              extraValue={`${soldCount} · ${pendingCount}`}
              color="#5B5F6B"
            />
          )}
        </div>
      )}

      {/* Recent activity */}
      <div
        className="rounded-xl border bg-white shadow-sm"
        style={{ borderColor: "#E4E5E8" }}
      >
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "#E4E5E8" }}
        >
          <h2 className="font-heading text-base font-bold" style={{ color: "#13151A" }}>
            Recent Activity
          </h2>
          <a
            href="/admin/audit"
            className="text-xs font-medium hover:underline"
            style={{ color: "#E15A2C" }}
          >
            View all
          </a>
        </div>
        <div className="px-5 divide-y-0">
          {(recentActivity as Array<{ id: string; actor: { name: string } | null; action: string; entityType: string; entityId: string; createdAt: Date }>).length === 0 ? (
            <div className="py-12 text-center">
              <Clock className="h-8 w-8 mx-auto mb-3 opacity-20" style={{ color: "#5B5F6B" }} />
              <p className="text-sm" style={{ color: "#5B5F6B" }}>
                No activity yet. Actions taken in the portal will appear here.
              </p>
            </div>
          ) : (
            (recentActivity as Array<{ id: string; actor: { name: string } | null; action: string; entityType: string; entityId: string; createdAt: Date }>).map((entry) => (
              <ActivityItem
                key={entry.id}
                actor={entry.actor?.name ?? null}
                action={entry.action}
                entityType={entry.entityType}
                entityId={entry.entityId}
                createdAt={entry.createdAt}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}