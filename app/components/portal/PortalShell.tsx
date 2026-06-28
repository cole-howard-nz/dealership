"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  MessageSquare,
  Car,
  CreditCard,
  Package,
  Users,
  Shield,
  MapPin,
  ScrollText,
  Settings,
  UserCircle,
  LogOut,
  ChevronDown,
  ChevronRight,
  Menu,
} from "lucide-react";
import { hasPermission, type Permission } from "../../lib/permissions";
import { Header } from "../Header";
import { ShortlistProvider } from "../../hooks/useShortlist";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserData {
  id: string;
  name: string;
  email: string;
  role: { id: string; name: string; isSystem: boolean; permissions: string[] };
  locations: Array<{ id: string; name: string; isActive: boolean }>;
}

interface PortalShellProps {
  user: UserData;
  children: React.ReactNode;
}

// ─── Nav structure ────────────────────────────────────────────────────────────

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  permission?: Permission;
  badge?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Requests",
    items: [
      { href: "/admin/requests/contact", label: "Contact", icon: MessageSquare, permission: "contact.view" },
      { href: "/admin/requests/trade-in", label: "Trade-In", icon: Car, permission: "tradein.view" },
      { href: "/admin/requests/finance", label: "Finance", icon: CreditCard, permission: "finance.view" },
    ],
  },
  {
    label: "Inventory",
    items: [
      { href: "/admin/inventory", label: "Inventory", icon: Package, permission: "inventory.view" },
    ],
  },
  {
    label: "Admin",
    items: [
      { href: "/admin/staff", label: "Staff", icon: Users, permission: "staff.view" },
      { href: "/admin/roles", label: "Roles", icon: Shield, permission: "staff.roles" },
      { href: "/admin/locations", label: "Locations", icon: MapPin, permission: "locations.manage" },
      { href: "/admin/audit", label: "Audit Log", icon: ScrollText, permission: "audit.view" },
      { href: "/admin/settings", label: "Settings", icon: Settings, permission: "settings.manage" },
    ],
  },
];

// ─── Sidebar nav item ─────────────────────────────────────────────────────────

function SideNavItem({ item, active, count = 0 }: { item: NavItem; active: boolean; count?: number }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-white/15 text-white"
          : "text-white/70 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="flex-1">{item.label}</span>
      {count > 0 && (
        <span
          className="shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none text-white"
          style={{ backgroundColor: "#E15A2C", minWidth: "18px", textAlign: "center" }}
          aria-label={`${count} new`}
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}

// ─── Location selector ────────────────────────────────────────────────────────

function LocationSelector({
  locations,
  activeLocationId,
  onSelect,
}: {
  locations: UserData["locations"];
  activeLocationId: string | "all" | null;
  onSelect: (id: string | "all") => void;
}) {
  const [open, setOpen] = useState(false);

  if (locations.length <= 1 && activeLocationId !== "all") {
    const loc = locations[0];
    if (!loc) return null;
    return (
      <div className="flex items-center gap-1.5 text-sm text-white/80">
        <MapPin className="h-3.5 w-3.5 text-accent shrink-0" aria-hidden="true" />
        <span className="truncate max-w-[160px]">{loc.name}</span>
      </div>
    );
  }

  const activeName =
    activeLocationId === "all" || activeLocationId === null
      ? "All Locations"
      : locations.find((l) => l.id === activeLocationId)?.name ?? "All Locations";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <MapPin className="h-3.5 w-3.5 text-accent shrink-0" aria-hidden="true" />
        <span className="truncate max-w-[140px]">{activeName}</span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-full mt-1 w-56 rounded-lg border border-white/10 bg-navy shadow-lg z-50"
          style={{ backgroundColor: "#1a2d4a" }}
        >
          <div className="p-1">
            <button
              role="option"
              aria-selected={activeLocationId === "all" || activeLocationId === null}
              onClick={() => { onSelect("all"); setOpen(false); }}
              className={`w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-left transition-colors ${
                activeLocationId === "all" || activeLocationId === null
                  ? "bg-white/15 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              All Locations
            </button>

            <div className="my-1 border-t border-white/10" />

            {locations.map((loc) => (
              <button
                key={loc.id}
                role="option"
                aria-selected={activeLocationId === loc.id}
                onClick={() => { onSelect(loc.id); setOpen(false); }}
                className={`w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-left transition-colors ${
                  activeLocationId === loc.id
                    ? "bg-white/15 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" />
                {loc.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main shell ───────────────────────────────────────────────────────────────

export function PortalShell({ user, children }: PortalShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeLocationId: string | "all" =
    (searchParams.get("loc") as string | null) ??
    (user.locations.length === 1 ? user.locations[0].id : "all");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [badgeCounts, setBadgeCounts] = useState<Record<string, number>>({});

  const fetchBadgeCounts = useCallback(async () => {
    try {
      const loc = activeLocationId === "all" ? "" : `?loc=${activeLocationId}`;
      const res = await fetch(`/api/portal/badge-counts${loc}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { contact: number; tradein: number; finance: number };
      setBadgeCounts({
        "/admin/requests/contact": data.contact,
        "/admin/requests/trade-in": data.tradein,
        "/admin/requests/finance": data.finance,
      });
    } catch {
      // silently ignore — badges will just show 0
    }
  }, [activeLocationId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBadgeCounts();
    const interval = setInterval(fetchBadgeCounts, 30_000);
    return () => clearInterval(interval);
  }, [fetchBadgeCounts]);

  const handleLocationSelect = (id: string | "all") => {
    const next = new URLSearchParams(searchParams.toString());
    if (id === "all") {
      next.delete("loc");
    } else {
      next.set("loc", id);
    }
    next.delete("page"); // reset pagination on location change
    const qs = next.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}`);
  };

  const permissions = user.role.permissions;

  const visibleGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) => !item.permission || hasPermission(permissions, item.permission as Permission)
    ),
  })).filter((group) => group.items.length > 0);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/admin/login" });
  };

  const sidebar = (
    <aside
      className="flex h-full flex-col"
      style={{ backgroundColor: "#142036" }}
    >
      {/* Logo */}
      <div className="flex h-14 items-center justify-between px-4 border-b border-white/10">
        <Link href="/admin" className="flex items-center gap-2 min-w-0">
          <span className="font-heading text-sm font-bold text-white leading-tight">
            Northbridge{" "}
            <span style={{ color: "#E15A2C" }}>Motors</span>
          </span>
        </Link>
        <span
          className="text-[10px] font-semibold uppercase tracking-widest shrink-0 px-2 py-0.5 rounded-md"
          style={{ color: "rgba(255,255,255,0.4)", backgroundColor: "rgba(255,255,255,0.07)" }}
        >
          Staff
        </span>
      </div>

      {/* Dashboard link */}
      <div className="px-3 pt-4 pb-2">
        <Link
          href="/admin"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            pathname === "/admin"
              ? "bg-white/15 text-white"
              : "text-white/70 hover:bg-white/10 hover:text-white"
          }`}
        >
          <LayoutDashboard className="h-4 w-4 shrink-0" aria-hidden="true" />
          Dashboard
        </Link>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Portal navigation">
        {visibleGroups.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-white/35">
              {group.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => (
                <SideNavItem
                  key={item.href}
                  item={item}
                  active={
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href)
                  }
                  count={badgeCounts[item.href] ?? 0}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-white/10 px-3 py-3">
        <Link
          href="/admin/account"
          className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/10 transition-colors group"
        >
          <UserCircle className="h-8 w-8 shrink-0 text-white/50 group-hover:text-white/80 transition-colors" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-white/50 truncate">{user.role.name}</p>
          </div>
        </Link>
        <button
          onClick={handleSignOut}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/60 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
          Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <ShortlistProvider>
      <div className="flex flex-col h-screen overflow-hidden" style={{ backgroundColor: "#F5F5F4" }}>
        {/* ── Client-facing site header ── */}
        <div className="shrink-0">
          <Header isAdmin />
        </div>

        {/* ── Portal body (sidebar + content) ── */}
        <div className="flex flex-1 overflow-hidden">
          {/* Desktop sidebar */}
          <div className="hidden lg:flex lg:flex-col lg:w-56 lg:shrink-0 lg:border-r lg:border-white/10">
            {sidebar}
          </div>

          {/* Mobile sidebar overlay */}
          {mobileSidebarOpen && (
            <div className="fixed inset-0 z-50 flex lg:hidden">
              <div
                className="fixed inset-0 bg-black/50"
                onClick={() => setMobileSidebarOpen(false)}
                aria-hidden="true"
              />
              <div className="relative w-56 flex flex-col">
                {sidebar}
              </div>
            </div>
          )}

          {/* Main content area */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Top header bar */}
            <header
              className="flex h-14 shrink-0 items-center justify-between border-b px-4 lg:px-6"
              style={{ backgroundColor: "#FFFFFF", borderColor: "#E4E5E8" }}
            >
              {/* Mobile hamburger */}
              <button
                className="lg:hidden text-gray-500 hover:text-gray-700"
                onClick={() => setMobileSidebarOpen(true)}
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Location selector */}
              <div className="flex items-center gap-3">
                {user.locations.length > 0 && (
                  <div
                    className="flex items-center gap-2 rounded-lg px-3 py-1.5"
                    style={{ backgroundColor: "#142036" }}
                  >
                    <LocationSelector
                      locations={user.locations}
                      activeLocationId={activeLocationId}
                      onSelect={handleLocationSelect}
                    />
                  </div>
                )}
              </div>

              {/* Right side — account link */}
              <Link
                href="/admin/account"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <UserCircle className="h-5 w-5" aria-hidden="true" />
                <span className="hidden sm:inline">{user.name}</span>
              </Link>
            </header>

            {/* Page content */}
            <main className="flex-1 overflow-auto p-4 lg:p-6">
              {children}
            </main>
          </div>
        </div>
      </div>
    </ShortlistProvider>
  );
}