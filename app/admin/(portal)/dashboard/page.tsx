import type { Metadata } from "next";
import Link from "next/link";
import { requireAuth } from "../../../lib/auth-helpers";
import { prisma } from "../../../lib/prisma";
import { hasPermission } from "../../../lib/permissions";
import {
  MessageSquare,
  Car,
  CreditCard,
  Package,
  CalendarCheck,
  Clock,
  ArrowRight,
} from "lucide-react";
import { formatDistanceToNow, parseISO, isToday, isTomorrow, format } from "date-fns";

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
  href,
}: {
  title: string;
  icon: React.ElementType;
  newCount: number;
  openCount: number;
  extraLabel: string;
  extraValue: string;
  color: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-xl border bg-white shadow-sm hover:shadow-md transition-all overflow-hidden"
      style={{ borderColor: "#E4E5E8" }}
    >
      {/* Accent bar */}
      <div className="h-1 w-full" style={{ backgroundColor: color }} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <p className="text-sm font-medium" style={{ color: "#5B5F6B" }}>{title}</p>
          <Icon className="h-4 w-4 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" style={{ color }} aria-hidden="true" />
        </div>

        {/* Big number */}
        <div className="flex items-baseline gap-2 mb-4">
          <span
            className="text-3xl font-bold font-heading tabular-nums"
            style={{ color: newCount > 0 ? color : "#13151A" }}
          >
            {newCount}
          </span>
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: newCount > 0 ? `${color}18` : "#F3F4F6",
              color: newCount > 0 ? color : "#9CA3AF",
            }}
          >
            new
          </span>
        </div>

        {/* Stats */}
        <div
          className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs pt-3 border-t"
          style={{ borderColor: "#F3F4F6" }}
        >
          <span style={{ color: "#9CA3AF" }}>Open</span>
          <span style={{ color: "#9CA3AF" }}>{extraLabel}</span>
          <span className="font-semibold" style={{ color: "#13151A" }}>{openCount}</span>
          <span className="font-semibold" style={{ color: "#13151A" }}>{extraValue}</span>
        </div>
      </div>
    </Link>
  );
}

// ─── Activity feed ────────────────────────────────────────────────────────────

const ENTITY_META: Record<string, { icon: React.ElementType; color: string; path: string; label: string }> = {
  ContactRequest:    { icon: MessageSquare,  color: "#E15A2C", path: "/admin/requests/contact",    label: "Contact" },
  TradeInRequest:    { icon: Car,            color: "#142036", path: "/admin/requests/trade-in",   label: "Trade-In" },
  FinanceApplication:{ icon: CreditCard,     color: "#1F9D55", path: "/admin/requests/finance",    label: "Finance" },
  TestDriveBooking:  { icon: CalendarCheck,  color: "#E15A2C", path: "/admin/requests/test-drive", label: "Test Drive" },
  Vehicle:           { icon: Package,        color: "#5B5F6B", path: "/admin/inventory",           label: "Vehicle" },
};

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
  const meta = ENTITY_META[entityType];
  const EntityIcon = meta?.icon ?? Clock;
  const color = meta?.color ?? "#9CA3AF";
  const path = meta ? `${meta.path}/${entityId}` : "#";
  const shortId = entityId.slice(-6).toUpperCase();

  const actionLabel = action
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());

  return (
    <div className="flex items-start gap-3 py-3">
      <div
        className="mt-0.5 h-7 w-7 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}15` }}
      >
        <EntityIcon className="h-3.5 w-3.5" style={{ color }} aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-snug" style={{ color: "#13151A" }}>
          <span className="font-medium">{actor ?? "System"}</span>{" "}
          <span style={{ color: "#5B5F6B" }}>{actionLabel}</span>
          {meta && (
            <>
              {" · "}
              <Link
                href={path}
                className="font-mono text-xs hover:underline"
                style={{ color }}
              >
                {meta.label}/{shortId}
              </Link>
            </>
          )}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>
          {formatDistanceToNow(createdAt, { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}

// ─── Upcoming test drive item ─────────────────────────────────────────────────

const STATUS_DOT: Record<string, string> = {
  NEW: "#E15A2C",
  IN_PROGRESS: "#2563EB",
  AWAITING_RESPONSE: "#CA8A04",
};

function formatBookingDate(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "EEE d MMM");
  } catch {
    return dateStr;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCompact(dollars: number | null | undefined): string {
  if (!dollars) return "$0";
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)}M`;
  if (dollars >= 1_000) return `$${Math.round(dollars / 1_000)}k`;
  return `$${dollars.toLocaleString()}`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const session = await requireAuth();
  const permissions = session.user.role.permissions;
  const locationIds = session.user.locations.map((l) => l.id);
  const hasViewAll = hasPermission(permissions, "locations.viewall");
  const locationFilter = hasViewAll ? undefined : { in: locationIds };

  const todayStr = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const canContact   = hasPermission(permissions, "contact.view");
  const canTradeIn   = hasPermission(permissions, "tradein.view");
  const canFinance   = hasPermission(permissions, "finance.view");
  const canTestDrive = hasPermission(permissions, "testdrive.view");
  const canInventory = hasPermission(permissions, "inventory.view");

  const [
    contactNew, contactOpen, contactThisWeek,
    tradeInNew, tradeInOpen, tradeInEstTotal,
    financeNew, financeOpen, financePipeline,
    testDriveNew, testDriveOpen,
    vehicleGrouped,
    recentActivity,
    upcomingDrives,
  ] = await Promise.all([
    canContact
      ? prisma.contactRequest.count({ where: { status: "NEW", locationId: locationFilter } })
      : Promise.resolve(0),
    canContact
      ? prisma.contactRequest.count({ where: { status: { in: ["NEW", "IN_PROGRESS", "AWAITING_RESPONSE"] }, locationId: locationFilter } })
      : Promise.resolve(0),
    canContact
      ? prisma.contactRequest.count({ where: { createdAt: { gte: weekAgo }, locationId: locationFilter } })
      : Promise.resolve(0),

    canTradeIn
      ? prisma.tradeInRequest.count({ where: { status: "NEW", locationId: locationFilter } })
      : Promise.resolve(0),
    canTradeIn
      ? prisma.tradeInRequest.count({ where: { status: { in: ["NEW", "IN_PROGRESS", "AWAITING_RESPONSE"] }, locationId: locationFilter } })
      : Promise.resolve(0),
    canTradeIn
      ? prisma.tradeInRequest.aggregate({
          where: { estimatedValue: { not: null }, locationId: locationFilter },
          _sum: { estimatedValue: true },
        })
      : Promise.resolve({ _sum: { estimatedValue: null } }),

    canFinance
      ? prisma.financeApplication.count({ where: { status: "NEW", locationId: locationFilter } })
      : Promise.resolve(0),
    canFinance
      ? prisma.financeApplication.count({ where: { status: { in: ["NEW", "IN_PROGRESS", "AWAITING_RESPONSE"] }, locationId: locationFilter } })
      : Promise.resolve(0),
    canFinance
      ? prisma.financeApplication.aggregate({
          where: { status: { in: ["NEW", "IN_PROGRESS", "AWAITING_RESPONSE"] }, locationId: locationFilter },
          _sum: { desiredLoanAmount: true },
        })
      : Promise.resolve({ _sum: { desiredLoanAmount: null } }),

    canTestDrive
      ? prisma.testDriveBooking.count({ where: { status: "NEW", locationId: locationFilter } })
      : Promise.resolve(0),
    canTestDrive
      ? prisma.testDriveBooking.count({ where: { status: { in: ["NEW", "IN_PROGRESS", "AWAITING_RESPONSE"] }, locationId: locationFilter } })
      : Promise.resolve(0),

    canInventory
      ? prisma.vehicle.groupBy({ by: ["status"], where: { locationId: locationFilter }, _count: { _all: true } })
      : Promise.resolve([]),

    prisma.auditLog.findMany({
      where: hasViewAll ? undefined : { locationId: { in: locationIds } },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { actor: { select: { name: true } } },
    }),

    canTestDrive
      ? prisma.testDriveBooking.findMany({
          where: {
            preferredDate: { gte: todayStr },
            status: { in: ["NEW", "IN_PROGRESS", "AWAITING_RESPONSE"] },
            locationId: locationFilter,
          },
          orderBy: [{ preferredDate: "asc" }, { preferredTime: "asc" }],
          take: 6,
          select: {
            id: true,
            name: true,
            preferredDate: true,
            preferredTime: true,
            status: true,
            vehicle: { select: { year: true, make: true, model: true } },
          },
        })
      : Promise.resolve([]),
  ]);

  const listedCount = (vehicleGrouped as { status: string; _count: { _all: number } }[])
    .filter((g) => g.status === "AVAILABLE").reduce((acc, g) => acc + g._count._all, 0);
  const soldCount = (vehicleGrouped as { status: string; _count: { _all: number } }[])
    .filter((g) => g.status === "SOLD").reduce((acc, g) => acc + g._count._all, 0);
  const pendingCount = (vehicleGrouped as { status: string; _count: { _all: number } }[])
    .filter((g) => g.status === "PENDING").reduce((acc, g) => acc + g._count._all, 0);

  const hasAnyCard = canContact || canTradeIn || canFinance || canTestDrive || canInventory;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold" style={{ color: "#13151A" }}>
          Dashboard
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "#5B5F6B" }}>
          Welcome back, {session.user.name} · {format(new Date(), "EEEE, d MMMM yyyy")}
        </p>
      </div>

      {/* Summary cards */}
      {hasAnyCard && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          {canContact && (
            <SummaryCard
              href="/admin/requests/contact"
              title="Contact Requests"
              icon={MessageSquare}
              newCount={contactNew as number}
              openCount={contactOpen as number}
              extraLabel="This week"
              extraValue={String(contactThisWeek as number)}
              color="#E15A2C"
            />
          )}
          {canTradeIn && (
            <SummaryCard
              href="/admin/requests/trade-in"
              title="Trade-In Requests"
              icon={Car}
              newCount={tradeInNew as number}
              openCount={tradeInOpen as number}
              extraLabel="Est. total"
              extraValue={formatCompact((tradeInEstTotal as { _sum: { estimatedValue: number | null } })._sum.estimatedValue)}
              color="#142036"
            />
          )}
          {canFinance && (
            <SummaryCard
              href="/admin/requests/finance"
              title="Finance Applications"
              icon={CreditCard}
              newCount={financeNew as number}
              openCount={financeOpen as number}
              extraLabel="Requested"
              extraValue={formatCompact((financePipeline as { _sum: { desiredLoanAmount: number | null } })._sum.desiredLoanAmount)}
              color="#1F9D55"
            />
          )}
          {canTestDrive && (
            <SummaryCard
              href="/admin/requests/test-drive"
              title="Test Drive Bookings"
              icon={CalendarCheck}
              newCount={testDriveNew as number}
              openCount={testDriveOpen as number}
              extraLabel="Upcoming"
              extraValue={String((upcomingDrives as { id: string }[]).length)}
              color="#E15A2C"
            />
          )}
          {canInventory && (
            <SummaryCard
              href="/admin/inventory"
              title="Inventory"
              icon={Package}
              newCount={0}
              openCount={listedCount}
              extraLabel="Sold · Pending"
              extraValue={`${soldCount} · ${pendingCount}`}
              color="#5B5F6B"
            />
          )}
        </div>
      )}

      {/* Bottom two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent activity */}
        <div
          className="lg:col-span-2 rounded-xl border bg-white shadow-sm"
          style={{ borderColor: "#E4E5E8" }}
        >
          <div
            className="flex items-center justify-between px-5 py-4 border-b"
            style={{ borderColor: "#E4E5E8" }}
          >
            <h2 className="font-heading text-sm font-bold" style={{ color: "#13151A" }}>
              Recent Activity
            </h2>
            <Link
              href="/admin/audit"
              className="flex items-center gap-1 text-xs font-medium hover:underline"
              style={{ color: "#E15A2C" }}
            >
              View all
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>
          <div className="px-5 divide-y" style={{ borderColor: "#F3F4F6" }}>
            {recentActivity.length === 0 ? (
              <div className="py-12 text-center">
                <Clock className="h-8 w-8 mx-auto mb-3 opacity-20" style={{ color: "#5B5F6B" }} />
                <p className="text-sm" style={{ color: "#9CA3AF" }}>
                  No activity yet. Actions taken in the portal will appear here.
                </p>
              </div>
            ) : (
              recentActivity.map((entry) => (
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

        {/* Upcoming test drives */}
        {canTestDrive && (
          <div
            className="rounded-xl border bg-white shadow-sm"
            style={{ borderColor: "#E4E5E8" }}
          >
            <div
              className="flex items-center justify-between px-5 py-4 border-b"
              style={{ borderColor: "#E4E5E8" }}
            >
              <h2 className="font-heading text-sm font-bold" style={{ color: "#13151A" }}>
                Upcoming Test Drives
              </h2>
              <Link
                href="/admin/requests/test-drive?view=calendar"
                className="flex items-center gap-1 text-xs font-medium hover:underline"
                style={{ color: "#E15A2C" }}
              >
                Calendar
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>

            <div className="divide-y" style={{ borderColor: "#F3F4F6" }}>
              {(upcomingDrives as {
                id: string;
                name: string;
                preferredDate: string;
                preferredTime: string | null;
                status: string;
                vehicle: { year: number; make: string; model: string } | null;
              }[]).length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <CalendarCheck className="h-7 w-7 mx-auto mb-2 opacity-20" style={{ color: "#E15A2C" }} />
                  <p className="text-sm" style={{ color: "#9CA3AF" }}>
                    No upcoming bookings
                  </p>
                </div>
              ) : (
                (upcomingDrives as {
                  id: string;
                  name: string;
                  preferredDate: string;
                  preferredTime: string | null;
                  status: string;
                  vehicle: { year: number; make: string; model: string } | null;
                }[]).map((b) => {
                  const dotColor = STATUS_DOT[b.status] ?? "#9CA3AF";
                  return (
                    <Link
                      key={b.id}
                      href={`/admin/requests/test-drive/${b.id}`}
                      className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div
                        className="mt-1.5 h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: dotColor }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: "#13151A" }}>
                          {b.name}
                        </p>
                        {b.vehicle && (
                          <p className="text-xs truncate" style={{ color: "#5B5F6B" }}>
                            {b.vehicle.year} {b.vehicle.make} {b.vehicle.model}
                          </p>
                        )}
                        <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>
                          {formatBookingDate(b.preferredDate)}
                          {b.preferredTime ? ` · ${b.preferredTime}` : ""}
                        </p>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>

            {(upcomingDrives as { id: string }[]).length > 0 && (
              <div className="px-5 py-3 border-t" style={{ borderColor: "#F3F4F6" }}>
                <Link
                  href="/admin/requests/test-drive"
                  className="text-xs font-medium hover:underline"
                  style={{ color: "#E15A2C" }}
                >
                  View all bookings →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* If no test drive permission, activity spans full width — handled by CSS grid */}
      </div>
    </div>
  );
}
