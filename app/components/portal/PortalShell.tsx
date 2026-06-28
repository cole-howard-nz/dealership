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
  Menu,
  ChevronDown,
  CalendarCheck,
} from "lucide-react";
import { hasPermission, type Permission } from "../../lib/permissions";

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
      { href: "/admin/requests/contact", label: "Contact", icon: MessageSquare, permission: "contact.view", badge: true },
      { href: "/admin/requests/trade-in", label: "Trade-In", icon: Car, permission: "tradein.view", badge: true },
      { href: "/admin/requests/finance", label: "Finance", icon: CreditCard, permission: "finance.view", badge: true },
      { href: "/admin/requests/test-drive", label: "Test Drives", icon: CalendarCheck, permission: "testdrive.view", badge: true },
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
  expanded,
  onToggleExpanded,
}: {
  locations: UserData["locations"];
  activeLocationId: string | "all" | null;
  onSelect: (id: string | "all") => void;
  expanded: boolean;
  onToggleExpanded: () => void;
}) {

  if (locations.length <= 1 && activeLocationId !== "all") {
    const loc = locations[0];
    if (!loc) return null;
    return (
      <div className="flex items-center gap-2 px-3 py-2.5">
        <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color: "#E15A2C" }} aria-hidden="true" />
        <span className="text-xs font-medium text-white/80 truncate">{loc.name}</span>
      </div>
    );
  }

  const allLocs: Array<{ id: string | "all"; name: string }> = [
    { id: "all", name: "All Locations" },
    ...locations,
  ];

  const activeLoc = allLocs.find(
    (l) => l.id === activeLocationId || (l.id === "all" && (activeLocationId === "all" || activeLocationId === null))
  ) ?? allLocs[0];

  return (
    <div className="px-2 py-1">
      {/* Toggle header */}
      <button
        onClick={onToggleExpanded}
        className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-left transition-colors hover:bg-white/10"
      >
        <MapPin className="h-3 w-3 shrink-0" style={{ color: "#E15A2C" }} aria-hidden="true" />
        <span className="flex-1 truncate font-medium text-white/80">{activeLoc?.name}</span>
        <ChevronDown
          className="h-3 w-3 shrink-0 transition-transform duration-200"
          style={{ color: "rgba(255,255,255,0.4)", transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
          aria-hidden="true"
        />
      </button>

      {/* Expanded list */}
      {expanded && (
        <div className="mt-0.5 flex flex-col gap-0.5">
          {allLocs.map((loc) => {
            const isActive = loc.id === activeLocationId || (loc.id === "all" && (activeLocationId === "all" || activeLocationId === null));
            return (
              <button
                key={loc.id}
                onClick={() => onSelect(loc.id)}
                className={`w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-left transition-colors ${
                  isActive ? "bg-white/15 text-white font-semibold" : "text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                <MapPin className="h-3 w-3 shrink-0" style={{ color: isActive ? "#E15A2C" : "rgba(255,255,255,0.3)" }} aria-hidden="true" />
                <span className="truncate">{loc.name}</span>
                {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: "#E15A2C" }} />}
              </button>
            );
          })}
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
  const [locSelectorExpanded, setLocSelectorExpanded] = useState(true);
  const [badgeCounts, setBadgeCounts] = useState<Record<string, number>>({});

  const fetchBadgeCounts = useCallback(async () => {
    try {
      const loc = activeLocationId === "all" ? "" : `?loc=${activeLocationId}`;
      const res = await fetch(`/api/portal/badge-counts${loc}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { contact: number; tradein: number; finance: number; testdrive: number };
      setBadgeCounts({
        "/admin/requests/contact": data.contact,
        "/admin/requests/trade-in": data.tradein,
        "/admin/requests/finance": data.finance,
        "/admin/requests/test-drive": data.testdrive,
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

      {/* Location selector in sidebar */}
      {user.locations.length > 0 && (
        <div className="px-3 pt-3 pb-1">
          <div className="rounded-lg overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <LocationSelector
              locations={user.locations}
              activeLocationId={activeLocationId}
              onSelect={handleLocationSelect}
              expanded={locSelectorExpanded}
              onToggleExpanded={() => setLocSelectorExpanded((v) => !v)}
            />
          </div>
        </div>
      )}

      {/* Dashboard link */}
      <div className="px-3 pt-3 pb-2">
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
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#F5F5F4" }}>
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
              className="flex h-12 shrink-0 items-center justify-between border-b px-4 lg:px-6"
              style={{ backgroundColor: "#FFFFFF", borderColor: "#E4E5E8" }}
            >
              {/* Mobile hamburger */}
              <button
                className="lg:hidden text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setMobileSidebarOpen(true)}
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Public site links — desktop */}
              <nav className="hidden lg:flex items-center gap-0.5" aria-label="Public site">
                {[
                  { href: "/inventory", label: "Inventory" },
                  { href: "/finance", label: "Finance" },
                  { href: "/trade-in", label: "Trade-In" },
                  { href: "/about", label: "About" },
                  { href: "/contact", label: "Contact" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-3 py-1.5 rounded-lg text-sm transition-colors hover:bg-gray-50"
                    style={{ color: "#5B5F6B" }}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Right side — account link */}
              <Link
                href="/admin/account"
                className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors hover:bg-gray-50"
                style={{ color: "#5B5F6B" }}
              >
                <div
                  className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                  style={{ backgroundColor: "#142036" }}
                  aria-hidden="true"
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
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
  );
}