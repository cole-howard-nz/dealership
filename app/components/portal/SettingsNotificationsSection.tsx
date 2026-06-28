"use client";

import { useTransition, useState } from "react";

interface LocationRow {
  id: string;
  name: string;
  email: string | null;
  notifyOnNewRequest: boolean;
}

interface Props {
  locations: LocationRow[];
  toggleAction: (locationId: string, enabled: boolean) => Promise<{ error: string | null }>;
}

export function SettingsNotificationsSection({ locations, toggleAction }: Props) {
  const [isPending, startTransition] = useTransition();
  const [states, setStates] = useState<Record<string, boolean>>(
    Object.fromEntries(locations.map((l) => [l.id, l.notifyOnNewRequest]))
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleToggle(locationId: string, newValue: boolean) {
    setStates((prev) => ({ ...prev, [locationId]: newValue }));
    startTransition(async () => {
      const result = await toggleAction(locationId, newValue);
      if (result.error) {
        setStates((prev) => ({ ...prev, [locationId]: !newValue }));
        setErrors((prev) => ({ ...prev, [locationId]: result.error! }));
      } else {
        setErrors((prev) => { const n = { ...prev }; delete n[locationId]; return n; });
      }
    });
  }

  return (
    <div className="divide-y" style={{ borderColor: "#F3F4F6" }}>
      {locations.length === 0 && (
        <p className="px-5 py-4 text-sm" style={{ color: "#5B5F6B" }}>No locations configured.</p>
      )}
      {locations.map((loc) => (
        <div key={loc.id} className="px-5 py-4 flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: "#13151A" }}>{loc.name}</p>
            {loc.email ? (
              <p className="text-xs mt-0.5" style={{ color: "#5B5F6B" }}>{loc.email}</p>
            ) : (
              <p className="text-xs mt-0.5 italic" style={{ color: "#9CA3AF" }}>
                No email set — edit in Locations to enable inbox notifications
              </p>
            )}
            {errors[loc.id] && (
              <p className="text-xs mt-1" style={{ color: "#B91C1C" }}>{errors[loc.id]}</p>
            )}
          </div>

          {/* Toggle switch */}
          <button
            type="button"
            role="switch"
            aria-checked={states[loc.id]}
            aria-label={`Notify ${loc.name} on new requests`}
            disabled={isPending || !loc.email}
            onClick={() => handleToggle(loc.id, !states[loc.id])}
            className="relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-navy/30 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: states[loc.id] && loc.email ? "#142036" : "#D1D5DB" }}
          >
            <span
              className="inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform"
              style={{ transform: states[loc.id] && loc.email ? "translateX(20px)" : "translateX(0)" }}
            />
          </button>
        </div>
      ))}

      <div className="px-5 py-3" style={{ backgroundColor: "#F9FAFB" }}>
        <p className="text-xs" style={{ color: "#5B5F6B" }}>
          Individual staff members can also opt out of notifications in{" "}
          <a href="/admin/account" className="underline">My Account</a>.
        </p>
      </div>
    </div>
  );
}
