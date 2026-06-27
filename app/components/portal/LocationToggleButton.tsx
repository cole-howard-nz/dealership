"use client";

import { useTransition, useState } from "react";
import { Loader2 } from "lucide-react";

interface LocationToggleButtonProps {
  locationId: string;
  isActive: boolean;
  deactivateAction: (id: string) => Promise<{ error: string | null }>;
  activateAction: (id: string) => Promise<{ error: string | null }>;
}

export function LocationToggleButton({ locationId, isActive: initialActive, deactivateAction, activateAction }: LocationToggleButtonProps) {
  const [isActive, setIsActive] = useState(initialActive);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleToggle() {
    const confirmed = confirm(
      isActive
        ? "Deactivate this location? It will be hidden from new assignments."
        : "Reactivate this location?"
    );
    if (!confirmed) return;
    setError(null);
    startTransition(async () => {
      const result = isActive
        ? await deactivateAction(locationId)
        : await activateAction(locationId);
      if (result.error) setError(result.error);
      else setIsActive(!isActive);
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
        style={{ backgroundColor: isActive ? "#DC2626" : "#15803D" }}
      >
        {isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {isActive ? "Deactivate Location" : "Activate Location"}
      </button>
      {error && <p className="mt-2 text-sm" style={{ color: "#DC2626" }}>{error}</p>}
    </div>
  );
}
