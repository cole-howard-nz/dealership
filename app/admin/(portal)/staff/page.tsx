import type { Metadata } from "next";
import Link from "next/link";
import { requirePermission } from "../../../lib/auth-helpers";
import { hasPermission } from "../../../lib/permissions";
import { prisma } from "../../../lib/prisma";
import { format, formatDistanceToNow } from "date-fns";
import { Users, UserPlus, Clock } from "lucide-react";
import { StaffFilters } from "./StaffFilters";

export const metadata: Metadata = {
  title: "Staff — Northbridge Motors Staff Portal",
};

const PAGE_SIZE = 10;

interface PageProps {
  searchParams: Promise<{
    q?: string;
    inactive?: string;
    page?: string;
    loc?: string;
  }>;
}

export default async function StaffPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const session = await requirePermission("staff.view");

  const permissions = session.user.role.permissions;
  const canInvite = hasPermission(permissions, "staff.invite");
  const showInactive = sp.inactive === "1";
  const q = sp.q?.trim() ?? "";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));

  const where = {
    ...(showInactive ? {} : { isActive: true }),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        role: { select: { name: true, isSystem: true } },
        locations: { include: { location: { select: { name: true } } } },
      },
      orderBy: [{ isActive: "desc" }, { name: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  function buildUrl(params: Record<string, string | undefined>) {
    const merged = { q: sp.q, inactive: sp.inactive, loc: sp.loc, page: sp.page, ...params };
    const search = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) {
      if (v && v !== "") search.set(k, v);
    }
    return `/admin/staff?${search.toString()}`;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold" style={{ color: "#13151A" }}>Staff</h1>
          <p className="text-sm mt-0.5" style={{ color: "#5B5F6B" }}>
            {total} member{total !== 1 ? "s" : ""}
          </p>
        </div>
        {canInvite && (
          <Link
            href="/admin/staff/invite"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white"
            style={{ backgroundColor: "#142036" }}
          >
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            Invite Staff
          </Link>
        )}
      </div>

      {/* Filters */}
      <StaffFilters currentQ={q} showInactive={showInactive} />

      {/* List */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden" style={{ borderColor: "#E4E5E8", maxHeight: "calc(100vh - 280px)" }}>
        {users.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="h-10 w-10 mx-auto mb-3 opacity-20" style={{ color: "#5B5F6B" }} />
            <p className="text-sm" style={{ color: "#5B5F6B" }}>
              {q ? "No staff match your search." : "No staff members yet."}
            </p>
            {canInvite && !q && (
              <Link href="/admin/staff/invite" className="mt-3 inline-block text-sm font-medium hover:underline"
                style={{ color: "#E15A2C" }}>
                Invite your first staff member
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-auto" style={{ maxHeight: "calc(100vh - 320px)" }}>
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr style={{ borderBottom: "1px solid #E4E5E8", backgroundColor: "#F9FAFB" }}>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#5B5F6B" }}>Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#5B5F6B" }}>Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#5B5F6B" }}>Locations</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#5B5F6B" }}>Last Login</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#5B5F6B" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: "1px solid #F3F4F6" }}
                    className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <Link href={`/admin/staff/${u.id}`} className="block hover:underline">
                        <span className="font-semibold" style={{ color: "#13151A" }}>{u.name}</span>
                        <span className="block text-xs mt-0.5" style={{ color: "#5B5F6B" }}>{u.email}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: u.role.isSystem ? "#EFF6FF" : "#F3F4F6",
                          color: u.role.isSystem ? "#1D4ED8" : "#374151",
                        }}
                      >
                        {u.role.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "#5B5F6B" }}>
                      {u.locations.length === 0
                        ? "—"
                        : u.locations.map((l) => l.location.name).join(", ")}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "#9CA3AF" }}>
                      {u.lastLoginAt ? (
                        <span title={format(u.lastLoginAt, "d MMM yyyy, h:mm a")}>
                          {formatDistanceToNow(u.lastLoginAt, { addSuffix: true })}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" aria-hidden="true" />
                          {u.inviteAccepted ? "Never" : "Invite pending"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {u.isActive ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ backgroundColor: "#DCFCE7", color: "#15803D" }}>Active</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ backgroundColor: "#F3F4F6", color: "#9CA3AF" }}>
                          {u.inviteAccepted ? "Deactivated" : "Invite pending"}
                        </span>
                      )}
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
