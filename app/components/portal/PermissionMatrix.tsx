"use client";

import { useState } from "react";

// ─── Permission groups ────────────────────────────────────────────────────────

const GROUPS = [
  {
    label: "Contact Requests",
    permissions: [
      { key: "contact.view", label: "View" },
      { key: "contact.update", label: "Update / Assign" },
    ],
  },
  {
    label: "Trade-In Requests",
    permissions: [
      { key: "tradein.view", label: "View" },
      { key: "tradein.update", label: "Update / Assign" },
    ],
  },
  {
    label: "Finance Applications",
    permissions: [
      { key: "finance.view", label: "View" },
      { key: "finance.update", label: "Update / Assign" },
    ],
  },
  {
    label: "Inventory",
    permissions: [
      { key: "inventory.view", label: "View" },
      { key: "inventory.create", label: "Create" },
      { key: "inventory.edit", label: "Edit" },
      { key: "inventory.sold", label: "Mark Sold" },
      { key: "inventory.archive", label: "Archive" },
    ],
  },
  {
    label: "Staff",
    permissions: [
      { key: "staff.view", label: "View" },
      { key: "staff.invite", label: "Invite" },
      { key: "staff.edit", label: "Edit Role / Locations" },
      { key: "staff.deactivate", label: "Deactivate / Activate" },
      { key: "staff.roles", label: "Manage Roles" },
    ],
  },
  {
    label: "Locations",
    permissions: [
      { key: "locations.view", label: "View" },
      { key: "locations.manage", label: "Manage" },
      { key: "locations.viewall", label: "View All Locations" },
    ],
  },
  {
    label: "System",
    permissions: [
      { key: "audit.view", label: "View Audit Log" },
      { key: "settings.manage", label: "System Settings" },
    ],
  },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

interface PermissionMatrixProps {
  currentPermissions?: string[];
  disabled?: boolean;
}

export function PermissionMatrix({ currentPermissions = [], disabled = false }: PermissionMatrixProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(currentPermissions));

  function toggle(key: string) {
    if (disabled) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleGroup(keys: readonly string[], checked: boolean) {
    if (disabled) return;
    setSelected((prev) => {
      const next = new Set(prev);
      keys.forEach((k) => (checked ? next.add(k) : next.delete(k)));
      return next;
    });
  }

  return (
    <div className="space-y-4">
      {/* Hidden inputs for form submission */}
      {Array.from(selected).map((key) => (
        <input key={key} type="hidden" name="permissions" value={key} />
      ))}

      {GROUPS.map((group) => {
        const groupKeys = group.permissions.map((p) => p.key);
        const allChecked = groupKeys.every((k) => selected.has(k));
        const someChecked = groupKeys.some((k) => selected.has(k));

        return (
          <div
            key={group.label}
            className="rounded-xl border overflow-hidden"
            style={{ borderColor: "#E4E5E8" }}
          >
            {/* Group header */}
            <div
              className="flex items-center gap-3 px-4 py-2.5 border-b"
              style={{ borderColor: "#E4E5E8", backgroundColor: "#F9FAFB" }}
            >
              <input
                type="checkbox"
                id={`group-${group.label}`}
                checked={allChecked}
                ref={(el) => {
                  if (el) el.indeterminate = someChecked && !allChecked;
                }}
                onChange={(e) => toggleGroup(groupKeys, e.target.checked)}
                disabled={disabled}
                className="h-4 w-4 rounded cursor-pointer"
                style={{ accentColor: "#142036" }}
              />
              <label
                htmlFor={`group-${group.label}`}
                className={`text-xs font-semibold uppercase tracking-wide select-none ${disabled ? "" : "cursor-pointer"}`}
                style={{ color: "#5B5F6B" }}
              >
                {group.label}
              </label>
            </div>

            {/* Individual permissions */}
            <div className="divide-y" style={{ borderColor: "#F3F4F6" }}>
              {group.permissions.map((p) => (
                <div
                  key={p.key}
                  className={`flex items-center gap-3 px-4 py-2 ${!disabled ? "hover:bg-gray-50 cursor-pointer" : ""}`}
                  onClick={() => toggle(p.key)}
                >
                  <input
                    type="checkbox"
                    id={`perm-${p.key}`}
                    checked={selected.has(p.key)}
                    onChange={() => toggle(p.key)}
                    disabled={disabled}
                    className="h-4 w-4 rounded shrink-0"
                    style={{ accentColor: "#E15A2C" }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <label
                    htmlFor={`perm-${p.key}`}
                    className={`text-sm select-none ${disabled ? "" : "cursor-pointer"}`}
                    style={{ color: "#13151A" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {p.label}
                  </label>
                  <span className="ml-auto font-mono text-xs" style={{ color: "#9CA3AF" }}>
                    {p.key}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
