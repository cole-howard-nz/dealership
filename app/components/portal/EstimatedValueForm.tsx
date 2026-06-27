"use client";

import { useRef, useTransition, useState } from "react";
import { Check } from "lucide-react";

interface EstimatedValueFormProps {
  requestId: string;
  currentValue: number | null;
  updateAction: (
    id: string,
    value: number | null
  ) => Promise<{ error: string | null }>;
  canUpdate: boolean;
}

export function EstimatedValueForm({
  requestId,
  currentValue,
  updateAction,
  canUpdate,
}: EstimatedValueFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!canUpdate) {
    return (
      <p className="text-sm font-semibold" style={{ color: "#13151A" }}>
        {currentValue != null
          ? `$${currentValue.toLocaleString()} NZD`
          : "Not set"}
      </p>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const raw = inputRef.current?.value.trim();
    const value = raw ? parseInt(raw.replace(/[^0-9]/g, ""), 10) : null;

    if (raw && (isNaN(value!) || value! < 0)) {
      setError("Enter a valid dollar amount");
      return;
    }

    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateAction(requestId, value ?? null);
      if (result.error) {
        setError(result.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm"
            style={{ color: "#9CA3AF" }}
            aria-hidden="true"
          >
            $
          </span>
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            defaultValue={currentValue ?? ""}
            placeholder="0"
            disabled={isPending}
            className="w-full rounded-lg border py-2 pl-6 pr-3 text-sm outline-none focus:ring-2 disabled:opacity-60"
            style={{
              borderColor: "#E4E5E8",
              backgroundColor: "#ffffff",
              color: "#13151A",
            }}
            aria-label="Estimated value in NZD"
          />
        </div>
        <span className="text-xs shrink-0" style={{ color: "#9CA3AF" }}>
          NZD
        </span>
      </div>
      {error && (
        <p className="text-xs" style={{ color: "#DC2626" }}>
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-opacity disabled:opacity-60"
        style={{ backgroundColor: saved ? "#1F9D55" : "#142036" }}
      >
        {saved && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
        {isPending ? "Saving…" : saved ? "Saved" : "Save Estimate"}
      </button>
    </form>
  );
}
