/**
 * Northbridge Motors — Staff Portal
 * Permission catalogue & types
 */

// ─── Permission keys ──────────────────────────────────────────────────────────

export const PERMISSIONS = {
  // Contact requests
  CONTACT_VIEW: "contact.view",
  CONTACT_UPDATE: "contact.update",
  // Trade-in requests
  TRADEIN_VIEW: "tradein.view",
  TRADEIN_UPDATE: "tradein.update",
  // Finance applications
  FINANCE_VIEW: "finance.view",
  FINANCE_UPDATE: "finance.update",
  // Test drive bookings
  TESTDRIVE_VIEW: "testdrive.view",
  TESTDRIVE_UPDATE: "testdrive.update",
  // Inventory
  INVENTORY_VIEW: "inventory.view",
  INVENTORY_CREATE: "inventory.create",
  INVENTORY_EDIT: "inventory.edit",
  INVENTORY_SOLD: "inventory.sold",
  INVENTORY_ARCHIVE: "inventory.archive",
  // Staff management
  STAFF_VIEW: "staff.view",
  STAFF_INVITE: "staff.invite",
  STAFF_EDIT: "staff.edit",
  STAFF_DEACTIVATE: "staff.deactivate",
  STAFF_ROLES: "staff.roles",
  // Locations
  LOCATIONS_VIEW: "locations.view",
  LOCATIONS_MANAGE: "locations.manage",
  LOCATIONS_VIEWALL: "locations.viewall",
  // System
  AUDIT_VIEW: "audit.view",
  SETTINGS_MANAGE: "settings.manage",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// ─── Navigation items (used by sidebar) ──────────────────────────────────────

export interface NavItem {
  href: string;
  label: string;
  permission?: Permission;
  icon?: string; // lucide icon name
  group?: string;
}

export const PORTAL_NAV: NavItem[] = [
  // Requests
  { href: "/admin/requests/contact", label: "Contact Requests", permission: "contact.view", group: "requests" },
  { href: "/admin/requests/trade-in", label: "Trade-In Requests", permission: "tradein.view", group: "requests" },
  { href: "/admin/requests/finance", label: "Finance Applications", permission: "finance.view", group: "requests" },
  { href: "/admin/requests/test-drive", label: "Test Drive Bookings", permission: "testdrive.view", group: "requests" },
  // Operations
  { href: "/admin/inventory", label: "Inventory", permission: "inventory.view", group: "operations" },
  // Staff & system
  { href: "/admin/staff", label: "Staff", permission: "staff.view", group: "admin" },
  { href: "/admin/roles", label: "Roles", permission: "staff.roles", group: "admin" },
  { href: "/admin/locations", label: "Locations", permission: "locations.manage", group: "admin" },
  { href: "/admin/audit", label: "Audit Log", permission: "audit.view", group: "admin" },
  { href: "/admin/settings", label: "Settings", permission: "settings.manage", group: "admin" },
];

// ─── Permission helpers ───────────────────────────────────────────────────────

/**
 * Check if a permissions array includes the required permission.
 * Also returns true if the permissions array includes a system-level "all" marker
 * — in practice this is handled by the Owner role holding every key.
 */
export function hasPermission(
  userPermissions: string[],
  required: Permission
): boolean {
  return userPermissions.includes(required);
}

/**
 * Check if a permissions array includes ALL of the required permissions.
 */
export function hasAllPermissions(
  userPermissions: string[],
  required: Permission[]
): boolean {
  return required.every((p) => userPermissions.includes(p));
}

/**
 * Check if a permissions array includes ANY of the required permissions.
 */
export function hasAnyPermission(
  userPermissions: string[],
  required: Permission[]
): boolean {
  return required.some((p) => userPermissions.includes(p));
}
