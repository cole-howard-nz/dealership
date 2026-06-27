import type { Metadata } from "next";
import Link from "next/link";
import { requirePermission } from "../../../lib/auth-helpers";
import { hasPermission } from "../../../lib/permissions";
import { prisma } from "../../../lib/prisma";
import { format, formatDistanceToNow } from "date-fns";
import { Users, UserPlus, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Staff — Northbridge Motors Staff Portal",
};

const PAGE_SIZE = 50;

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
    <div className="max-w-screen-xl">
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
      <form method="GET" action="/admin/staff" className="flex flex-wrap gap-2 mb-5">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search name or email…"
          className="rounded-lg border px-3 py-2 text-sm focus:outline-none flex-1 min-w-[200px]"
          style={{ borderColor: "#E4E5E8", color: "#13151A" }}
        />
        <label className="flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm"
          style={{ borderColor: "#E4E5E8", color: "#5B5F6B" }}>
          <input
            type="checkbox"
            name="inactive"
            value="1"
            defaultChecked={showInactive}
            className="h-4 w-4"
            style={{ accentColor: "#142036" }}
          />
          Show deactivated
        </label>
        <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ backgroundColor: "#142036" }}>
          Filter
        </button>
        {(q || showInactive) && (
          <Link href="/admin/staff" className="px-4 py-2 rounded-lg text-sm font-medium border"
            style={{ borderColor: "#E4E5E8", color: "#5B5F6B" }}>
            Clear
          </Link>
        )}
      </form>

      {/* List */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden" style={{ borderColor: "#E4E5E8" }}>
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
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
